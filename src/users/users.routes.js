const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const usersController = require("./users.controller");
const validate = require("../middlewares/validate.middleware");
const { updateUserSchema } = require("./users.validation");

const router = express.Router();

router.get("/me", authenticate, usersController.currentUser);
router.patch(
  "/me",
  authenticate,
  validate(updateUserSchema),
  usersController.updateUser,
);

module.exports = router;
