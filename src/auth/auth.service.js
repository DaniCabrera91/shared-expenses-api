const pool = require("../config/db");
const { hashPassword } = require("../utils/hash");

const registerUser = async ({
  first_name,
  last_name,
  alias,
  email,
  password,
}) => {
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
