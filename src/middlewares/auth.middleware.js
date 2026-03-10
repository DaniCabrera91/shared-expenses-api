const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new Error("Token requerido"));
  }

  if (!authHeader.startsWith("Bearer ")) {
    return next(new Error("Formato de token inválido"));
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
    return next(new Error("Token inválido o expirado"));
  }
};

module.exports = authenticate;
