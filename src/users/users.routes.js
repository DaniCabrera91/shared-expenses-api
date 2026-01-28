const express = require("express");
const router = express.Router();
const usersController = require("./users.controller");

router.get("/", usersController.getAllUsers);

module.exports = router;
