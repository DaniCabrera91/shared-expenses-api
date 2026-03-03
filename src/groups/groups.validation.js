const { z } = require("zod");

const createGroupSchema = z
  .object({
    name: z.string().trim().min(2, "Nombre demasiado corto").max(100),

    emoji: z.string().trim().max(10).optional(),

    currency: z.string().length(3).toUpperCase().optional(),

    participants: z
      .array(
        z.object({
          user_id: z.string().uuid("user_id debe ser UUID válido"),
        }),
      )
      .optional(),
  })
  .strict();

const addMembersSchema = z.object({
  participants: z.array(
    z.object({
      user_id: z.string().uuid(),
    }),
  ),
});

const updateRoleSchema = z.object({
  role: z.enum(["admin", "member"]),
});

module.exports = { createGroupSchema, addMembersSchema, updateRoleSchema };
