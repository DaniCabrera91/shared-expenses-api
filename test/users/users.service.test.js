const { currentUser, updateUser } = require("../../src/users/users.service");
const { registerUser } = require("../../src/auth/auth.service");
const { setupTestDb } = require("../helpers/testDb");

describe("users.service", () => {
  setupTestDb();

  let testUser;

  beforeEach(async () => {
    testUser = await registerUser({
      first_name: "Test",
      last_name: "User",
      email: "test@example.com",
      password: "Password123",
    });
  });

  test("currentUser retorna datos del usuario", async () => {
    const user = await currentUser(testUser.id);
    expect(user.id).toBe(testUser.id);
    expect(user.email).toBe("test@example.com");
  });

  test("updateUser actualiza campos y retorna usuario actualizado", async () => {
    const updated = await updateUser(testUser.id, { alias: "newalias" });
    expect(updated.alias).toBe("newalias");
  });

  test("updateUser falla si usuario no existe", async () => {
    await expect(
      updateUser("00000000-0000-0000-0000-000000000000", { alias: "test" }),
    ).rejects.toThrow("Usuario no encontrado");
  });
});
