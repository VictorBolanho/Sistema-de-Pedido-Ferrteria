const db = require("../../config/database");

async function findAdvisorById(advisorId) {
  const result = await db.query(
    `
      SELECT a.id, a.user_id
      FROM advisors a
      WHERE a.id = $1
      LIMIT 1
    `,
    [advisorId]
  );
  return result.rows[0] || null;
}

async function findAdvisorByUserId(userId) {
  const result = await db.query(
    `
      SELECT a.id, a.user_id
      FROM advisors a
      WHERE a.user_id = $1
      LIMIT 1
    `,
    [userId]
  );
  return result.rows[0] || null;
}

async function createClient(client, dbClient = db) {
  const result = await dbClient.query(
    `
      INSERT INTO clients (business_name, tax_id, contact_name, phone, advisor_id, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, business_name, tax_id, contact_name, phone, advisor_id, status, created_at, updated_at
    `,
    [
      client.businessName,
      client.taxId,
      client.contactName,
      client.phone || null,
      client.advisorId,
      client.status,
    ]
  );

  return result.rows[0];
}

async function insertAdvisorHistory(history, dbClient = db) {
  await dbClient.query(
    `
      INSERT INTO historial_asesores (client_id, advisor_id, assigned_by_user_id, reason)
      VALUES ($1, $2, $3, $4)
    `,
    [history.clientId, history.advisorId, history.assignedByUserId || null, history.reason || null]
  );
}

async function listClients() {
  const result = await db.query(`
    SELECT
      c.id,
      c.business_name,
      c.tax_id,
      c.contact_name,
      c.phone,
      c.status,
      c.advisor_id,
      c.created_at,
      c.updated_at,
      a.first_name AS advisor_first_name,
      a.last_name AS advisor_last_name
    FROM clients c
    INNER JOIN advisors a ON a.id = c.advisor_id
    ORDER BY c.created_at DESC
  `);

  return result.rows;
}

async function listClientsByAdvisorId(advisorId) {
  const result = await db.query(`
    SELECT
      c.id,
      c.business_name,
      c.tax_id,
      c.contact_name,
      c.phone,
      c.status,
      c.advisor_id,
      c.created_at,
      c.updated_at,
      a.first_name AS advisor_first_name,
      a.last_name AS advisor_last_name
    FROM clients c
    INNER JOIN advisors a ON a.id = c.advisor_id
    WHERE c.advisor_id = $1
    ORDER BY c.created_at DESC
  `, [advisorId]);

  return result.rows;
}

async function findClientById(clientId) {
  const result = await db.query(
    `
      SELECT
        c.id,
        c.business_name,
        c.tax_id,
        c.contact_name,
        c.phone,
        c.status,
        c.advisor_id,
        c.created_at,
        c.updated_at,
        a.first_name AS advisor_first_name,
        a.last_name AS advisor_last_name
      FROM clients c
      INNER JOIN advisors a ON a.id = c.advisor_id
      WHERE c.id = $1
      LIMIT 1
    `,
    [clientId]
  );

  return result.rows[0] || null;
}

async function updateClientAdvisor(clientId, advisorId, dbClient = db) {
  const result = await dbClient.query(
    `
      UPDATE clients
      SET advisor_id = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, business_name, tax_id, contact_name, phone, status, advisor_id, created_at, updated_at
    `,
    [advisorId, clientId]
  );
  return result.rows[0] || null;
}

module.exports = {
  findAdvisorById,
  findAdvisorByUserId,
  createClient,
  insertAdvisorHistory,
  listClients,
  findClientById,
  updateClientAdvisor,
};

