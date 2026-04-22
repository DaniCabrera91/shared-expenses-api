const express = require("express");

const controller = require("./expenses.controller");
const validate = require("../middlewares/validate.middleware");
const authenticate = require("../middlewares/auth.middleware");
const requireGroupMember = require("../middlewares/requireGroupMember.middleware");

const { createExpenseSchema } = require("./expenses.validation");

const router = express.Router();

router.use(authenticate);

// 📌 Resumen global del usuario (ANTES de la ruta con :expenseId)
router.get("/expenses/summary", controller.getUserSummary);

// 📌 Rutas de grupos
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

router.get(
  "/groups/:groupId/balances",
  requireGroupMember,
  controller.getGroupBalances,
);

// 📌 Rutas de gastos individuales (DESPUÉS de las específicas)
router.get("/expenses/:expenseId", controller.getExpense);

router.delete("/expenses/:expenseId", controller.deleteExpense);

module.exports = router;
