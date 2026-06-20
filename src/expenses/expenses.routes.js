const express = require("express");

const controller = require("./expenses.controller");
const validate = require("../middlewares/validate.middleware");
const authenticate = require("../middlewares/auth.middleware");
const requireGroupMember = require("../middlewares/requireGroupMember.middleware");
const requireExpenseAuthorOrAdmin = require("../middlewares/requireExpenseAuthorOrAdmin.middleware");

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
  requireExpenseAuthorOrAdmin,
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

router.get(
  "/groups/:groupId/settlements",
  requireGroupMember,
  controller.getGroupSettlements,
);

router.post(
  "/groups/:groupId/settlements",
  requireGroupMember,
  controller.createSettlement,
);

router.get("/:expenseId", controller.getExpense);
router.delete(
  "/:expenseId",
  requireExpenseAuthorOrAdmin,
  controller.deleteExpense,
);

module.exports = router;
