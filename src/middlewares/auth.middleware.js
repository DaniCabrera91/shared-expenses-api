const jwt = require("jsonwebtoken");
const HttpError = require("../utils/httpError");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new HttpError(401, "Token requerido"));
  }

  if (!authHeader.startsWith("Bearer ")) {
    return next(new HttpError(401, "Formato de token inválido"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: payload.sub,
      email: payload.email,
    };

    next();
  } catch (error) {
    return next(new HttpError(401, "Token inválido o expirado"));
  }
};

module.exports = authenticate;
