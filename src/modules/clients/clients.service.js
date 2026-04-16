const clientsModel = require("./clients.model");
const db = require("../../config/database");
const HttpError = require("../../utils/http-error");

const VALID_STATUSES = new Set(["pendiente", "activo", "bloqueado"]);

function mapClient(client) {
  return {
    id: client.id,
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

    const created = await clientsModel.createClient(
      {
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
    return mapClient(created);
  } catch (error) {
    await transactionalClient.query("ROLLBACK");
    if (error.code === "23505") {
      if (error.constraint && error.constraint.includes("tax_id")) {
        throw new HttpError(409, "Tax ID already exists");
      }
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

async function getClientById(clientId) {
  const row = await clientsModel.findClientById(clientId);
  if (!row) {
    throw new HttpError(404, "Client not found");
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
    return mapClient(updated);
  } catch (error) {
    await transactionalClient.query("ROLLBACK");
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
};

