const bcrypt = require("bcryptjs");
const clientsModel = require("./clients.model");
const db = require("../../config/database");
const HttpError = require("../../utils/http-error");
const logger = require("../../utils/logger");

const VALID_STATUSES = new Set(["pendiente", "activo", "bloqueado"]);
const DEFAULT_CLIENT_PASSWORD = "admin123";

function mapClient(client) {
  return {
    id: client.id,
    userId: client.user_id,
    email: client.email || null,
    portalEnabled: client.is_active ?? false,
    businessName: client.business_name,
    taxId: client.tax_id,
    contactName: client.contact_name,
    phone: client.phone,
    status: client.status,
    advisorId: client.advisor_id,
    advisorName:
      client.advisor_first_name && client.advisor_last_name
        ? `${client.advisor_first_name} ${client.advisor_last_name}`
        : null,
    createdAt: client.created_at,
    updatedAt: client.updated_at,
  };
}

async function resolveAdvisorForCreate(requestedAdvisorId, requester) {
  if (!requestedAdvisorId) {
    throw new HttpError(400, "advisorId is required");
  }

  if (requester.role === "advisor") {
    const ownAdvisor = await clientsModel.findAdvisorByUserId(requester.sub);
    if (!ownAdvisor) {
      throw new HttpError(403, "Advisor profile not found for current user");
    }

    if (ownAdvisor.id !== requestedAdvisorId) {
      throw new HttpError(403, "Advisors can only assign clients to themselves");
    }
  }

  const advisor = await clientsModel.findAdvisorById(requestedAdvisorId);
  if (!advisor) {
    throw new HttpError(404, "Advisor not found");
  }
  if (!advisor.is_active) {
    throw new HttpError(409, "Advisor must be active to receive client assignments");
  }

  return advisor;
}

async function createClient(payload, requester) {
  const status = payload.status || "pendiente";
  if (!VALID_STATUSES.has(status)) {
    throw new HttpError(400, "Invalid client status");
  }

  const advisor = await resolveAdvisorForCreate(payload.advisorId, requester);

  const transactionalClient = await db.getClient();
  try {
    await transactionalClient.query("BEGIN");

    const normalizedEmail = String(payload.email).toLowerCase().trim();
    const existingUser = await transactionalClient.query(
      `
        SELECT id
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [normalizedEmail]
    );
    if (existingUser.rows.length > 0) {
      throw new HttpError(409, "Email already in use");
    }

    const assignedPassword = payload.password || DEFAULT_CLIENT_PASSWORD;
    const passwordHash = await bcrypt.hash(assignedPassword, 10);
    const isPortalEnabled = status === "activo";

    const userResult = await transactionalClient.query(
      `
        INSERT INTO users (email, password_hash, role, is_active)
        VALUES ($1, $2, 'client', $3)
        RETURNING id, email, is_active
      `,
      [normalizedEmail, passwordHash, isPortalEnabled]
    );

    const created = await clientsModel.createClient(
      {
        userId: userResult.rows[0].id,
        businessName: payload.businessName,
        taxId: payload.taxId,
        contactName: payload.contactName,
        phone: payload.phone,
        advisorId: advisor.id,
        status,
      },
      transactionalClient
    );

    await clientsModel.insertAdvisorHistory(
      {
        clientId: created.id,
        advisorId: advisor.id,
        assignedByUserId: requester.sub,
        reason: "Asignacion inicial",
      },
      transactionalClient
    );

    await transactionalClient.query("COMMIT");
    return {
      client: mapClient({
        ...created,
        email: userResult.rows[0].email,
        is_active: userResult.rows[0].is_active,
      }),
      temporaryPassword: assignedPassword,
    };
  } catch (error) {
    await transactionalClient.query("ROLLBACK");
    logger.error({ err: error, payload, requester: requester.sub }, "Error creating client");
    if (error instanceof HttpError) {
      throw error;
    }
    if (error.code === "23505" && error.constraint && error.constraint.includes("tax_id")) {
      throw new HttpError(409, "Tax ID already exists");
    }
    throw error;
  } finally {
    transactionalClient.release();
  }
}

async function getClients(requester) {
  if (requester.role === "advisor") {
    const advisor = await clientsModel.findAdvisorByUserId(requester.sub);
    if (!advisor) {
      throw new HttpError(403, "Advisor profile not found for current user");
    }
    const rows = await clientsModel.listClientsByAdvisorId(advisor.id);
    return rows.map(mapClient);
  }

  const rows = await clientsModel.listClients();
  return rows.map(mapClient);
}

async function getClientById(clientId, requester) {
  const row = await clientsModel.findClientById(clientId);
  if (!row) {
    throw new HttpError(404, "Client not found");
  }

  if (requester.role === "advisor") {
    const advisor = await clientsModel.findAdvisorByUserId(requester.sub);
    if (!advisor || row.advisor_id !== advisor.id) {
      throw new HttpError(403, "Forbidden");
    }
  }

  return mapClient(row);
}

async function assignAdvisor(clientId, advisorId, requester) {
  if (requester.role !== "admin") {
    throw new HttpError(403, "Only admins can reassign advisors");
  }

  const client = await clientsModel.findClientById(clientId);
  if (!client) {
    throw new HttpError(404, "Client not found");
  }

  const advisor = await clientsModel.findAdvisorById(advisorId);
  if (!advisor) {
    throw new HttpError(404, "Advisor not found");
  }
  if (!advisor.is_active) {
    throw new HttpError(409, "Advisor must be active to receive client assignments");
  }

  if (client.advisor_id === advisor.id) {
    return mapClient(client);
  }

  const transactionalClient = await db.getClient();
  try {
    await transactionalClient.query("BEGIN");

    const updated = await clientsModel.updateClientAdvisor(
      clientId,
      advisor.id,
      transactionalClient
    );

    await clientsModel.insertAdvisorHistory(
      {
        clientId,
        advisorId: advisor.id,
        assignedByUserId: requester.sub,
        reason: "Reasignacion por admin",
      },
      transactionalClient
    );

    await transactionalClient.query("COMMIT");
    return mapClient({
      ...client,
      ...updated,
    });
  } catch (error) {
    await transactionalClient.query("ROLLBACK");
    logger.error({ err: error, clientId, advisorId, requester: requester.sub }, "Error assigning advisor to client");
    throw error;
  } finally {
    transactionalClient.release();
  }
}

async function updateClientStatus(clientId, status, requester) {
  if (requester.role !== "admin") {
    throw new HttpError(403, "Only admins can update client status");
  }

  if (!VALID_STATUSES.has(status)) {
    throw new HttpError(400, "Invalid client status");
  }

  const client = await clientsModel.findClientById(clientId);
  if (!client) {
    throw new HttpError(404, "Client not found");
  }

  const portalEnabled = status === "activo";
  const transactionalClient = await db.getClient();
  try {
    await transactionalClient.query("BEGIN");

    const updatedClient = await clientsModel.updateClientStatus(clientId, status, transactionalClient);
    await transactionalClient.query(
      `
        UPDATE users
        SET is_active = $1, updated_at = NOW()
        WHERE id = $2
      `,
      [portalEnabled, client.user_id]
    );

    await transactionalClient.query("COMMIT");
    return mapClient({
      ...client,
      ...updatedClient,
      is_active: portalEnabled,
    });
  } catch (error) {
    await transactionalClient.query("ROLLBACK");
    logger.error({ err: error, clientId, status }, "Error updating client status");
    throw error;
  } finally {
    transactionalClient.release();
  }
}

module.exports = {
  createClient,
  getClients,
  getClientById,
  assignAdvisor,
  updateClientStatus,
};
