const { z } = require("zod");
const { isValidPersonName, isValidAlias } = require("../utils/validators");

const registerSchema = z
  .object({
    first_name: z
      .string()
      .trim()
      .min(2, "Nombre muy corto")
      .max(100)
      .refine(
        isValidPersonName,
        "Solo letras, espacios, guiones y apóstrofes permitidos",
      ),

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
      ),

    email: z.string().trim().toLowerCase().email("Email no válido"),

    password: z
      .string()
      .min(12, "Mínimo 12 caracteres")
      .refine((val) => /[A-Z]/.test(val), "Debe incluir mayúscula")
      .refine((val) => /[a-z]/.test(val), "Debe incluir minúscula")
      .refine((val) => /[0-9]/.test(val), "Debe incluir número"),
  })
  .strict();

const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Email no válido"),
    password: z.string().min(1, "La contraseña es obligatoria"),
  })
  .strict();

const refreshTokenSchema = z
  .object({
    refresh_token: z.string().min(20, "Refresh token requerido"),
  })
  .strict();

module.exports = { registerSchema, loginSchema, refreshTokenSchema };
