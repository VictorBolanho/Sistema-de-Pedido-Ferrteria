const clientsService = require("./clients.service");
const { validate, clientSchemas } = require("../../utils/validators");

async function createClient(req, res, next) {
  try {
    const payload = validate(clientSchemas.createClient, req.body);
    const result = await clientsService.createClient(payload, req.user);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function getClients(req, res, next) {
  try {
    const clients = await clientsService.getClients(req.user);
    res.status(200).json({ clients });
  } catch (error) {
    next(error);
  }
}

async function getClientById(req, res, next) {
  try {
    const client = await clientsService.getClientById(req.params.id, req.user);
    res.status(200).json({ client });
  } catch (error) {
    next(error);
  }
}

async function assignAdvisor(req, res, next) {
  try {
    const payload = validate(clientSchemas.assignAdvisor, req.body);
    const client = await clientsService.assignAdvisor(
      req.params.id,
      payload.advisorId,
      req.user
    );

    res.status(200).json({ client });
  } catch (error) {
    next(error);
  }
}

async function updateClientStatus(req, res, next) {
  try {
    const payload = validate(clientSchemas.updateClientStatus, req.body);
    const client = await clientsService.updateClientStatus(
      req.params.id,
      payload.status,
      req.user
    );
    res.status(200).json({ client });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createClient,
  getClients,
  getClientById,
  assignAdvisor,
  updateClientStatus,
};
