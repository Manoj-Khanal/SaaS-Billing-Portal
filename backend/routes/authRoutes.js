const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  me,
} = require("../controllers/authController");

const {
  protect,
} = require("../middleware/auth");

// ========================================
// REGISTER
// ========================================

router.post(
  "/register",
  registerUser
);

// ========================================
// LOGIN
// ========================================

router.post(
  "/login",
  loginUser
);

// ========================================
// CURRENT USER
// ========================================

router.get(
  "/me",
  protect,
  me
);

module.exports = router;