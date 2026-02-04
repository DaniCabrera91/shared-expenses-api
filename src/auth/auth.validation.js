const { z } = require("zod");

const registerSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(2, "Nombre muy corto")
    .max(100)
    .refine(
      (val) => /^[a-záéíóúñ\s]+$/i.test(val),
      "Solo letras y espacios permitidos",
    ),
  last_name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().toLowerCase().email("Email no válido"),
  password: z
    .string()
    .min(12, "Mínimo 12 caracteres")
    .refine((val) => /[A-Z]/.test(val), "Debe incluir mayúscula")
    .refine((val) => /[a-z]/.test(val), "Debe incluir minúscula")
    .refine((val) => /[0-9]/.test(val), "Debe incluir número"),
  alias: z.string().trim().min(2, "Alias muy corto").max(50).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email no válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});



module.exports = { registerSchema, loginSchema };