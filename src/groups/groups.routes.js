const express = require("express");
const router = express.Router();

const controller = require("./groups.controller");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authenticate");
const requireGroupAdmin = require("../../middlewares/requireGroupAdmin");
const requireGroupMember = require("../../middlewares/requireGroupMember");

const {
  createGroupSchema,
  addParticipantsSchema,
  updateRoleSchema,
} = require("./groups.validation");

router.use(authenticate);

router.post("/", validate(createGroupSchema), controller.createGroup);

router.get("/", controller.listGroups);

router.patch("/:groupId/archive", requireGroupAdmin, controller.archiveGroup);

router.post(
  "/:groupId/members",
  requireGroupAdmin,
  validate(addParticipantsSchema),
  controller.addParticipants,
);

router.get("/:groupId/members", requireGroupMember, controller.listMembers);

router.patch(
  "/:groupId/members/:userId/role",
  requireGroupAdmin,
  validate(updateRoleSchema),
  controller.updateMemberRole,
);

router.delete(
  "/:groupId/members/:userId",
  requireGroupAdmin,
  controller.removeMember,
);

router.delete("/:groupId/leave", requireGroupMember, controller.leaveGroup);

module.exports = router;
