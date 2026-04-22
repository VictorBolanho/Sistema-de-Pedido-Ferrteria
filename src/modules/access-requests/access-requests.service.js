const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const accessRequestsModel = require("./access-requests.model");
const HttpError = require("../../utils/http-error");
const db = require("../../config/database");
const logger = require("../../utils/logger");

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
    return await accessRequestsModel.getAccessRequests(filters);
  } catch (error) {
    logger.error({ err: error, filters }, "Error fetching access requests");
    throw new HttpError(500, "Unable to fetch access requests");
  }
}

async function resolveAdvisorForApproval(transactionalClient, advisorId) {
  if (advisorId) {
    const advisorResult = await transactionalClient.query(
      `
        SELECT a.id
        FROM advisors a
        WHERE a.id = $1
        LIMIT 1
      `,
      [advisorId]
    );

    if (!advisorResult.rows.length) {
      throw new HttpError(404, "Advisor not found");
    }

    return advisorResult.rows[0].id;
  }

  const advisorResult = await transactionalClient.query(`
    SELECT
      a.id,
      COUNT(c.id)::INTEGER AS active_clients
    FROM advisors a
    LEFT JOIN clients c
      ON c.advisor_id = a.id
     AND c.status = 'activo'
    GROUP BY a.id, a.created_at
    ORDER BY active_clients ASC, a.created_at ASC
    LIMIT 1
  `);

  if (!advisorResult.rows.length) {
    throw new HttpError(409, "At least one advisor is required before approving access requests");
  }

  return advisorResult.rows[0].id;
}

async function approveAccessRequest(requestId, requester, options = {}) {
  if (!requester || requester.role !== "admin") {
    throw new HttpError(403, "Only admins can approve access requests");
  }

  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    const request = await accessRequestsModel.getAccessRequestByIdForUpdate(requestId, client);
    if (!request) {
      throw new HttpError(404, "Access request not found");
    }

    if (request.status !== "pending") {
      throw new HttpError(400, "Only pending requests can be approved");
    }

    const advisorId = await resolveAdvisorForApproval(client, options.advisorId);

    const existingUser = await client.query(
      "SELECT id, role, is_active FROM users WHERE email = $1 LIMIT 1",
      [request.email.toLowerCase()]
    );

    let userId;
    let temporaryPassword = null;
    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      if (user.role !== "client") {
        throw new HttpError(
          409,
          "This email already belongs to a non-client account and cannot be reused"
        );
      }
      userId = existingUser.rows[0].id;
      if (!user.is_active) {
        await client.query(
          `
            UPDATE users
            SET is_active = TRUE, updated_at = NOW()
            WHERE id = $1
          `,
          [userId]
        );
      }
    } else {
      temporaryPassword = `ANDI-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
      const passwordHash = await bcrypt.hash(temporaryPassword, 10);

      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, role, is_active)
         VALUES ($1, $2, 'client', TRUE)
         RETURNING id`,
        [request.email.toLowerCase(), passwordHash]
      );

      userId = userResult.rows[0].id;
    }

    const existingClient = await client.query(
      `SELECT id, user_id, tax_id FROM clients WHERE user_id = $1 OR tax_id = $2 LIMIT 1`,
      [userId, request.tax_id]
    );

    if (existingClient.rows.length === 0) {
      await client.query(
        `INSERT INTO clients (user_id, business_name, tax_id, contact_name, phone, advisor_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'activo')`,
        [userId, request.company_name, request.tax_id, request.contact_name, request.phone, advisorId]
      );
      await client.query(
        `
          INSERT INTO historial_asesores (client_id, advisor_id, assigned_by_user_id, reason)
          VALUES (
            (SELECT id FROM clients WHERE user_id = $1 LIMIT 1),
            $2,
            $3,
            'Aprobacion de solicitud de acceso'
          )
        `,
        [userId, advisorId, requester.sub]
      );
    } else {
      const existingClientRow = existingClient.rows[0];
      if (existingClientRow.user_id && existingClientRow.user_id !== userId) {
        throw new HttpError(409, "The tax ID already belongs to another client account");
      }

      await client.query(
        `UPDATE clients
         SET
           user_id = $2,
           business_name = $3,
           contact_name = $4,
           phone = $5,
           advisor_id = $6,
           status = 'activo',
           updated_at = NOW()
         WHERE id = $1`,
        [
          existingClientRow.id,
          userId,
          request.company_name,
          request.contact_name,
          request.phone,
          advisorId,
        ]
      );
      await client.query(
        `
          INSERT INTO historial_asesores (client_id, advisor_id, assigned_by_user_id, reason)
          VALUES ($1, $2, $3, 'Reasignacion por aprobacion de solicitud de acceso')
        `,
        [existingClientRow.id, advisorId, requester.sub]
      );
    }

    const updated = await accessRequestsModel.updateAccessRequestStatus(
      requestId,
      "approved",
      options.adminNotes || null,
      client
    );

    await client.query("COMMIT");

    return {
      accessRequest: mapAccessRequest(updated),
      userId,
      advisorId,
      temporaryPassword,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error({ err: error, requestId }, "Error approving access request");
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, "Unable to approve access request");
  } finally {
    client.release();
  }
}

async function rejectAccessRequest(requestId, adminNotes, requester) {
  if (!requester || requester.role !== "admin") {
    throw new HttpError(403, "Only admins can reject access requests");
  }

  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    const request = await accessRequestsModel.getAccessRequestByIdForUpdate(requestId, client);
    if (!request) {
      throw new HttpError(404, "Access request not found");
    }

    if (request.status !== "pending") {
      throw new HttpError(400, "Only pending requests can be rejected");
    }

    const updated = await accessRequestsModel.updateAccessRequestStatus(
      requestId,
      "rejected",
      adminNotes,
      client
    );

    await client.query("COMMIT");
    return mapAccessRequest(updated);
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error({ err: error, requestId }, "Error rejecting access request");
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, "Unable to reject access request");
  } finally {
    client.release();
  }
}

module.exports = {
  submitAccessRequest,
  getRequests,
  approveAccessRequest,
  rejectAccessRequest,
  mapAccessRequest,
};
