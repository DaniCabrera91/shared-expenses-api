const express = require("express");
authenticate = require("../middlewares/auth.middleware");

const router = express.Router();
const usersController = require("./users.controller");

router.get("/", usersController.getAllUsers);

router.get("/me", authenticate, (req, res) => {
  res.json({
    user: req.user,
  });
});

module.exports = router;
