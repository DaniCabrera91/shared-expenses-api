const pool = require("../config/db");

const requireExpenseAuthorOrAdmin = async (req, res, next) => {
  const { expenseId } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `
      SELECT e.group_id, e.created_by
      FROM expenses e
      WHERE e.id = $1
      `,
      [expenseId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Gasto no encontrado" });
    }

    const { group_id, created_by } = result.rows[0];

    // Verificar si es el autor del gasto
    if (created_by === userId) {
      return next();
    }

    // Verificar si es admin del grupo
    const adminCheck = await pool.query(
      `
      SELECT 1
      FROM group_members
      WHERE group_id = $1 AND user_id = $2 AND role = 'admin'
      `,
      [group_id, userId],
    );

    if (adminCheck.rowCount > 0) {
      return next();
    }

    return res
      .status(403)
      .json({ error: "No tienes permiso para modificar este gasto" });
  } catch (error) {
    next(error);
  }
};

module.exports = requireExpenseAuthorOrAdmin;
