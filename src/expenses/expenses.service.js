const pool = require("../config/db");
const {
  createNotification,
} = require("../notifications/notifications.service");

const createExpense = async (groupId, data, userId) => {
  const client = await pool.connect();

  try {
    const {
      description,
      total_amount,
      currency,
      paid_by,
      shares,
      category = "other",
    } = data;

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
      INSERT INTO expenses (group_id, paid_by, created_by, description, total_amount, currency, category)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [groupId, paid_by, userId, description, total_amount, currency, category],
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

    await createNotification(
      {
        groupId,
        actorId: userId,
        type: "expense_created",
        message: `Nuevo gasto: "${description}"`,
      },
      client,
    );

    await client.query("COMMIT");

    return expense;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const updateExpense = async (expenseId, data, userId) => {
  const client = await pool.connect();

  try {
    const {
      description,
      total_amount,
      currency,
      paid_by,
      shares,
      category = "other",
    } = data;

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
      UPDATE expenses
      SET description = $1, total_amount = $2, currency = $3, paid_by = $4, category = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *
      `,
      [description, total_amount, currency, paid_by, category, expenseId],
    );

    if (expenseResult.rowCount === 0) {
      const error = new Error("Expense not found");
      error.status = 404;
      throw error;
    }

    await client.query(
      `
      DELETE FROM expense_shares
      WHERE expense_id = $1
      `,
      [expenseId],
    );

    for (const share of shares) {
      await client.query(
        `
        INSERT INTO expense_shares (expense_id, user_id, amount_owed)
        VALUES ($1, $2, $3)
        `,
        [expenseId, share.user_id, share.amount_owed],
      );
    }

    await createNotification(
      {
        groupId: expenseResult.rows[0].group_id,
        actorId: userId,
        type: "expense_updated",
        message: `Gasto actualizado: "${description}"`,
      },
      client,
    );

    await client.query("COMMIT");

    return expenseResult.rows[0];
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
      COALESCE(paid.total_paid,0) 
      - COALESCE(owed.total_owed,0)
      + COALESCE(settled_received.total_received,0)
      - COALESCE(settled_paid.total_paid,0) AS balance
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
    LEFT JOIN (
      SELECT to_user_id, SUM(amount) total_received
      FROM settlements
      WHERE group_id = $1
      GROUP BY to_user_id
    ) settled_received ON settled_received.to_user_id = u.id
    LEFT JOIN (
      SELECT from_user_id, SUM(amount) total_paid
      FROM settlements
      WHERE group_id = $1
      GROUP BY from_user_id
    ) settled_paid ON settled_paid.from_user_id = u.id
    WHERE gm.group_id = $1
    `,
    [groupId, groupId, groupId, groupId, groupId],
  );

  return result.rows;
};

const getGroupSettlements = async (groupId) => {
  const result = await pool.query(
    `
    SELECT
      u.id,
      u.first_name,
      u.last_name,
      COALESCE(paid.total_paid,0) 
      - COALESCE(owed.total_owed,0)
      + COALESCE(settled_received.total_received,0)
      - COALESCE(settled_paid.total_paid,0) AS balance
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
    LEFT JOIN (
      SELECT to_user_id, SUM(amount) total_received
      FROM settlements
      WHERE group_id = $1
      GROUP BY to_user_id
    ) settled_received ON settled_received.to_user_id = u.id
    LEFT JOIN (
      SELECT from_user_id, SUM(amount) total_paid
      FROM settlements
      WHERE group_id = $1
      GROUP BY from_user_id
    ) settled_paid ON settled_paid.from_user_id = u.id
    WHERE gm.group_id = $1
    `,
    [groupId, groupId, groupId, groupId, groupId],
  );

  const eps = 0.01; // rounding epsilon
  const people = result.rows.map((r) => ({
    id: r.id,
    name: `${r.first_name} ${r.last_name}`.trim(),
    balance: Number(Number(r.balance).toFixed(2)),
  }));

  const creditors = people
    .filter((p) => p.balance > eps)
    .sort((a, b) => b.balance - a.balance);
  const debtors = people
    .filter((p) => p.balance < -eps)
    .sort((a, b) => a.balance - b.balance);

  const settlements = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = { ...debtors[i] };
    const creditor = { ...creditors[j] };

    const amount = Math.min(creditor.balance, Math.abs(debtor.balance));
    const roundedAmount = Number(amount.toFixed(2));

    if (roundedAmount > 0) {
      settlements.push({
        from_user_id: debtor.id,
        from_name: debtor.name,
        to_user_id: creditor.id,
        to_name: creditor.name,
        amount: roundedAmount,
      });

      // update in arrays
      debtors[i].balance += roundedAmount; // less negative
      creditors[j].balance -= roundedAmount;

      if (Math.abs(debtors[i].balance) <= eps) i += 1;
      if (creditors[j].balance <= eps) j += 1;
    } else {
      break;
    }
  }

  return settlements;
};

const createSettlement = async (
  groupId,
  { from_user_id, to_user_id, amount },
  actorId,
) => {
  if (!from_user_id || !to_user_id || !amount || Number(amount) <= 0) {
    const error = new Error("Datos de settlement inválidos");
    error.status = 400;
    throw error;
  }

  // Verify both users are members of group
  const members = await pool.query(
    `
    SELECT user_id FROM group_members
    WHERE group_id = $1 AND user_id = ANY($2::uuid[])
    `,
    [groupId, [from_user_id, to_user_id]],
  );

  if (members.rowCount < 2) {
    const error = new Error("Ambos usuarios deben pertenecer al grupo");
    error.status = 400;
    throw error;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const insert = await client.query(
      `
      INSERT INTO settlements (group_id, from_user_id, to_user_id, amount, created_by)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *
      `,
      [groupId, from_user_id, to_user_id, amount, actorId],
    );

    const settlement = insert.rows[0];

    // Get user names for notification
    const ures = await client.query(
      `
      SELECT id, first_name, last_name FROM users WHERE id = ANY($1::uuid[])
      `,
      [[from_user_id, to_user_id]],
    );

    const uMap = {};
    for (const u of ures.rows)
      uMap[u.id] = `${u.first_name} ${u.last_name}`.trim();

    await createNotification(
      {
        groupId,
        actorId,
        type: "settlement_created",
        message: `${uMap[from_user_id] || from_user_id} pagó ${amount} a ${uMap[to_user_id] || to_user_id}`,
      },
      client,
    );

    await client.query("COMMIT");

    return settlement;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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
  updateExpense,
  listGroupExpenses,
  getExpense,
  deleteExpense,
  getGroupBalances,
  getGroupSettlements,
  createSettlement,
  getUserExpensesSummary,
};
