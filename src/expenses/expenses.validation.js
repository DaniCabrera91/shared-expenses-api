const { z } = require("zod");

const shareSchema = z.object({
  user_id: z.string().uuid(),
  amount_owed: z.number().nonnegative(),
});

const createExpenseSchema = z.object({
  description: z.string().min(1),
  total_amount: z.number().positive(),
  currency: z.string().length(3),
  paid_by: z.string().uuid(),
  shares: z.array(shareSchema).min(1),
});

module.exports = {
  createExpenseSchema,
};
