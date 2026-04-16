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

async function createAdvisorUser({ email, passwordHash }, client = db) {
  const result = await client.query(
    `
      INSERT INTO users (email, password_hash, role, is_active)
      VALUES ($1, $2, 'advisor', TRUE)
      RETURNING id, email, role, is_active, created_at, updated_at
    `,
    [email.toLowerCase(), passwordHash]
  );

  return result.rows[0];
}

async function createAdvisorProfile({ userId, firstName, lastName }, client = db) {
  const result = await client.query(
    `
      INSERT INTO advisors (user_id, first_name, last_name)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, first_name, last_name, created_at, updated_at
    `,
    [userId, firstName || "Advisor", lastName || "User"]
  );
  return result.rows[0];
}

async function listAdvisors() {
  const result = await db.query(
    `
      SELECT a.id, u.email, a.first_name, a.last_name, a.created_at, a.updated_at
      FROM advisors a
      INNER JOIN users u ON u.id = a.user_id
      ORDER BY a.created_at DESC
    `
  );
  return result.rows;
}

async function findAdvisorProfileById(advisorId) {
  const result = await db.query(
    `
      SELECT a.id, a.user_id, u.email
      FROM advisors a
      INNER JOIN users u ON u.id = a.user_id
      WHERE a.id = $1
      LIMIT 1
    `,
    [advisorId]
  );
  return result.rows[0] || null;
}

async function countAdvisorOrders(advisorId) {
  const result = await db.query(
    `
      SELECT COUNT(*)::INTEGER AS total
      FROM orders
      WHERE advisor_id = $1
    `,
    [advisorId]
  );
  return result.rows[0].total;
}

async function unassignClientsFromAdvisor(advisorId, client = db) {
  await client.query(
    `
      UPDATE clients
      SET advisor_id = NULL, updated_at = NOW()
      WHERE advisor_id = $1
    `,
    [advisorId]
  );
}

async function deleteAdvisorById(advisorId, client = db) {
  const result = await client.query(
    `
      DELETE FROM advisors
      WHERE id = $1
      RETURNING id, user_id
    `,
    [advisorId]
  );
  return result.rows[0] || null;
}

async function deleteUserById(userId, client = db) {
  const result = await client.query(
    `
      DELETE FROM users
      WHERE id = $1
      RETURNING id, email, role
    `,
    [userId]
  );
  return result.rows[0] || null;
}

module.exports = {
  findUserByEmail,
  findUserById,
  countAdminUsers,
  createAdminUser,
  createAdvisorUser,
  createAdvisorProfile,
  listAdvisors,
  findAdvisorProfileById,
  countAdvisorOrders,
  unassignClientsFromAdvisor,
  deleteAdvisorById,
  deleteUserById,
};

