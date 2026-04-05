require("dotenv").config();

const mongoose = require("mongoose");

const Gateway = require("../models/Gateway");

const defaultGateways = [
  {
    name: "GatewayA",
    totalAttempts: 0,
    successCount: 0,
    successRate: 100,
    avgLatency: 0,
  },
  {
    name: "GatewayB",
    totalAttempts: 0,
    successCount: 0,
    successRate: 100,
    avgLatency: 0,
  },
  {
    name: "GatewayC",
    totalAttempts: 0,
    successCount: 0,
    successRate: 100,
    avgLatency: 0,
  },
];

const seedGateways = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const gateway of defaultGateways) {
      await Gateway.findOneAndUpdate({ name: gateway.name }, gateway, {
        new: true,
        upsert: true,
      });
    }

    console.log("Gateway seed completed successfully.");
  } catch (error) {
    console.error("Gateway seed failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seedGateways();
