const mongoose = require("mongoose");

// ========================================
// CONNECT TO MONGODB
// ========================================

module.exports = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "MongoDB Connected"
    );
  } catch (error) {
    console.error(
      "MongoDB Error:",
      error.message
    );

    process.exit(1);
  }
};