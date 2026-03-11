const pool = require("../config/db");

const requireGroupAdmin = async (req, res, next) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `
      SELECT role
      FROM group_members
      WHERE group_id = $1 AND user_id = $2
      `,
      [groupId, userId],
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: "No perteneces a este grupo" });
    }

    if (result.rows[0].role !== "admin") {
      return res.status(403).json({ error: "Solo un admin puede hacer esto" });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = requireGroupAdmin;
