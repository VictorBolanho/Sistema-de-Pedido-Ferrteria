const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authModel = require("./auth.model");
const db = require("../../config/database");
const env = require("../../config/env");
const HttpError = require("../../utils/http-error");

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

async function createAdvisor({ email, password }) {
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
        firstName: "Advisor",
        lastName: normalizedEmail.split("@")[0] || "Advisor",
      },
      client
    );
    await client.query("COMMIT");

    const createdUser = sanitizeUser(createdAdvisor);
    return {
      ...createdUser,
      advisorId: createdProfile.id,
      advisorUserId: createdAdvisor.id,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("[AUTH] Error creating advisor:", error.message);
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
    firstName: advisor.first_name,
    lastName: advisor.last_name,
    createdAt: advisor.created_at,
    updatedAt: advisor.updated_at,
  }));
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

  const client = await db.getClient();
  try {
    await client.query("BEGIN");
    await authModel.unassignClientsFromAdvisor(advisorId, client);
    await authModel.deleteAdvisorById(advisorId, client);
    await authModel.deleteUserById(advisor.user_id, client);
    await client.query("COMMIT");

    return { id: advisorId, userId: advisor.user_id };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("[AUTH] Error deleting advisor:", error.message);
    throw new HttpError(500, "Unable to delete advisor");
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
  deleteAdvisor,
};

