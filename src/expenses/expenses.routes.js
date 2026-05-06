const express = require("express");

const controller = require("./expenses.controller");
const validate = require("../middlewares/validate.middleware");
const authenticate = require("../middlewares/auth.middleware");
const requireGroupMember = require("../middlewares/requireGroupMember.middleware");
const requireExpenseGroupMember = require("../middlewares/requireExpenseGroupMember.middleware");

const {
  createExpenseSchema,
  updateExpenseSchema,
} = require("./expenses.validation");

const router = express.Router();

router.use(authenticate);

router.get("/summary", controller.getUserSummary);

router.post(
  "/groups/:groupId/expenses",
  requireGroupMember,
  validate(createExpenseSchema),
  controller.createExpense,
);

router.put(
  "/:expenseId",
  requireExpenseGroupMember,
  validate(updateExpenseSchema),
  controller.updateExpense,
);

router.get(
  "/groups/:groupId/expenses",
  requireGroupMember,
  controller.listGroupExpenses,
);

router.get(
  "/groups/:groupId/balances",
  requireGroupMember,
  controller.getGroupBalances,
);

router.get("/:expenseId", controller.getExpense);
router.delete(
  "/:expenseId",
  requireExpenseGroupMember,
  controller.deleteExpense,
);

module.exports = router;
