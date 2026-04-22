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
      SELECT a.id, u.email, u.is_active, a.first_name, a.last_name, a.created_at, a.updated_at
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
      SELECT a.id, a.user_id, u.email, u.is_active
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

async function countAdvisorClients(advisorId, client = db) {
  const result = await client.query(
    `
      SELECT COUNT(*)::INTEGER AS total
      FROM clients
      WHERE advisor_id = $1
    `,
    [advisorId]
  );
  return result.rows[0].total;
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

async function updateUserActiveStatus(userId, isActive, client = db) {
  const result = await client.query(
    `
      UPDATE users
      SET is_active = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, role, is_active, created_at, updated_at
    `,
    [isActive, userId]
  );
  return result.rows[0] || null;
}

async function createPasswordResetToken({ userId, resetCode, expiresAt }, client = db) {
  const result = await client.query(
    `
      INSERT INTO password_reset_tokens (user_id, reset_code, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, reset_code, expires_at, used_at, created_at
    `,
    [userId, resetCode, expiresAt]
  );
  return result.rows[0];
}

async function invalidatePasswordResetTokensForUser(userId, client = db) {
  await client.query(
    `
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE user_id = $1 AND used_at IS NULL
    `,
    [userId]
  );
}

async function findValidPasswordResetToken(email, resetCode, client = db) {
  const result = await client.query(
    `
      SELECT
        prt.id,
        prt.user_id,
        prt.reset_code,
        prt.expires_at,
        prt.used_at,
        u.email
      FROM password_reset_tokens prt
      INNER JOIN users u ON u.id = prt.user_id
      WHERE u.email = $1
        AND prt.reset_code = $2
        AND prt.used_at IS NULL
        AND prt.expires_at > NOW()
      ORDER BY prt.created_at DESC
      LIMIT 1
    `,
    [email.toLowerCase(), resetCode]
  );
  return result.rows[0] || null;
}

async function markPasswordResetTokenUsed(tokenId, client = db) {
  const result = await client.query(
    `
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE id = $1
      RETURNING id
    `,
    [tokenId]
  );
  return result.rows[0] || null;
}

async function updateUserPassword(userId, passwordHash, client = db) {
  const result = await client.query(
    `
      UPDATE users
      SET password_hash = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, role, is_active, created_at, updated_at
    `,
    [passwordHash, userId]
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
  countAdvisorClients,
  deleteAdvisorById,
  deleteUserById,
  updateUserActiveStatus,
  createPasswordResetToken,
  invalidatePasswordResetTokensForUser,
  findValidPasswordResetToken,
  markPasswordResetTokenUsed,
  updateUserPassword,
};
