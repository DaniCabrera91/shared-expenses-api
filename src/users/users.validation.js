const { z } = require("zod");
const { isValidPersonName, isValidAlias } = require("../utils/validators");

const updateUserSchema = z
  .object({
    first_name: z
      .string()
      .trim()
      .min(2, "Nombre muy corto")
      .max(100)
      .refine(
        isValidPersonName,
        "Solo letras, espacios, guiones y apóstrofes permitidos",
      )
      .optional(),

    last_name: z
      .string()
      .trim()
      .min(2, "Apellido muy corto")
      .max(100)
      .refine(
        isValidPersonName,
        "Solo letras, espacios, guiones y apóstrofes permitidos",
      )
      .optional(),

    alias: z
      .string()
      .trim()
      .min(2, "Alias muy corto")
      .max(50)
      .refine(
        isValidAlias,
        "Solo letras, números, puntos, guiones y guiones bajos permitidos",
      )
      .optional(),

    email: z.string().trim().toLowerCase().email("Email no válido").optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });

module.exports = { updateUserSchema };
