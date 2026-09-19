const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    plan: {
      type: String,
      enum: ["Basic", "Pro", "Enterprise"],
      default: "Basic",
    },

    amount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Trial", "Past Due", "Cancelled"],
      default: "Active",
    },

    billingCycle: {
      type: String,
      enum: ["Monthly", "Yearly"],
      default: "Monthly",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Customer",
  customerSchema
);