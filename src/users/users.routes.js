const express = require("express");
authenticate = require("../middlewares/auth.middleware");

const router = express.Router();
const usersController = require("./users.controller");

router.get("/me", authenticate, usersController.currentUser);

module.exports = router;
