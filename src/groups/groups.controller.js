const groupsService = require("./groups.service");

const createGroup = async (req, res, next) => {
  try {
    const group = await groupsService.createGroup(
      req.validatedData,
      req.user.id,
    );

    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
};

const listGroups = async (req, res, next) => {
  try {
    const groups = await groupsService.listUserGroups(req.user.id);
    res.json(groups);
  } catch (error) {
    next(error);
  }
};

const getGroup = async (req, res, next) => {
  try {
    const group = await groupsService.getGroup(req.params.groupId);

    res.json(group);
  } catch (error) {
    next(error);
  }
};

const archiveGroup = async (req, res, next) => {
  try {
    const group = await groupsService.archiveGroup(req.params.groupId);
    res.json(group);
  } catch (error) {
    next(error);
  }
};

const addParticipants = async (req, res, next) => {
  try {
    const result = await groupsService.addParticipants(
      req.params.groupId,
      req.validatedData.participants,
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const listMembers = async (req, res, next) => {
  try {
    const members = await groupsService.listMembers(req.params.groupId);
    res.json(members);
  } catch (error) {
    next(error);
  }
};

const updateMemberRole = async (req, res, next) => {
  try {
    const member = await groupsService.updateMemberRole(
      req.params.groupId,
      req.params.userId,
      req.validatedData.role,
    );

    res.json(member);
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const result = await groupsService.removeMember(
      req.params.groupId,
      req.params.userId,
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const leaveGroup = async (req, res, next) => {
  try {
    const result = await groupsService.leaveGroup(
      req.params.groupId,
      req.user.id,
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGroup,
  listGroups,
  getGroup,
  archiveGroup,
  addParticipants,
  listMembers,
  updateMemberRole,
  removeMember,
  leaveGroup,
};
