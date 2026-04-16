const db = require("../../config/database");

async function findUserByEmail(email) {
  const result = await db.query(
    `
      SELECT id, email, password_hash, role, is_active, created_at, updated_at
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email.toLowerCase()]
  );

  return result.rows[0] || null;
}

async function findUserById(id) {
  const result = await db.query(
    `
      SELECT id, email, role, is_active, created_at, updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

async function countAdminUsers() {
  const result = await db.query(
    "SELECT COUNT(*)::INTEGER AS total FROM users WHERE role = 'admin'"
  );
  return result.rows[0].total;
}

async function createAdminUser({ email, passwordHash }) {
  const result = await db.query(
    `
      INSERT INTO users (email, password_hash, role, is_active)
      VALUES ($1, $2, 'admin', TRUE)
      RETURNING id, email, role, is_active, created_at, updated_at
    `,
    [email.toLowerCase(), passwordHash]
  );

  return result.rows[0];
}

module.exports = {
  findUserByEmail,
  findUserById,
  countAdminUsers,
  createAdminUser,
};

