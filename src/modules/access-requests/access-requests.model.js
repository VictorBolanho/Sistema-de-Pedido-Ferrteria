const db = require("../../config/database");

async function createAccessRequest(data) {
  const result = await db.query(
    `INSERT INTO access_requests (
      company_name, tax_id, contact_name, email, phone, address,
      rut_file_url, chamber_file_url, id_file_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      data.company_name,
      data.tax_id,
      data.contact_name,
      data.email,
      data.phone,
      data.address,
      data.rut_file_url || null,
      data.chamber_file_url || null,
      data.id_file_url || null,
    ]
  );
  return result.rows[0];
}

async function getAccessRequestById(id) {
  const result = await db.query(
    `SELECT * FROM access_requests WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function getAccessRequests(filters = {}) {
  let query = "SELECT * FROM access_requests WHERE 1=1";
  const params = [];
  let paramIndex = 1;

  if (filters.status) {
    query += ` AND status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  query += " ORDER BY created_at DESC";

  const result = await db.query(query, params);
  console.log("Access requests:", result.rows);
  return result.rows;
}

async function updateAccessRequestStatus(id, status, adminNotes = null) {
  const result = await db.query(
    `UPDATE access_requests 
     SET status = $1, admin_notes = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [status, adminNotes, id]
  );
  return result.rows[0] || null;
}

module.exports = {
  createAccessRequest,
  getAccessRequestById,
  getAccessRequests,
  updateAccessRequestStatus,
};
