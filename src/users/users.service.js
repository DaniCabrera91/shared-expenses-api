const pool = require("../config/db");

const currentUser = async (userId) => {
  const result = await pool.query(
    "SELECT id, first_name, last_name, alias, email FROM users WHERE id = $1",
    [userId],
  );

  if (result.rows.length === 0) {
    throw new Error("Usuario no encontrado");
  }

  return result.rows[0];
};

module.exports = { currentUser };
