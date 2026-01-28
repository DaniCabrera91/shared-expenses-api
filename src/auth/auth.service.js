const pool = require("../config/db");
const { hashPassword } = require("../utils/hash");

const registerUser = async ({
  first_name,
  last_name,
  alias,
  email,
  password,
}) => {
  // Verificar si email ya existe
  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email],
  );

  if (existingUser.rows.length > 0) {
    throw new Error("Este email ya está registrado");
  }

  const passwordHash = await hashPassword(password);

  const query = `
    INSERT INTO users (first_name, last_name, alias, email, password_hash)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, email, created_at
  `;

  const values = [first_name, last_name, alias, email, passwordHash];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

module.exports = { registerUser };
