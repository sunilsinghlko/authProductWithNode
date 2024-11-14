const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "5h" });

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findUserByEmail(email);
    if (existingUser)
      return res.status(400).json({ msg: "User already exists" });

    const newUser = await User.createUser({ username, email, password });
    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findUserByEmail(email);
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = generateToken(user.id);
    res.json({ msg: "Successfully login",token });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.updatePassword = async (req, res) => {
  const { userId } = req.user;
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findUserById(userId);
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Current password is incorrect" });

    await User.updatePassword(userId, newPassword);
    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findUserByEmail(email);
    console.log("userId and name:", user.id, user.username);

    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    await User.saveResetToken(user.id, resetToken);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      text: `Reset your password: http://localhost:3000/reset-password?token=${resetToken}`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error sending email", error: err.message });
      }
      res.status(200).json({ message: "Password reset email sent." });
    });
  } catch (error) {
    console.error("Error during password reset request:", error);
    res.status(500).json({ message: "Error requesting password reset" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findUserByResetToken(token);
    console.log("findUserByResetToken", user);

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    const updatedUser = await User.updatePassword(user.id, newPassword); 
    console.log("after updation:", updatedUser);

    await User.saveResetToken(user.id, null);
    console.log("Token cleared after reset:", user.id);

    return res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Error resetting password" });
  }
};
