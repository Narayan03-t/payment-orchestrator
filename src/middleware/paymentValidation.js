const ALLOWED_METHODS = ["UPI", "CARD", "NETBANKING"];

const validateInitiatePayment = (request, response, next) => {
  const { amount, method, transactionId } = request.body;

  if (amount === undefined) {
    return response.status(400).json({
      message: "Amount is required.",
    });
  }

  if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
    return response.status(400).json({
      message: "Amount must be a positive number.",
    });
  }

  if (!method) {
    return response.status(400).json({
      message: "Method is required.",
    });
  }

  if (!ALLOWED_METHODS.includes(method)) {
    return response.status(400).json({
      message: "Method must be UPI, CARD, or NETBANKING.",
    });
  }

  if (transactionId !== undefined && typeof transactionId !== "string") {
    return response.status(400).json({
      message: "Transaction ID must be a string if provided.",
    });
  }

  next();
};

const validateTransactionIdParam = (request, response, next) => {
  const { transactionId } = request.params;

  if (!transactionId) {
    return response.status(400).json({
      message: "Transaction ID is required.",
    });
  }

  next();
};

const validateTransactionStatusFilter = (request, response, next) => {
  const { status } = request.query;
  const allowedStatuses = ["PENDING", "SUCCESS", "FAILED"];

  if (status && !allowedStatuses.includes(status)) {
    return response.status(400).json({
      message: "Status filter must be PENDING, SUCCESS, or FAILED.",
    });
  }

  next();
};

module.exports = {
  validateInitiatePayment,
  validateTransactionIdParam,
  validateTransactionStatusFilter,
};
