const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const requireGroupAdmin = require("../middlewares/groupAdmin.middleware");

const {
  createGroupSchema,
  addMembersSchema,
  updateRoleSchema,
} = require("./groups.validation");

const {
  create,
  addMembersController,
  updateRoleController,
} = require("./groups.controller");

const router = express.Router();

router.post("/", authenticate, validate(createGroupSchema), create);

router.post(
  "/:groupId/members",
  authenticate,
  requireGroupAdmin,
  validate(addMembersSchema),
  addMembersController,
);

router.patch(
  "/:groupId/members/:userId/role",
  authenticate,
  requireGroupAdmin,
  validate(updateRoleSchema),
  updateRoleController,
);

module.exports = router;
