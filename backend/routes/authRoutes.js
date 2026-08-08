const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Authenticate the single admin user defined via .env and return a JWT
// @access  Public
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const validEmail = email.trim().toLowerCase() === (process.env.ADMIN_EMAIL || "").toLowerCase();
  const validPassword = password === process.env.ADMIN_PASSWORD;

  if (!validEmail || !validPassword) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = jwt.sign(
    { email, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

  return res.status(200).json({
    message: "Login successful.",
    token,
    admin: { email },
  });
});

module.exports = router;
