const jwt = require("jsonwebtoken");

// ========================================
// PROTECT ROUTE
// ========================================

const protect = (req, res, next) => {
  const authorization =
    req.headers.authorization || "";

  const token = authorization.startsWith(
    "Bearer "
  )
    ? authorization.slice(7)
    : null;

  // No token
  if (!token) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  try {
    // Verify JWT token
    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

// ========================================
// ADMIN ONLY
// ========================================

const adminOnly = (req, res, next) => {
  if (req.user?.role === "Admin") {
    return next();
  }

  return res.status(403).json({
    message: "Admin access required",
  });
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  protect,
  adminOnly,
};