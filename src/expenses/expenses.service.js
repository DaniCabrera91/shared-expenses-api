const pool = require("../config/db");

const createExpense = async (groupId, data, userId) => {
  const client = await pool.connect();

  try {
    const { description, total_amount, currency, paid_by, shares } = data;

    const totalShares = shares.reduce(
      (sum, share) => sum + share.amount_owed,
      0,
    );

    if (Number(totalShares) !== Number(total_amount)) {
      const error = new Error("La suma de las deudas no coincide con el total");
      error.status = 400;
      throw error;
    }

    await client.query("BEGIN");

    const expenseResult = await client.query(
      `
      INSERT INTO expenses (group_id, paid_by, created_by, description, total_amount, currency)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [groupId, paid_by, userId, description, total_amount, currency],
    );

    const expense = expenseResult.rows[0];

    for (const share of shares) {
      await client.query(
        `
        INSERT INTO expense_shares (expense_id, user_id, amount_owed)
        VALUES ($1,$2,$3)
        `,
        [expense.id, share.user_id, share.amount_owed],
      );
    }

    await client.query("COMMIT");

    return expense;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const listGroupExpenses = async (groupId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM expenses
    WHERE group_id = $1
    ORDER BY created_at DESC
    `,
    [groupId],
  );

  return result.rows;
};

const getExpense = async (expenseId) => {
  const expense = await pool.query(
    `
    SELECT *
    FROM expenses
    WHERE id = $1
    `,
    [expenseId],
  );

  if (expense.rowCount === 0) {
    const error = new Error("Expense not found");
    error.status = 404;
    throw error;
  }

  const shares = await pool.query(
    `
    SELECT user_id, amount_owed
    FROM expense_shares
    WHERE expense_id = $1
    `,
    [expenseId],
  );

  return {
    ...expense.rows[0],
    shares: shares.rows,
  };
};

const deleteExpense = async (expenseId) => {
  const result = await pool.query(
    `
    DELETE FROM expenses
    WHERE id = $1
    RETURNING id
    `,
    [expenseId],
  );

  if (result.rowCount === 0) {
    const error = new Error("Expense not found");
    error.status = 404;
    throw error;
  }

  return true;
};

const getGroupBalances = async (groupId) => {
  const result = await pool.query(
    `
    SELECT
      u.id,
      COALESCE(paid.total_paid,0) - COALESCE(owed.total_owed,0) AS balance
    FROM users u
    JOIN group_members gm ON gm.user_id = u.id
    LEFT JOIN (
      SELECT paid_by, SUM(total_amount) total_paid
      FROM expenses
      WHERE group_id = $1
      GROUP BY paid_by
    ) paid ON paid.paid_by = u.id
    LEFT JOIN (
      SELECT es.user_id, SUM(es.amount_owed) total_owed
      FROM expense_shares es
      JOIN expenses e ON e.id = es.expense_id
      WHERE e.group_id = $1
      GROUP BY es.user_id
    ) owed ON owed.user_id = u.id
    WHERE gm.group_id = $1
    `,
    [groupId],
  );

  return result.rows;
};

const getUserExpensesSummary = async (userId) => {
  // Gastos pagados por el usuario
  const paid = await pool.query(
    `
    SELECT SUM(total_amount) as total_paid
    FROM expenses
    WHERE paid_by = $1
    `,
    [userId],
  );

  // Cantidad que debe el usuario
  const owed = await pool.query(
    `
    SELECT SUM(amount_owed) as total_owed
    FROM expense_shares
    WHERE user_id = $1
    `,
    [userId],
  );

  // Grupos del usuario con gastos
  const groupsWithExpenses = await pool.query(
    `
    SELECT g.id, g.name, g.emoji, COUNT(e.id) as expense_count
    FROM groups g
    JOIN group_members gm ON gm.group_id = g.id
    LEFT JOIN expenses e ON e.group_id = g.id
    WHERE gm.user_id = $1 AND g.is_archived = FALSE
    GROUP BY g.id
    HAVING COUNT(e.id) > 0
    `,
    [userId],
  );

  return {
    total_paid: Number(paid.rows[0]?.total_paid) || 0,
    total_owed: Number(owed.rows[0]?.total_owed) || 0,
    balance:
      Number(paid.rows[0]?.total_paid || 0) -
      Number(owed.rows[0]?.total_owed || 0),
    groups_with_expenses: groupsWithExpenses.rows,
  };
};

module.exports = {
  createExpense,
  listGroupExpenses,
  getExpense,
  deleteExpense,
  getGroupBalances,
  getUserExpensesSummary,
};
