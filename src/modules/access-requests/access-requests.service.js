const bcrypt = require("bcryptjs");
const accessRequestsModel = require("./access-requests.model");
const HttpError = require("../../utils/http-error");
const db = require("../../config/database");

const VALID_STATUSES = new Set(["pending", "approved", "rejected"]);

function mapAccessRequest(request) {
  return {
    id: request.id,
    companyName: request.company_name,
    taxId: request.tax_id,
    contactName: request.contact_name,
    email: request.email,
    phone: request.phone,
    address: request.address,
    rutFileUrl: request.rut_file_url,
    chamberFileUrl: request.chamber_file_url,
    idFileUrl: request.id_file_url,
    status: request.status,
    adminNotes: request.admin_notes,
    createdAt: request.created_at,
    updatedAt: request.updated_at,
  };
}

function validateCreatePayload(payload) {
  if (!payload.company_name || !payload.company_name.trim()) {
    throw new HttpError(400, "company_name is required");
  }
  if (!payload.tax_id || !payload.tax_id.trim()) {
    throw new HttpError(400, "tax_id is required");
  }
  if (!payload.contact_name || !payload.contact_name.trim()) {
    throw new HttpError(400, "contact_name is required");
  }
  if (!payload.email || !payload.email.trim()) {
    throw new HttpError(400, "email is required");
  }
  if (!payload.phone || !payload.phone.trim()) {
    throw new HttpError(400, "phone is required");
  }
  if (!payload.address || !payload.address.trim()) {
    throw new HttpError(400, "address is required");
  }

  const email = payload.email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new HttpError(400, "Invalid email format");
  }

  return {
    company_name: payload.company_name.trim(),
    tax_id: payload.tax_id.trim(),
    contact_name: payload.contact_name.trim(),
    email: email,
    phone: payload.phone.trim(),
    address: payload.address.trim(),
    rut_file_url: payload.rut_file_url || null,
    chamber_file_url: payload.chamber_file_url || null,
    id_file_url: payload.id_file_url || null,
  };
}

async function submitAccessRequest(payload) {
  const normalized = validateCreatePayload(payload);

  try {
    const created = await accessRequestsModel.createAccessRequest(normalized);
    return mapAccessRequest(created);
  } catch (error) {
    if (error.code === "23505") {
      // Unique constraint violation
      throw new HttpError(409, "A request with this tax_id already exists");
    }
    throw error;
  }
}

async function getRequests(filters = {}) {
  if (filters.status && !VALID_STATUSES.has(filters.status)) {
    throw new HttpError(400, `Invalid access request status: ${filters.status}`);
  }

  try {
    const requests = await accessRequestsModel.getAccessRequests(filters);
    console.log("[ACCESS-REQUESTS] Fetched requests:", requests.length, "records", filters);
    return requests;
  } catch (error) {
    console.error("[ACCESS-REQUESTS] Error fetching requests:", error.message);
    throw new HttpError(500, "Unable to fetch access requests");
  }
}

async function approveAccessRequest(requestId, requester) {
  // Verify requester is admin
  if (!requester || requester.role !== "admin") {
    throw new HttpError(403, "Only admins can approve access requests");
  }

  const request = await accessRequestsModel.getAccessRequestById(requestId);
  if (!request) {
    throw new HttpError(404, "Access request not found");
  }

  if (request.status !== "pending") {
    throw new HttpError(400, "Only pending requests can be approved");
  }

  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [request.email.toLowerCase()]
    );

    let userId;
    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
    } else {
      const tempPassword = "123456";
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, role, is_active)
         VALUES ($1, $2, 'client', TRUE)
         RETURNING id`,
        [request.email.toLowerCase(), passwordHash]
      );

      userId = userResult.rows[0].id;
    }

    const existingClient = await client.query(
      `SELECT id FROM clients WHERE user_id = $1 OR tax_id = $2`,
      [userId, request.tax_id]
    );

    if (existingClient.rows.length === 0) {
      await client.query(
        `INSERT INTO clients (user_id, business_name, tax_id, contact_name, phone, advisor_id, status)
         VALUES ($1, $2, $3, $4, NULL,
           (SELECT id FROM advisors LIMIT 1), 'activo')`,
        [userId, request.company_name, request.tax_id, request.contact_name]
      );
    } else {
      await client.query(
        `UPDATE clients SET status = 'activo', updated_at = NOW() WHERE id = $1`,
        [existingClient.rows[0].id]
      );
    }

    const updated = await accessRequestsModel.updateAccessRequestStatus(
      requestId,
      "approved"
    );

    await client.query("COMMIT");

    return {
      accessRequest: mapAccessRequest(updated),
      userId: userId,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("[ACCESS-REQUESTS] Error approving request:", error.message, requestId);
    throw new HttpError(500, "Unable to approve access request");
  } finally {
    client.release();
  }
}

async function rejectAccessRequest(requestId, adminNotes, requester) {
  // Verify requester is admin
  if (!requester || requester.role !== "admin") {
    throw new HttpError(403, "Only admins can reject access requests");
  }

  const request = await accessRequestsModel.getAccessRequestById(requestId);
  if (!request) {
    throw new HttpError(404, "Access request not found");
  }

  if (request.status !== "pending") {
    throw new HttpError(400, "Only pending requests can be rejected");
  }

  try {
    const updated = await accessRequestsModel.updateAccessRequestStatus(
      requestId,
      "rejected",
      adminNotes
    );
    return mapAccessRequest(updated);
  } catch (error) {
    console.error("[ACCESS-REQUESTS] Error rejecting request:", error.message, requestId);
    throw new HttpError(500, "Unable to reject access request");
  }
}

module.exports = {
  submitAccessRequest,
  getRequests,
  approveAccessRequest,
  rejectAccessRequest,
  mapAccessRequest,
};
