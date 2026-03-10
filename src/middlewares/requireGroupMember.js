const pool = require("../config/db");

const requireGroupMember = async (req, res, next) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `
      SELECT 1
      FROM group_members
      WHERE group_id = $1 AND user_id = $2
      `,
      [groupId, userId],
    );

    if (result.rowCount === 0) {
      return res.status(403).json({
        error: "No perteneces a este grupo",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = requireGroupMember;
