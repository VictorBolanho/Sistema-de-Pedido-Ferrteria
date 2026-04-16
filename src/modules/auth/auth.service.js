const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authModel = require("./auth.model");
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

module.exports = {
  login,
  getMe,
  bootstrapAdmin,
};

