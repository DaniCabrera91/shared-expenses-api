const jwt = require("jsonwebtoken");
const { registerUser } = require("../../src/auth/auth.service");

const createTestUserAndToken = async () => {
  const user = await registerUser({
    first_name: "Test",
    last_name: "User",
    email: "test@example.com",
    password: "Password123",
  });
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    subject: user.id,
    expiresIn: "1h",
  });
  return { user, token };
};

module.exports = { createTestUserAndToken };
