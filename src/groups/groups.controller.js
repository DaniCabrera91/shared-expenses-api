const {
  createGroup,
  addMembers,
  updateMemberRole,
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

module.exports = {
  create,
  addMembersController,
  updateRoleController,
};
