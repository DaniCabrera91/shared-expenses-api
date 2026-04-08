const pool = require("../config/db");
const { hashPassword } = require("../utils/hash");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const REFRESH_TOKEN_EXPIRES_DAYS = Number(
  process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30,
);

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

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

const loginUser = async ({ email, password }) => {
  const result = await pool.query(
    "SELECT id, email, password_hash FROM users WHERE email = $1",
    [email],
  );

  if (result.rows.length === 0) {
    throw new Error("Credenciales inválidas");
  }

  const user = result.rows[0];

  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    throw new Error("Credenciales inválidas");
  }

  return {
    id: user.id,
    email: user.email,
  };
};

const generateRefreshToken = () => crypto.randomBytes(64).toString("hex");

const createRefreshToken = async (userId) => {
  const refreshToken = generateRefreshToken();
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  );

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt],
  );

  return refreshToken;
};

const revokeRefreshToken = async (refreshToken) => {
  const tokenHash = hashToken(refreshToken);

  await pool.query(
    `UPDATE refresh_tokens
     SET revoked = TRUE
     WHERE token_hash = $1
       AND revoked = FALSE`,
    [tokenHash],
  );
};

const refreshAccessToken = async (refreshToken) => {
  const tokenHash = hashToken(refreshToken);

  const result = await pool.query(
    `SELECT id, user_id
     FROM refresh_tokens
     WHERE token_hash = $1
       AND revoked = FALSE
       AND expires_at > NOW()`,
    [tokenHash],
  );

  if (result.rows.length === 0) {
    throw new Error("Refresh token inválido o expirado");
  }

  const refreshRow = result.rows[0];

  await pool.query(
    `UPDATE refresh_tokens
     SET revoked = TRUE
     WHERE id = $1`,
    [refreshRow.id],
  );

  const newRefreshToken = await createRefreshToken(refreshRow.user_id);

  const userResult = await pool.query(
    `SELECT id, email FROM users WHERE id = $1`,
    [refreshRow.user_id],
  );

  if (userResult.rows.length === 0) {
    throw new Error("Usuario no encontrado");
  }

  const user = userResult.rows[0];

  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    subject: user.id,
    expiresIn: "1h",
  });

  return { token, refreshToken: newRefreshToken };
};

module.exports = {
  registerUser,
  loginUser,
  createRefreshToken,
  refreshAccessToken,
  revokeRefreshToken,
};
