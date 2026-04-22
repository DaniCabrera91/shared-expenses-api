const expensesService = require("./expenses.service");

const createExpense = async (req, res, next) => {
  try {
    const expense = await expensesService.createExpense(
      req.params.groupId,
      req.validatedData,
      req.user.id,
    );

    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};

const listGroupExpenses = async (req, res, next) => {
  try {
    const expenses = await expensesService.listGroupExpenses(
      req.params.groupId,
    );
    res.json(expenses);
  } catch (error) {
    next(error);
  }
};

const getExpense = async (req, res, next) => {
  try {
    const expense = await expensesService.getExpense(req.params.expenseId);
    res.json(expense);
  } catch (error) {
    next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    await expensesService.deleteExpense(req.params.expenseId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

const getGroupBalances = async (req, res, next) => {
  try {
    const balances = await expensesService.getGroupBalances(req.params.groupId);
    res.json(balances);
  } catch (error) {
    next(error);
  }
};

const getUserSummary = async (req, res, next) => {
  try {
    const summary = await expensesService.getUserExpensesSummary(req.user.id);
    res.json(summary);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExpense,
  listGroupExpenses,
  getExpense,
  deleteExpense,
  getGroupBalances,
  getUserSummary,
};
