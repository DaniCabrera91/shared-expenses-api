const invitationsService = require("./invitations.service");

const createInvitation = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { expiresIn } = req.validatedData;
    const userId = req.user.id;

    const invitation = await invitationsService.createInvitation(
      groupId,
      userId,
      expiresIn,
    );

    res.status(201).json({
      id: invitation.id,
      token: invitation.token,
      expiresAt: invitation.expires_at,
    });
  } catch (error) {
    next(error);
  }
};

const validateInvitation = async (req, res, next) => {
  try {
    const { token } = req.params;

    const invitation = await invitationsService.validateInvitation(token);

    res.status(200).json({
      groupId: invitation.group_id,
      groupName: invitation.name,
      groupEmoji: invitation.emoji,
      expiresAt: invitation.expires_at,
    });
  } catch (error) {
    next(error);
  }
};

const joinWithInvitation = async (req, res, next) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    const result = await invitationsService.joinGroupWithInvitation(
      token,
      userId,
    );

    res.status(200).json({
      message: `Te has unido al grupo ${result.groupName}`,
      groupId: result.groupId,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvitation,
  validateInvitation,
  joinWithInvitation,
};
