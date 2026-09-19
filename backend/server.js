require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const app = express();

// ================================
// DATABASE CONNECTION
// ================================

connectDB();

// ================================
// MIDDLEWARE
// ================================

app.use(cors());
app.use(express.json());

// ================================
// ROOT ROUTE
// ================================

app.get("/", (req, res) => {
  res.json({
    message: "SaaS Billing Portal API is running",
  });
});

// ================================
// API ROUTES
// ================================

app.use(
  "/api/auth",
  require("./routes/authRoutes")
);

app.use(
  "/api/customers",
  require("./routes/customerRoutes")
);

// ================================
// SERVER
// ================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});