const {
  createExpense,
  listGroupExpenses,
  getGroupBalances,
} = require("../../src/expenses/expenses.service");
const {
  createGroup,
  addParticipants,
} = require("../../src/groups/groups.service");
const { registerUser } = require("../../src/auth/auth.service");
const { setupTestDb } = require("../helpers/testDb");

describe("expenses.service", () => {
  setupTestDb();

  let testUser, testUser2, group;

  beforeEach(async () => {
    testUser = await registerUser({
      first_name: "User1",
      email: "user1@example.com",
      password: "Password123",
    });
    testUser2 = await registerUser({
      first_name: "User2",
      email: "user2@example.com",
      password: "Password123",
    });
    group = await createGroup({ name: "Test Group" }, testUser.id);
    await addParticipants(group.id, [{ user_id: testUser2.id }]);
  });

  test("createExpense crea gasto con shares", async () => {
    const expense = await createExpense(
      group.id,
      {
        description: "Dinner",
        total_amount: 100,
        currency: "EUR",
        paid_by: testUser.id,
        shares: [
          { user_id: testUser.id, amount_owed: 50 },
          { user_id: testUser2.id, amount_owed: 50 },
        ],
      },
      testUser.id,
    );

    expect(expense.description).toBe("Dinner");
    expect(expense.total_amount).toBe("100.00");
  });

  test("createExpense falla si suma de shares no coincide", async () => {
    await expect(
      createExpense(
        group.id,
        {
          description: "Dinner",
          total_amount: 100,
          currency: "EUR",
          paid_by: testUser.id,
          shares: [
            { user_id: testUser.id, amount_owed: 30 },
            { user_id: testUser2.id, amount_owed: 30 },
          ],
        },
        testUser.id,
      ),
    ).rejects.toThrow("La suma de las deudas no coincide con el total");
  });

  test("getGroupBalances calcula balances correctos", async () => {
    await createExpense(
      group.id,
      {
        description: "Dinner",
        total_amount: 100,
        currency: "EUR",
        paid_by: testUser.id,
        shares: [
          { user_id: testUser.id, amount_owed: 50 },
          { user_id: testUser2.id, amount_owed: 50 },
        ],
      },
      testUser.id,
    );

    const balances = await getGroupBalances(group.id);
    expect(balances).toHaveLength(2);
  });
});
