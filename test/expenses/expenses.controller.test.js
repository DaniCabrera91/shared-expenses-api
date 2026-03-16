const request = require("supertest");
const app = require("../../src/app");
const { createTestUserAndToken } = require("../helpers/authHelper");
const { createGroup } = require("../../src/groups/groups.service");
const { setupTestDb } = require("../helpers/testDb");

describe("Expenses routes", () => {
  setupTestDb();

  let token, user, group;

  beforeEach(async () => {
    const data = await createTestUserAndToken();
    token = data.token;
    user = data.user;
    group = await createGroup({ name: "Test Group" }, user.id);
  });

  test("POST /api/expenses/groups/:groupId/expenses crea gasto", async () => {
    const res = await request(app)
      .post(`/api/expenses/groups/${group.id}/expenses`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        description: "Lunch",
        total_amount: 50,
        currency: "EUR",
        paid_by: user.id,
        shares: [{ user_id: user.id, amount_owed: 50 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.description).toBe("Lunch");
  });

  test("GET /api/expenses/groups/:groupId/expenses lista gastos", async () => {
    await request(app)
      .post(`/api/expenses/groups/${group.id}/expenses`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        description: "Lunch",
        total_amount: 50,
        currency: "EUR",
        paid_by: user.id,
        shares: [{ user_id: user.id, amount_owed: 50 }],
      });

    const res = await request(app)
      .get(`/api/expenses/groups/${group.id}/expenses`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});
