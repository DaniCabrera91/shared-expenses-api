const { ZodError } = require("zod");

const errorHandler = (err, req, res, next) => {
  // 1. Validar errores de Zod (Esquemas)
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Error de validación",
      details: (err.issues || []).map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // 2. Errores de lógica de negocio (Email duplicado)
  if (err.message && err.message.includes("email ya está registrado")) {
    return res.status(409).json({
      error: err.message,
    });
  }

  // 3. Log de errores inesperados para debug (en consola)
  console.error("[ERROR STACK]:", err.stack);

  res.status(500).json({
    error: "Error interno del servidor",
  });
};

module.exports = errorHandler;
