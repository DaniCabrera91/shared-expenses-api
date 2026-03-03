const pool = require("../config/db");

const createGroup = async (data, creatorId) => {
  const { name, emoji, currency, participants = [] } = data;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const groupResult = await client.query(
      `
      INSERT INTO groups (name, emoji, currency, created_by)
      VALUES ($1, $2, COALESCE($3, 'EUR'), $4)
      RETURNING id, name, emoji, currency, created_at
      `,
      [name, emoji || null, currency || null, creatorId],
    );

    const group = groupResult.rows[0];

    // Insert creator as admin
    await client.query(
      `
      INSERT INTO group_members (group_id, user_id, display_name, role)
      SELECT $1, u.id, COALESCE(u.alias, u.first_name), 'admin'
      FROM users u
      WHERE u.id = $2
      `,
      [group.id, creatorId],
    );

    const uniqueIds = [
      ...new Set(
        participants.map((p) => p.user_id).filter((id) => id !== creatorId),
      ),
    ];

    if (uniqueIds.length > 0) {
      await client.query(
        `
        INSERT INTO group_members (group_id, user_id, display_name, role)
        SELECT $1, u.id, COALESCE(u.alias, u.first_name), 'member'
        FROM users u
        WHERE u.id = ANY($2::uuid[])
        `,
        [group.id, uniqueIds],
      );
    }

    await client.query("COMMIT");
    return group;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const addMembers = async (groupId, participants) => {
  const ids = [...new Set(participants.map((p) => p.user_id))];

  if (ids.length === 0) return;

  await pool.query(
    `
    INSERT INTO group_members (group_id, user_id, display_name, role)
    SELECT $1, u.id, COALESCE(u.alias, u.first_name), 'member'
    FROM users u
    WHERE u.id = ANY($2::uuid[])
    ON CONFLICT (group_id, user_id) DO NOTHING
    `,
    [groupId, ids],
  );
};

const updateMemberRole = async (groupId, targetUserId, newRole) => {
  if (newRole === "member") {
    const adminCount = await pool.query(
      `
      SELECT COUNT(*) FROM group_members
      WHERE group_id = $1 AND role = 'admin'
      `,
      [groupId],
    );

    if (Number(adminCount.rows[0].count) <= 1) {
      throw new Error("No puedes quitar el último admin");
    }
  }

  const result = await pool.query(
    `
    UPDATE group_members
    SET role = $1
    WHERE group_id = $2 AND user_id = $3
    RETURNING *
    `,
    [newRole, groupId, targetUserId],
  );

  if (result.rowCount === 0) {
    throw new Error("Miembro no encontrado");
  }

  return result.rows[0];
};

module.exports = {
  createGroup,
  addMembers,
  updateMemberRole,
};
