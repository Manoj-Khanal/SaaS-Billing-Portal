const express = require("express");

const router = express.Router();

const {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  stats,
} = require("../controllers/customerController");

const {
  protect,
  adminOnly,
} = require("../middleware/auth");

// ========================================
// PROTECT ALL CUSTOMER ROUTES
// ========================================

router.use(protect);

// ========================================
// CUSTOMER STATISTICS
// ========================================

router.get(
  "/stats",
  stats
);

// ========================================
// GET ALL CUSTOMERS
// ========================================

router.get(
  "/",
  getCustomers
);

// ========================================
// CREATE CUSTOMER - ADMIN ONLY
// ========================================

router.post(
  "/",
  adminOnly,
  createCustomer
);

// ========================================
// UPDATE CUSTOMER - ADMIN ONLY
// ========================================

router.put(
  "/:id",
  adminOnly,
  updateCustomer
);

// ========================================
// DELETE CUSTOMER - ADMIN ONLY
// ========================================

router.delete(
  "/:id",
  adminOnly,
  deleteCustomer
);

module.exports = router;