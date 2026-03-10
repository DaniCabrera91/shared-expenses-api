const { z } = require("zod");

const createGroupSchema = z.object({
  name: z.string().min(1),
  emoji: z.string().optional(),
  currency: z.string().length(3).optional(),
});

const addParticipantsSchema = z.object({
  participants: z.array(
    z.object({
      user_id: z.string().uuid(),
    }),
  ),
});

const updateRoleSchema = z.object({
  role: z.enum(["admin", "member"]),
});

module.exports = {
  createGroupSchema,
  addParticipantsSchema,
  updateRoleSchema,
};
