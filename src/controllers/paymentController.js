const { v4: uuidv4 } = require("uuid");

const Transaction = require("../models/Transaction");
const Gateway = require("../models/Gateway");
const { processPayment } = require("../services/orchestrator");

const initiatePayment = async (request, response) => {
  try {
    const { amount, method } = request.body;
    const transactionId = request.body.transactionId || uuidv4();

    const result = await processPayment(transactionId, amount, method);

    return response.json({
      transactionId: result.transaction.transactionId,
      status: result.transaction.status,
      gateway: result.transaction.gatewayUsed,
      attempts: result.transaction.attempts,
      message: result.message,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Unable to process payment right now.",
      error: error.message,
    });
  }
};

const getTransaction = async (request, response) => {
  try {
    const { transactionId } = request.params;

    const transaction = await Transaction.findOne({ transactionId });

    if (!transaction) {
      return response.status(404).json({
        message: "Transaction not found.",
      });
    }

    return response.json(transaction);
  } catch (error) {
    return response.status(500).json({
      message: "Unable to fetch transaction right now.",
      error: error.message,
    });
  }
};

const getAllTransactions = async (request, response) => {
  try {
    const filter = {};

    if (request.query.status) {
      filter.status = request.query.status;
    }

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    return response.json(transactions);
  } catch (error) {
    return response.status(500).json({
      message: "Unable to fetch transactions right now.",
      error: error.message,
    });
  }
};

const getGatewayStats = async (request, response) => {
  try {
    const gateways = await Gateway.find().sort({ successRate: -1, avgLatency: 1 });

    return response.json(gateways);
  } catch (error) {
    return response.status(500).json({
      message: "Unable to fetch gateway stats right now.",
      error: error.message,
    });
  }
};

module.exports = {
  initiatePayment,
  getTransaction,
  getAllTransactions,
  getGatewayStats,
};
