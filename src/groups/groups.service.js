const pool = require("../config/db");
const { ensureNotLastAdmin } = require("../utils/lastAdmin");
const {
  createNotification,
} = require("../notifications/notifications.service");

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

const listUserGroups = async (userId, archived = false) => {
  const result = await pool.query(
    `
    SELECT g.id, g.name, g.emoji, g.currency, g.created_at
    FROM groups g
    JOIN group_members gm ON gm.group_id = g.id
    WHERE gm.user_id = $1
    AND g.is_archived = $2
    ORDER BY g.created_at DESC
    `,
    [userId, archived],
  );

  return result.rows;
};

const getGroup = async (groupId) => {
  const result = await pool.query(
    `
    SELECT id, name, emoji, currency, created_at
    FROM groups
    WHERE id = $1 AND is_archived = FALSE
    `,
    [groupId],
  );

  return result.rows[0];
};

const archiveGroup = async (groupId, userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      UPDATE groups
      SET is_archived = TRUE
      WHERE id = $1
      RETURNING *
      `,
      [groupId],
    );

    const group = result.rows[0];

    await createNotification(
      {
        groupId,
        actorId: userId,
        type: "group_archived",
        message: "El grupo ha sido archivado",
      },
      client,
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

const unarchiveGroup = async (groupId, userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      UPDATE groups
      SET is_archived = FALSE
      WHERE id = $1
      RETURNING *
      `,
      [groupId],
    );

    const group = result.rows[0];

    await createNotification(
      {
        groupId,
        actorId: userId,
        type: "group_unarchived",
        message: "El grupo ha sido recuperado",
      },
      client,
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

const updateMemberRole = async (groupId, userId, role, actorId) => {
  if (role !== "admin") {
    await ensureNotLastAdmin(groupId, userId);
  }

  const userResult = await pool.query(
    `
    SELECT first_name, last_name
    FROM users
    WHERE id = $1
    `,
    [userId],
  );

  const user = userResult.rows[0];
  const name = `${user.first_name} ${user.last_name}`.trim();

  const result = await pool.query(
    `
    UPDATE group_members
    SET role = $3
    WHERE group_id = $1 AND user_id = $2
    RETURNING *
    `,
    [groupId, userId, role],
  );

  if (result.rowCount === 0) {
    const error = new Error("Miembro no encontrado");
    error.status = 404;
    throw error;
  }

  const member = result.rows[0];

  await createNotification({
    groupId,
    actorId,
    type: "member_role_updated",
    message: `El rol de ${name} cambió a ${role}`,
  });

  return member;
};

const removeMember = async (groupId, userId, actorId) => {
  await ensureNotLastAdmin(groupId, userId);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      `
      SELECT first_name, last_name
      FROM users
      WHERE id = $1
      `,
      [userId],
    );

    const user = userResult.rows[0];
    const name = `${user.first_name} ${user.last_name}`.trim();

    await client.query(
      `
      DELETE FROM group_members
      WHERE group_id = $1 AND user_id = $2
      `,
      [groupId, userId],
    );

    await createNotification(
      {
        groupId,
        actorId,
        type: "member_removed",
        message: `${name} fue eliminado del grupo`,
      },
      client,
    );

    await client.query("COMMIT");

    return { success: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const leaveGroup = async (groupId, userId) => {
  await ensureNotLastAdmin(groupId, userId);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      `
      SELECT first_name, last_name
      FROM users
      WHERE id = $1
      `,
      [userId],
    );

    const user = userResult.rows[0];
    const name = `${user.first_name} ${user.last_name}`.trim();

    await client.query(
      `
      DELETE FROM group_members
      WHERE group_id = $1 AND user_id = $2
      `,
      [groupId, userId],
    );

    await createNotification(
      {
        groupId,
        actorId: userId,
        type: "member_left",
        message: `${name} ha abandonado el grupo`,
      },
      client,
    );

    await client.query("COMMIT");

    return { success: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createGroup,
  listUserGroups,
  getGroup,
  archiveGroup,
  unarchiveGroup,
  addParticipants,
  listMembers,
  updateMemberRole,
  removeMember,
  leaveGroup,
};
