const mongoose = require("mongoose");

const gatewaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    successRate: {
      type: Number,
      default: 100,
    },
    avgLatency: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Gateway", gatewaySchema);
