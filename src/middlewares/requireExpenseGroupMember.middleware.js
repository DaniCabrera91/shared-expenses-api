const pool = require("../config/db");

const requireExpenseGroupMember = async (req, res, next) => {
  const { expenseId } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `
      SELECT e.group_id
      FROM expenses e
      WHERE e.id = $1
      `,
      [expenseId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Gasto no encontrado" });
    }

    const groupId = result.rows[0].group_id;
    const membership = await pool.query(
      `
      SELECT 1
      FROM group_members
      WHERE group_id = $1 AND user_id = $2
      `,
      [groupId, userId],
    );

    if (membership.rowCount === 0) {
      return res.status(403).json({ error: "No perteneces a este grupo" });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = requireExpenseGroupMember;
