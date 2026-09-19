const Customer = require("../models/Customer");

// ========================================
// GET ALL CUSTOMERS
// ========================================

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({
      createdAt: -1,
    });

    res.json(customers);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ========================================
// CREATE CUSTOMER
// ========================================

exports.createCustomer = async (req, res) => {
  try {
    const {
      name,
      email,
      plan,
      amount,
      status,
      billingCycle,
    } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const customer = await Customer.create({
      name,
      email,
      plan,
      amount: Number(amount || 0),
      status,
      billingCycle,
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(
      error.code === 11000 ? 409 : 500
    ).json({
      message:
        error.code === 11000
          ? "Customer email already exists"
          : error.message,
    });
  }
};

// ========================================
// UPDATE CUSTOMER
// ========================================

exports.updateCustomer = async (req, res) => {
  try {
    const customer =
      await Customer.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({
        message: "Customer not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ========================================
// DELETE CUSTOMER
// ========================================

exports.deleteCustomer = async (req, res) => {
  try {
    const customer =
      await Customer.findByIdAndDelete(
        req.params.id
      );

    if (customer) {
      res.json({
        message: "Customer deleted",
      });
    } else {
      res.status(404).json({
        message: "Customer not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ========================================
// CUSTOMER STATISTICS
// ========================================

exports.stats = async (req, res) => {
  try {
    const customers = await Customer.find();

    const total = customers.length;

    const active = customers.filter(
      (customer) =>
        customer.status === "Active"
    ).length;

    const trial = customers.filter(
      (customer) =>
        customer.status === "Trial"
    ).length;

    const pastDue = customers.filter(
      (customer) =>
        customer.status === "Past Due"
    ).length;

    const revenue = customers
      .filter(
        (customer) =>
          customer.status !== "Cancelled"
      )
      .reduce(
        (sum, customer) =>
          sum + Number(customer.amount || 0),
        0
      );

    res.json({
      total,
      active,
      trial,
      pastDue,
      revenue,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};