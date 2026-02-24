const { z } = require("zod");

const createGroupSchema = z
  .object({
    name: z.string().trim().min(2, "Nombre de grupo demasiado corto").max(100),

    emoji: z.string().trim().max(10).optional(),

    currency: z
      .string()
      .length(3, "La moneda debe tener 3 caracteres")
      .toUpperCase()
      .optional(),
  })
  .strict();

module.exports = { createGroupSchema };
