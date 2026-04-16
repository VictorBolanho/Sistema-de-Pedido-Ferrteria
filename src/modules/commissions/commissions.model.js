const db = require("../../config/database");

async function createCommission(commission, dbClient = db) {
  const result = await dbClient.query(
    `
      INSERT INTO commissions (order_id, advisor_id, percentage, value)
      VALUES ($1, $2, $3, $4)
      RETURNING id, order_id, advisor_id, percentage, value, created_at, updated_at
    `,
    [
      commission.orderId,
      commission.advisorId,
      commission.percentage,
      commission.value,
    ]
  );

  return result.rows[0];
}

async function listCommissions() {
  const result = await db.query(`
    SELECT id, order_id, advisor_id, percentage, value, created_at, updated_at
    FROM commissions
    ORDER BY created_at DESC
  `);
  return result.rows;
}

async function listCommissionsByAdvisorId(advisorId) {
  const result = await db.query(
    `
      SELECT id, order_id, advisor_id, percentage, value, created_at, updated_at
      FROM commissions
      WHERE advisor_id = $1
      ORDER BY created_at DESC
    `,
    [advisorId]
  );
  return result.rows;
}

async function findAdvisorByUserId(userId) {
  const result = await db.query(
    `
      SELECT id, user_id
      FROM advisors
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );
  return result.rows[0] || null;
}

module.exports = {
  createCommission,
  listCommissions,
  listCommissionsByAdvisorId,
  findAdvisorByUserId,
};

