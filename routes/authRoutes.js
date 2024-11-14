const express = require("express");
const { check } = require("express-validator");
const authController = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");
const router = express.Router();
const crypto = require("crypto");

router.post(
  "/register",
  [
    check("username", "Username is required").notEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Password is required and must be at least 6 characters"
    ).isLength({ min: 6 }),
  ],
  authController.register
);

router.post("/login", authController.login);

router.post(
  "/reset-password",
  [
    check("email", "Please include a valid email").isEmail(),
    check("resetToken", "Reset token is required").notEmpty(),
    check("newPassword", "New password must be at least 6 characters").isLength(
      { min: 6 }
    ),
  ],
  authController.resetPassword
);

router.post("/request-password-reset", authController.requestPasswordReset);

router.put(
  "/update-password",
  authenticate,
  [
    check("currentPassword", "Current password is required").notEmpty(),
    check("newPassword", "New password must be at least 6 characters").isLength(
      { min: 6 }
    ),
  ],
  authController.updatePassword
);

module.exports = router;
