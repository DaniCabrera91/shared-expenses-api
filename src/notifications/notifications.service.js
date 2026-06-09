const pool = require("../config/db");

const createNotification = async (
  { groupId, actorId, type, message },
  client = pool,
) => {
  const result = await client.query(
    `
      INSERT INTO group_notifications (group_id, actor_id, type, message)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [groupId, actorId, type, message],
  );

  return result.rows[0];
};

const listGroupNotifications = async (groupId, limit = 20) => {
  const result = await pool.query(
    `
      SELECT gn.id, gn.group_id, gn.actor_id, gn.type, gn.message, gn.created_at,
        u.first_name, u.last_name
      FROM group_notifications gn
      JOIN users u ON u.id = gn.actor_id
      WHERE gn.group_id = $1
      ORDER BY gn.created_at DESC
      LIMIT $2
    `,
    [groupId, limit],
  );

  return result.rows.map((row) => ({
    ...row,
    actor_name: `${row.first_name} ${row.last_name}`.trim(),
  }));
};

module.exports = {
  createNotification,
  listGroupNotifications,
};
