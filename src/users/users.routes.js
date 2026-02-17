const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const usersController = require("./users.controller");

const router = express.Router();

router.get("/me", authenticate, usersController.currentUser);
router.patch("/me", authenticate, usersController.updateUser);

module.exports = router;
