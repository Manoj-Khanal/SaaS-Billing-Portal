const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ========================================
// CREATE JWT TOKEN
// ========================================

const token = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

// ========================================
// REGISTER USER
// ========================================

exports.registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    // Clean email
    const cleanEmail = email
      .toLowerCase()
      .trim();

    // Check if user already exists
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create user
    const user = await User.create({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role:
        role === "Admin"
          ? "Admin"
          : "Employee",
    });

    // Send response
    res.status(201).json({
      message: "Registration successful",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ========================================
// LOGIN USER
// ========================================

exports.loginUser = async (req, res) => {
  try {
    const email = (
      req.body.email || ""
    )
      .toLowerCase()
      .trim();

    const password =
      req.body.password || "";

    // Find user
    const user = await User.findOne({
      email,
    });

    // Validate credentials
    if (
      !user ||
      !(await bcrypt.compare(
        password,
        user.password
      ))
    ) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate token
    const jwtToken = token(user);

    // Send response
    res.json({
      message: "Login successful",

      token: jwtToken,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ========================================
// GET CURRENT USER
// ========================================

exports.me = async (req, res) => {
  const user = await User.findById(
    req.user.id
  ).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({
      message: "User not found",
    });
  }
};