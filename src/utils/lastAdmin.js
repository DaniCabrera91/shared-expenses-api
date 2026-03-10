const pool = require("../../config/db");

const ensureNotLastAdmin = async (groupId) => {
  const result = await pool.query(
    `
    SELECT COUNT(*) 
    FROM group_members
    WHERE group_id = $1 AND role = 'admin'
    `,
    [groupId],
  );

  if (Number(result.rows[0].count) <= 1) {
    throw new Error("No puedes eliminar al último admin del grupo");
  }
};

module.exports = {
  ensureNotLastAdmin,
};
