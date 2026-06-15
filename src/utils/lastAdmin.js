const pool = require("../config/db");

const ensureNotLastAdmin = async (groupId, userId) => {
  // Verificar si el usuario es admin
  const member = await pool.query(
    `
    SELECT role
    FROM group_members
    WHERE group_id = $1 AND user_id = $2
    `,
    [groupId, userId],
  );

  if (member.rowCount === 0) return;

  if (member.rows[0].role !== "admin") return;

  // Contar admins del grupo
  const result = await pool.query(
    `
    SELECT COUNT(*) 
    FROM group_members
    WHERE group_id = $1 AND role = 'admin'
    `,
    [groupId],
  );

  if (Number(result.rows[0].count) <= 1) {
    const error = new Error(
      "No puedes demotar o eliminar al último administrador del grupo",
    );
    error.status = 400;
    throw error;
  }
};

module.exports = {
  ensureNotLastAdmin,
};
