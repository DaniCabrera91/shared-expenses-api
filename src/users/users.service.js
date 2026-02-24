const pool = require("../config/db");

const currentUser = async (userId) => {
  const result = await pool.query(
    `SELECT id, first_name, last_name, alias, email, updated_at
     FROM users
     WHERE id = $1`,
    [userId],
  );

  if (result.rows.length === 0) {
    throw new Error("Usuario no encontrado");
  }

  return result.rows[0];
};

const updateUser = async (userId, data) => {
  const fields = Object.keys(data);
  const values = Object.values(data);

  if (fields.length === 0) {
    throw new Error("No hay datos para actualizar");
  }

  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");

  const query = `
    UPDATE users
    SET ${setClause}, updated_at = NOW()
    WHERE id = $${fields.length + 1}
    RETURNING id, first_name, last_name, alias, email, updated_at
  `;

  const result = await pool.query(query, [...values, userId]);

  if (result.rowCount === 0) {
    throw new Error("Usuario no encontrado");
  }

  return result.rows[0];
};

module.exports = { currentUser, updateUser };
