const { ZodError } = require("zod");

const errorHandler = (err, req, res, next) => {
  // 1. Errores de validación (Zod)
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Error de validación",
      details: err.issues.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // 2. Errores de negocio conocidos
  if (err.message?.includes("email ya está registrado")) {
    return res.status(409).json({
      error: err.message,
    });
  }

  if (err.message === "Usuario no encontrado") {
    return res.status(404).json({
      error: err.message,
    });
  }

  // 3. Errores inesperados
  console.error("[ERROR STACK]:", err.stack || err);

  return res.status(500).json({
    error: "Error interno del servidor",
  });
};

module.exports = errorHandler;
