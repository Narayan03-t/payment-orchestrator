const GATEWAY_LIST = ["GatewayA", "GatewayB", "GatewayC"];

const simulateGatewayResponse = (gatewayName, successRate, averageLatency) => {
  return (amount, method) => {
    return new Promise((resolve) => {
      if (method === "UPI" && amount > 100000) {
        return setTimeout(() => {
          resolve({
            success: false,
            latency: 0,
            gateway: gatewayName,
            message: "UPI payments above 100000 are not allowed.",
          });
        }, 0);
      }

      const latency = Math.max(
        20,
        Math.floor(averageLatency + (Math.random() - 0.5) * 100)
      );

      setTimeout(() => {
        if (method === "UPI" && amount > 50000) {
          resolve({
            success: false,
            latency,
            gateway: gatewayName,
            message: "UPI payment failed because the simulated gateway limit is 50000.",
          });
          return;
        }

        const isSuccess = Math.random() < successRate;

        resolve({
          success: isSuccess,
          latency,
          gateway: gatewayName,
          message: isSuccess
            ? `${gatewayName} processed the payment successfully.`
            : `${gatewayName} failed to process the payment.`,
        });
      }, latency);
    });
  };
};

const gatewayA = simulateGatewayResponse("GatewayA", 0.8, 120);
const gatewayB = simulateGatewayResponse("GatewayB", 0.65, 80);
const gatewayC = simulateGatewayResponse("GatewayC", 0.9, 250);

module.exports = {
  gatewayA,
  gatewayB,
  gatewayC,
  GATEWAY_LIST,
};
