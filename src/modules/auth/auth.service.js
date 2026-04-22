const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const authModel = require("./auth.model");
const db = require("../../config/database");
const env = require("../../config/env");
const HttpError = require("../../utils/http-error");
const logger = require("../../utils/logger");

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.is_active,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

function buildAuthResponse(user) {
  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  return {
    token,
    user: sanitizeUser(user),
  };
}

async function login({ email, password }) {
  const user = await authModel.findUserByEmail(email);
  if (!user) {
    throw new HttpError(401, "Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new HttpError(401, "Invalid credentials");
  }

  if (!user.is_active) {
    throw new HttpError(403, "User is inactive");
  }

  return buildAuthResponse(user);
}

async function getMe(userId) {
  const user = await authModel.findUserById(userId);
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  return sanitizeUser(user);
}

async function bootstrapAdmin({ email, password, bootstrapToken }) {
  if (!env.bootstrapAdminToken || bootstrapToken !== env.bootstrapAdminToken) {
    throw new HttpError(403, "Invalid bootstrap token");
  }

  const adminCount = await authModel.countAdminUsers();
  if (adminCount > 0) {
    throw new HttpError(409, "Admin already exists");
  }

  const existingUser = await authModel.findUserByEmail(email);
  if (existingUser) {
    throw new HttpError(409, "Email already in use");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const createdAdmin = await authModel.createAdminUser({
    email,
    passwordHash,
  });

  return buildAuthResponse(createdAdmin);
}

async function createAdvisor({ email, password, firstName, lastName }) {
  if (!email || !password) {
    throw new HttpError(400, "Email and password are required");
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const existingUser = await authModel.findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new HttpError(409, "Email already in use");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const client = await db.getClient();

  try {
    await client.query("BEGIN");
    const createdAdvisor = await authModel.createAdvisorUser(
      { email: normalizedEmail, passwordHash },
      client
    );
    const createdProfile = await authModel.createAdvisorProfile(
      {
        userId: createdAdvisor.id,
        firstName: firstName ? String(firstName).trim() : "Advisor",
        lastName: lastName ? String(lastName).trim() : normalizedEmail.split("@")[0] || "Advisor",
      },
      client
    );
    await client.query("COMMIT");

    logger.info({ advisorId: createdProfile.id, userId: createdAdvisor.id }, "Advisor account created");
    const createdUser = sanitizeUser(createdAdvisor);
    return {
      ...createdUser,
      advisorId: createdProfile.id,
      advisorUserId: createdAdvisor.id,
      firstName: createdProfile.first_name,
      lastName: createdProfile.last_name,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error({ err: error, email: normalizedEmail }, "Error creating advisor");
    if (error.code === "23505") {
      throw new HttpError(409, "Email already in use");
    }
    throw new HttpError(500, "Unable to create advisor");
  } finally {
    client.release();
  }
}

async function getAdvisors() {
  const advisors = await authModel.listAdvisors();
  return advisors.map((advisor) => ({
    id: advisor.id,
    email: advisor.email,
    isActive: advisor.is_active,
    firstName: advisor.first_name,
    lastName: advisor.last_name,
    createdAt: advisor.created_at,
    updatedAt: advisor.updated_at,
  }));
}

async function updateAdvisorStatus(advisorId, isActive) {
  const advisor = await authModel.findAdvisorProfileById(advisorId);
  if (!advisor) {
    throw new HttpError(404, "Advisor not found");
  }

  const updatedUser = await authModel.updateUserActiveStatus(advisor.user_id, isActive);
  return {
    id: advisor.id,
    userId: advisor.user_id,
    email: updatedUser.email,
    isActive: updatedUser.is_active,
  };
}

async function deleteAdvisor(advisorId) {
  const advisor = await authModel.findAdvisorProfileById(advisorId);
  if (!advisor) {
    throw new HttpError(404, "Advisor not found");
  }

  const orderCount = await authModel.countAdvisorOrders(advisorId);
  if (orderCount > 0) {
    throw new HttpError(
      409,
      "Advisor cannot be deleted while there are existing orders assigned"
    );
  }

  const clientCount = await authModel.countAdvisorClients(advisorId);
  if (clientCount > 0) {
    throw new HttpError(
      409,
      "Advisor cannot be deleted while there are active client assignments"
    );
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");
    await authModel.deleteAdvisorById(advisorId, client);
    await authModel.deleteUserById(advisor.user_id, client);
    await client.query("COMMIT");

    logger.info({ advisorId, userId: advisor.user_id }, "Advisor deleted");
    return { id: advisorId, userId: advisor.user_id };
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error({ err: error, advisorId }, "Error deleting advisor");
    throw new HttpError(500, "Unable to delete advisor");
  } finally {
    client.release();
  }
}

async function requestPasswordReset({ email }) {
  const normalizedEmail = String(email).toLowerCase().trim();
  const user = await authModel.findUserByEmail(normalizedEmail);

  if (!user) {
    return {
      message: "If the email exists, a recovery code has been generated.",
      recoveryPreview: null,
    };
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");
    await authModel.invalidatePasswordResetTokensForUser(user.id, client);

    const resetCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await authModel.createPasswordResetToken(
      {
        userId: user.id,
        resetCode,
        expiresAt,
      },
      client
    );

    await client.query("COMMIT");
    logger.info({ userId: user.id, email: normalizedEmail }, "Password reset code created");

    return {
      message: "Recovery code generated successfully.",
      recoveryPreview: {
        email: normalizedEmail,
        resetCode,
        expiresAt,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error({ err: error, email: normalizedEmail }, "Error requesting password reset");
    throw new HttpError(500, "Unable to generate recovery code");
  } finally {
    client.release();
  }
}

async function resetPassword({ email, resetCode, newPassword }) {
  const normalizedEmail = String(email).toLowerCase().trim();
  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    const token = await authModel.findValidPasswordResetToken(
      normalizedEmail,
      String(resetCode).trim(),
      client
    );
    if (!token) {
      throw new HttpError(400, "Invalid or expired recovery code");
    }

    const passwordHash = await bcrypt.hash(String(newPassword), 10);
    await authModel.updateUserPassword(token.user_id, passwordHash, client);
    await authModel.markPasswordResetTokenUsed(token.id, client);
    await authModel.invalidatePasswordResetTokensForUser(token.user_id, client);

    await client.query("COMMIT");
    return { message: "Password updated successfully." };
  } catch (error) {
    await client.query("ROLLBACK");
    if (error instanceof HttpError) {
      throw error;
    }
    logger.error({ err: error, email: normalizedEmail }, "Error resetting password");
    throw new HttpError(500, "Unable to reset password");
  } finally {
    client.release();
  }
}

module.exports = {
  login,
  getMe,
  bootstrapAdmin,
  createAdvisor,
  getAdvisors,
  updateAdvisorStatus,
  deleteAdvisor,
  requestPasswordReset,
  resetPassword,
};
