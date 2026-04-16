const clientsService = require("./clients.service");
const HttpError = require("../../utils/http-error");

async function createClient(req, res, next) {
  try {
    const { businessName, taxId, contactName, phone, advisorId, status } = req.body;
    if (!businessName || !taxId || !contactName || !advisorId) {
      throw new HttpError(
        400,
        "businessName, taxId, contactName and advisorId are required"
      );
    }

    const client = await clientsService.createClient(
      { businessName, taxId, contactName, phone, advisorId, status },
      req.user
    );

    res.status(201).json({ client });
  } catch (error) {
    next(error);
  }
}

async function getClients(req, res, next) {
  try {
    const clients = await clientsService.getClients();
    res.status(200).json({ clients });
  } catch (error) {
    next(error);
  }
}

async function getClientById(req, res, next) {
  try {
    const client = await clientsService.getClientById(req.params.id);
    res.status(200).json({ client });
  } catch (error) {
    next(error);
  }
}

async function assignAdvisor(req, res, next) {
  try {
    const { advisorId } = req.body;
    if (!advisorId) {
      throw new HttpError(400, "advisorId is required");
    }

    const client = await clientsService.assignAdvisor(
      req.params.id,
      advisorId,
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
};

