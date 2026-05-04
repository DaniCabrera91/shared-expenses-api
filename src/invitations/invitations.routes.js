const express = require("express");
const controller = require("./invitations.controller");
const authenticate = require("../middlewares/auth.middleware");
const requireGroupAdmin = require("../middlewares/requireGroupAdmin.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createInvitationSchema,
  joinWithInvitationSchema,
} = require("./invitations.validation");

const router = express.Router();

// Crear invitación (solo admin)
router.post(
  "/groups/:groupId/invitations",
  authenticate,
  requireGroupAdmin,
  validate(createInvitationSchema),
  controller.createInvitation,
);

// Validar token de invitación (público)
router.get("/invitations/:token", controller.validateInvitation);

// Unirse a grupo con token (requiere auth)
router.post(
  "/invitations/join",
  authenticate,
  validate(joinWithInvitationSchema),
  controller.joinWithInvitation,
);

module.exports = router;
