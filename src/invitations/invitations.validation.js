const z = require("zod");

const createInvitationSchema = z.object({
  expiresIn: z.number().int().positive().optional(), // días, default 7
});

const joinWithInvitationSchema = z.object({
  token: z.string().min(1),
});

module.exports = {
  createInvitationSchema,
  joinWithInvitationSchema,
};
