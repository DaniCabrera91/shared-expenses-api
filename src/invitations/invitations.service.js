const crypto = require("crypto");
const pool = require("../config/db");
const {
  createNotification,
} = require("../notifications/notifications.service");

const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const createInvitation = async (groupId, userId, expiresInDays = 7) => {
  // Verificar que el usuario es admin del grupo
  const adminCheck = await pool.query(
    `
    SELECT role FROM group_members
    WHERE group_id = $1 AND user_id = $2
    `,
    [groupId, userId],
  );

  if (adminCheck.rowCount === 0 || adminCheck.rows[0].role !== "admin") {
    const error = new Error("Solo admins pueden crear invitaciones");
    error.status = 403;
    throw error;
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      INSERT INTO group_invitations (group_id, token, created_by, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [groupId, token, userId, expiresAt],
    );

    const invitation = result.rows[0];

    await createNotification(
      {
        groupId,
        actorId: userId,
        type: "invitation_sent",
        message: "Se ha creado una nueva invitación para unirse al grupo",
      },
      client,
    );

    await client.query("COMMIT");

    return invitation;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const validateInvitation = async (token) => {
  const result = await pool.query(
    `
    SELECT gi.*, g.name, g.emoji
    FROM group_invitations gi
    JOIN groups g ON g.id = gi.group_id
    WHERE gi.token = $1
    `,
    [token],
  );

  if (result.rowCount === 0) {
    const error = new Error("Invitación no válida");
    error.status = 404;
    throw error;
  }

  const invitation = result.rows[0];

  // Verificar expiración
  if (new Date() > new Date(invitation.expires_at)) {
    const error = new Error("Invitación expirada");
    error.status = 410;
    throw error;
  }

  return invitation;
};

const joinGroupWithInvitation = async (token, userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const invitation = await validateInvitation(token);

    // Verificar si ya es miembro
    const memberCheck = await client.query(
      `
      SELECT id FROM group_members
      WHERE group_id = $1 AND user_id = $2
      `,
      [invitation.group_id, userId],
    );

    if (memberCheck.rowCount > 0) {
      const error = new Error("Ya eres miembro de este grupo");
      error.status = 409;
      throw error;
    }

    // Agregar usuario al grupo
    await client.query(
      `
      INSERT INTO group_members (group_id, user_id, role)
      VALUES ($1, $2, 'member')
      `,
      [invitation.group_id, userId],
    );

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

    await createNotification(
      {
        groupId: invitation.group_id,
        actorId: userId,
        type: "member_joined",
        message: `${name} se ha unido al grupo`,
      },
      client,
    );

    // Incrementar contador de joins
    await client.query(
      `
      UPDATE group_invitations
      SET joined_count = joined_count + 1
      WHERE id = $1
      `,
      [invitation.id],
    );

    await client.query("COMMIT");

    return {
      groupId: invitation.group_id,
      groupName: invitation.name,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createInvitation,
  validateInvitation,
  joinGroupWithInvitation,
};
