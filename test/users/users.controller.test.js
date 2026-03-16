const request = require("supertest");
const app = require("../../src/app");
const { createTestUserAndToken } = require("../helpers/authHelper");
const { setupTestDb } = require("../helpers/testDb");

describe("Users routes", () => {
  setupTestDb();

  let token;

  beforeEach(async () => {
    const { token: t } = await createTestUserAndToken();
    token = t;
  });

  test("GET /api/users/me retorna usuario autenticado", async () => {
    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user.email).toBe("test@example.com");
  });
});
