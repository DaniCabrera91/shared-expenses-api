const {
  createGroup,
  listUserGroups,
  addParticipants,
  listMembers,
  updateMemberRole,
  removeMember,
  leaveGroup,
} = require("../../src/groups/groups.service");
const { registerUser } = require("../../src/auth/auth.service");
const { setupTestDb } = require("../helpers/testDb");

describe("groups.service", () => {
  setupTestDb();

  let testUser, testUser2;

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
  });

  test("createGroup crea grupo y agrega creador como admin", async () => {
    const group = await createGroup({ name: "Test Group" }, testUser.id);
    expect(group.name).toBe("Test Group");
    expect(group.created_by).toBe(testUser.id);

    const members = await listMembers(group.id);
    expect(members).toHaveLength(1);
    expect(members[0].role).toBe("admin");
  });

  test("addParticipants agrega miembros al grupo", async () => {
    const group = await createGroup({ name: "Test Group" }, testUser.id);
    await addParticipants(group.id, [{ user_id: testUser2.id }]);

    const members = await listMembers(group.id);
    expect(members).toHaveLength(2);
  });

  test("listUserGroups retorna grupos del usuario", async () => {
    await createGroup({ name: "Group1" }, testUser.id);
    await createGroup({ name: "Group2" }, testUser.id);

    const groups = await listUserGroups(testUser.id);
    expect(groups).toHaveLength(2);
  });

  test("no permite demotar al último admin", async () => {
    const group = await createGroup({ name: "Test Group" }, testUser.id);

    await expect(
      updateMemberRole(group.id, testUser.id, "member", testUser.id),
    ).rejects.toThrow(
      "No puedes demotar o eliminar al último administrador del grupo",
    );
  });

  test("no permite eliminar al último admin", async () => {
    const group = await createGroup({ name: "Test Group" }, testUser.id);

    await expect(
      removeMember(group.id, testUser.id, testUser.id),
    ).rejects.toMatchObject({
      status: 400,
      message: "No puedes demotar o eliminar al último administrador del grupo",
    });
  });

  test("no permite al último admin abandonar el grupo", async () => {
    const group = await createGroup({ name: "Test Group" }, testUser.id);

    await expect(leaveGroup(group.id, testUser.id)).rejects.toMatchObject({
      status: 400,
      message: "No puedes demotar o eliminar al último administrador del grupo",
    });
  });
});
