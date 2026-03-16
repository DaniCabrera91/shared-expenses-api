const { registerUser, loginUser } = require("../../src/auth/auth.service");
const { setupTestDb } = require("../helpers/testDb");

describe("auth.service", () => {
  setupTestDb();

  test("registerUser guarda usuario y retorna id/email/created_at", async () => {
    const user = await registerUser({
      first_name: "Test",
      last_name: "User",
      alias: "tuser",
      email: "t@u.com",
      password: "Password123",
    });

    expect(user).toHaveProperty("id");
    expect(user.email).toBe("t@u.com");
  });

  test("loginUser falla con contraseña incorrecta", async () => {
    await registerUser({
      first_name: "Test",
      last_name: "User",
      alias: "tuser",
      email: "t@u2.com",
      password: "Password123",
    });

    await expect(
      loginUser({ email: "t@u2.com", password: "wrong" }),
    ).rejects.toThrow("Credenciales inválidas");
  });
});
