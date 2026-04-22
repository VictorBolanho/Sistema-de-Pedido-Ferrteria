const authService = require("./auth.service");
const { validate, authSchemas } = require("../../utils/validators");

async function login(req, res, next) {
  try {
    const payload = validate(authSchemas.login, req.body);
    const data = await authService.login(payload);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

async function requestPasswordReset(req, res, next) {
  try {
    const payload = validate(authSchemas.requestPasswordReset, req.body);
    const data = await authService.requestPasswordReset(payload);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const payload = validate(authSchemas.resetPassword, req.body);
    const data = await authService.resetPassword(payload);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getMe(req.user.sub);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

async function bootstrapAdmin(req, res, next) {
  try {
    const payload = {
      ...req.body,
      bootstrapToken: req.headers["x-bootstrap-token"] || req.body.bootstrapToken,
    };
    const validated = validate(authSchemas.bootstrapAdmin, payload);

    const data = await authService.bootstrapAdmin(validated);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
}

async function createAdvisor(req, res, next) {
  try {
    const payload = validate(authSchemas.createAdvisor, req.body);
    const user = await authService.createAdvisor(payload);
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
}

async function getAdvisors(req, res, next) {
  try {
    const advisors = await authService.getAdvisors();
    res.status(200).json({ advisors });
  } catch (error) {
    next(error);
  }
}

async function updateAdvisorStatus(req, res, next) {
  try {
    const payload = validate(authSchemas.updateAdvisorStatus, req.body);
    const advisor = await authService.updateAdvisorStatus(req.params.id, payload.isActive);
    res.status(200).json({ advisor });
  } catch (error) {
    next(error);
  }
}

async function deleteAdvisor(req, res, next) {
  try {
    const { id } = req.params;
    const result = await authService.deleteAdvisor(id);
    res.status(200).json({ advisor: result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  requestPasswordReset,
  resetPassword,
  me,
  bootstrapAdmin,
  createAdvisor,
  getAdvisors,
  updateAdvisorStatus,
  deleteAdvisor,
};
