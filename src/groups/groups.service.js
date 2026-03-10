const pool = require("../../config/db");
const { ensureNotLastAdmin } = require("../utils/lastAdmin");

const createGroup = async ({ name, emoji, currency }, userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const groupResult = await client.query(
      `
      INSERT INTO groups (name, emoji, currency, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [name, emoji, currency || "EUR", userId],
    );

    const group = groupResult.rows[0];

    await client.query(
      `
      INSERT INTO group_members (group_id, user_id, role)
      VALUES ($1, $2, 'admin')
      `,
      [group.id, userId],
    );

    await client.query("COMMIT");

    return group;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const listUserGroups = async (userId) => {
  const result = await pool.query(
    `
    SELECT g.id, g.name, g.emoji, g.currency, g.created_at
    FROM groups g
    JOIN group_members gm ON gm.group_id = g.id
    WHERE gm.user_id = $1
    AND g.is_archived = FALSE
    ORDER BY g.created_at DESC
    `,
    [userId],
  );

  return result.rows;
};

const archiveGroup = async (groupId) => {
  const result = await pool.query(
    `
    UPDATE groups
    SET is_archived = TRUE
    WHERE id = $1
    RETURNING *
    `,
    [groupId],
  );

  return result.rows[0];
};

const addParticipants = async (groupId, participants) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const participant of participants) {
      await client.query(
        `
        INSERT INTO group_members (group_id, user_id)
        VALUES ($1, $2)
        ON CONFLICT (group_id, user_id) DO NOTHING
        `,
        [groupId, participant.user_id],
      );
    }

    await client.query("COMMIT");

    return { success: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const listMembers = async (groupId) => {
  const result = await pool.query(
    `
    SELECT u.id, u.first_name, u.last_name, u.email, gm.role
    FROM group_members gm
    JOIN users u ON u.id = gm.user_id
    WHERE gm.group_id = $1
    `,
    [groupId],
  );

  return result.rows;
};

const updateMemberRole = async (groupId, userId, role) => {
  if (role !== "admin") {
    await ensureNotLastAdmin(groupId);
  }

  const result = await pool.query(
    `
    UPDATE group_members
    SET role = $3
    WHERE group_id = $1 AND user_id = $2
    RETURNING *
    `,
    [groupId, userId, role],
  );

  return result.rows[0];
};

const removeMember = async (groupId, userId) => {
  await ensureNotLastAdmin(groupId);

  await pool.query(
    `
    DELETE FROM group_members
    WHERE group_id = $1 AND user_id = $2
    `,
    [groupId, userId],
  );

  return { success: true };
};

const leaveGroup = async (groupId, userId) => {
  await ensureNotLastAdmin(groupId);

  await pool.query(
    `
    DELETE FROM group_members
    WHERE group_id = $1 AND user_id = $2
    `,
    [groupId, userId],
  );

  return { success: true };
};

module.exports = {
  createGroup,
  listUserGroups,
  archiveGroup,
  addParticipants,
  listMembers,
  updateMemberRole,
  removeMember,
  leaveGroup,
};
