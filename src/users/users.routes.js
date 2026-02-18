const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const usersController = require("./users.controller");
const validate = require("../middlewares/validate.middleware");
const { registerSchema } = require("../auth/auth.validation");

const router = express.Router();

router.get("/me", authenticate, usersController.currentUser);
router.patch(
  "/me",
  validate(registerSchema),
  authenticate,
  usersController.updateUser,
);

module.exports = router;
