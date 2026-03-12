const express = require("express");

const controller = require("./expenses.controller");
const validate = require("../middlewares/validate.middleware");
const authenticate = require("../middlewares/auth.middleware");
const requireGroupMember = require("../middlewares/requireGroupMember.middleware");

const { createExpenseSchema } = require("./expenses.validation");

const router = express.Router();

router.use(authenticate);

router.post(
  "/groups/:groupId/expenses",
  requireGroupMember,
  validate(createExpenseSchema),
  controller.createExpense,
);

router.get(
  "/groups/:groupId/expenses",
  requireGroupMember,
  controller.listGroupExpenses,
);

router.get("/expenses/:expenseId", controller.getExpense);

router.delete("/expenses/:expenseId", controller.deleteExpense);

router.get(
  "/groups/:groupId/balances",
  requireGroupMember,
  controller.getGroupBalances,
);

module.exports = router;
