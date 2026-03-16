const request = require("supertest");
const app = require("../../src/app");
const { setupTestDb } = require("../helpers/testDb");

describe("Auth routes", () => {
  setupTestDb();

  test("POST /api/auth/register crea usuario y responde 201", async () => {
    const res = await request(app).post("/api/auth/register").send({
      first_name: "Admin",
      last_name: "Test",
      alias: "admin",
      email: "admin123@test.com",
      password: "Password1234",
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user.email).toBe("admin123@test.com");
  });
});
