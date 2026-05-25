const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const validate = require("../middlewares/validate.middleware");
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} = require("./auth.validation");

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

// Cambiar contraseña (autenticado)
const authenticate = require("../middlewares/auth.middleware");
router.patch(
  "/password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);

module.exports = router;
