const {
  createGroup,
  addMembers,
  updateMemberRole,
  getGroupMembers,
  leaveGroup,
  removeMember,
} = require("./groups.service");

const create = async (req, res, next) => {
  try {
    const group = await createGroup(req.validatedData, req.user.id);

    res.status(201).json({
      message: "Grupo creado correctamente",
      group,
    });
  } catch (error) {
    next(error);
  }
};

const addMembersController = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    await addMembers(groupId, req.validatedData.participants);

    res.status(200).json({
      message: "Miembros añadidos correctamente",
    });
  } catch (error) {
    next(error);
  }
};

const updateRoleController = async (req, res, next) => {
  try {
    const { groupId, userId } = req.params;

    const member = await updateMemberRole(
      groupId,
      userId,
      req.validatedData.role,
    );

    res.status(200).json({
      message: "Rol actualizado correctamente",
      member,
    });
  } catch (error) {
    next(error);
  }
};

const listMembersController = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const members = await getGroupMembers(groupId);

    res.status(200).json({ members });
  } catch (error) {
    next(error);
  }
};

const leaveGroupController = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    await leaveGroup(groupId, req.user.id);

    res.status(200).json({
      message: "Has abandonado el grupo",
    });
  } catch (error) {
    next(error);
  }
};

const removeMemberController = async (req, res, next) => {
  try {
    const { groupId, userId } = req.params;

    await removeMember(groupId, userId);

    res.status(200).json({
      message: "Miembro eliminado correctamente",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  addMembersController,
  updateRoleController,
  listMembersController,
  leaveGroupController,
  removeMemberController,
};
