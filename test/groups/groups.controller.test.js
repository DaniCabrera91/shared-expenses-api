const request = require("supertest");
const app = require("../../src/app");
const { createTestUserAndToken } = require("../helpers/authHelper");
const { setupTestDb } = require("../helpers/testDb");

describe("Groups routes", () => {
  setupTestDb();

  let token, user;

  beforeEach(async () => {
    const data = await createTestUserAndToken();
    token = data.token;
    user = data.user;
  });

  test("POST /api/groups crea grupo", async () => {
    const res = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Group", currency: "USD" });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("New Group");
  });

  test("GET /api/groups/:id/members lista miembros", async () => {
    const groupRes = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Group" });

    const res = await request(app)
      .get(`/api/groups/${groupRes.body.id}/members`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});
