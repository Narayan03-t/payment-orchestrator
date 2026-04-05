const Transaction = require("../models/Transaction");
const Gateway = require("../models/Gateway");
const {
  gatewayA,
  gatewayB,
  gatewayC,
  GATEWAY_LIST,
} = require("./gatewaySimulator");

const gatewayHandlers = {
  GatewayA: gatewayA,
  GatewayB: gatewayB,
  GatewayC: gatewayC,
};

const getSmartGatewayOrder = async (method) => {
  const gateways = await Gateway.find().lean();

  if (gateways.length === 0) {
    return GATEWAY_LIST;
  }

  const sortedGatewayNames = gateways
    .sort((firstGateway, secondGateway) => {
      if (secondGateway.successRate !== firstGateway.successRate) {
        return secondGateway.successRate - firstGateway.successRate;
      }

      return firstGateway.avgLatency - secondGateway.avgLatency;
    })
    .map((gateway) => gateway.name);

  const missingGateways = GATEWAY_LIST.filter(
    (gatewayName) => !sortedGatewayNames.includes(gatewayName)
  );

  return [...sortedGatewayNames, ...missingGateways];
};

const updateGatewayStats = async (gatewayName, success, latency) => {
  let gateway = await Gateway.findOne({ name: gatewayName });

  if (!gateway) {
    gateway = new Gateway({
      name: gatewayName,
    });
  }

  const previousTotalAttempts = gateway.totalAttempts;
  const previousAverageLatency = gateway.avgLatency;

  gateway.totalAttempts += 1;

  if (success) {
    gateway.successCount += 1;
  }

  gateway.successRate = (gateway.successCount / gateway.totalAttempts) * 100;
  gateway.avgLatency =
    (previousAverageLatency * previousTotalAttempts + latency) /
    gateway.totalAttempts;

  await gateway.save();

  return gateway;
};

const processPayment = async (transactionId, amount, method) => {
  const existingTransaction = await Transaction.findOne({ transactionId });

  if (existingTransaction && existingTransaction.status === "SUCCESS") {
    return {
      success: true,
      transaction: existingTransaction,
      message: "Transaction already processed successfully.",
    };
  }

  if (existingTransaction) {
    return {
      success: false,
      transaction: existingTransaction,
      message: "Transaction already exists and will not be processed again.",
    };
  }

  const transaction = await Transaction.create({
    transactionId,
    amount,
    method,
    status: "PENDING",
    gatewayUsed: "",
    attempts: [],
  });

  const gatewayOrder = await getSmartGatewayOrder(method);
  const gatewaysToTry = gatewayOrder.slice(0, 3);

  for (const gatewayName of gatewaysToTry) {
    const gatewayFunction = gatewayHandlers[gatewayName];

    if (!gatewayFunction) {
      continue;
    }

    const gatewayResult = await gatewayFunction(amount, method);

    transaction.attempts.push({
      gateway: gatewayName,
      status: gatewayResult.success ? "SUCCESS" : "FAILED",
      latency: gatewayResult.latency,
      timestamp: new Date(),
    });

    await updateGatewayStats(
      gatewayName,
      gatewayResult.success,
      gatewayResult.latency
    );

    if (gatewayResult.success) {
      transaction.status = "SUCCESS";
      transaction.gatewayUsed = gatewayName;

      await transaction.save();

      return {
        success: true,
        transaction,
        gatewayResponse: gatewayResult,
        message: "Payment processed successfully.",
      };
    }
  }

  transaction.status = "FAILED";
  await transaction.save();

  return {
    success: false,
    transaction,
    message: "Payment failed on all available gateways.",
  };
};

module.exports = {
  getSmartGatewayOrder,
  updateGatewayStats,
  processPayment,
};
