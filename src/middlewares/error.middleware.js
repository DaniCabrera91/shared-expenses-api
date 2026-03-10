const { ZodError } = require("zod");

const errorHandler = (err, req, res, next) => {
  // 1️⃣ Errores personalizados con status
  if (err.status) {
    return res.status(err.status).json({
      error: err.message,
    });
  }

  // 2️⃣ Errores de validación (Zod)
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Error de validación",
      details: err.issues.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // 2️⃣ Errores de PostgreSQL
  if (err.code) {
    switch (err.code) {
      case "23505": // unique_violation
        return res.status(409).json({
          error: "El recurso ya existe",
          detail: err.detail,
        });

      case "23503": // foreign_key_violation
        return res.status(400).json({
          error: "Referencia inválida (foreign key)",
          detail: err.detail,
        });

      case "23514": // check_violation
        return res.status(400).json({
          error: "Violación de restricción",
          detail: err.detail,
        });

      case "23502": // not_null_violation
        return res.status(400).json({
          error: "Campo requerido faltante",
          detail: err.detail,
        });
    }
  }

  // 3️⃣ Errores de lógica de negocio
  if (err.message?.includes("El email ya está registrado")) {
    return res.status(409).json({
      error: err.message,
    });
  }

  if (err.message === "Usuario no encontrado") {
    return res.status(404).json({
      error: err.message,
    });
  }

  if (err.message === "No hay datos para actualizar") {
    return res.status(400).json({
      error: err.message,
    });
  }

  // 4️⃣ Errores inesperados
  console.error("[ERROR STACK]:", err.stack || err);

  return res.status(500).json({
    error: "Error interno del servidor",
  });
};

module.exports = errorHandler;
