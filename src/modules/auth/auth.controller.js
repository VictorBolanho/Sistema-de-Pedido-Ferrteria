const authService = require("./auth.service");
const HttpError = require("../../utils/http-error");

async function login(req, res, next) {//aqui se puede agregar un rate limiter para evitar ataques de fuerza bruta
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new HttpError(400, "Correo y contraseña son requeridos");
    }

    const data = await authService.login({ email, password });
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
    const { email, password, bootstrapToken: bodyBootstrapToken } = req.body;
    const headerBootstrapToken = req.headers["x-bootstrap-token"];
    const bootstrapToken = headerBootstrapToken || bodyBootstrapToken;

    if (!email || !password || !bootstrapToken) {
      throw new HttpError(
        400,
        "Correo y contraseña son requeridos"
      );
    }

    const data = await authService.bootstrapAdmin({
      email,
      password,
      bootstrapToken,
    });

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  me,
  bootstrapAdmin,
};
