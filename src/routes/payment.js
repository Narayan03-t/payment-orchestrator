const express = require("express");

const {
  initiatePayment,
  getTransaction,
  getAllTransactions,
  getGatewayStats,
} = require("../controllers/paymentController");
const {
  validateInitiatePayment,
  validateTransactionIdParam,
  validateTransactionStatusFilter,
} = require("../middleware/paymentValidation");
const { paymentLimiter } = require("../middleware/rateLimiter");
const { getRecentLogs } = require("../middleware/logger");

const router = express.Router();

router.post("/pay", paymentLimiter, validateInitiatePayment, initiatePayment);
router.get(
  "/transaction/:transactionId",
  validateTransactionIdParam,
  getTransaction
);
router.get("/transactions", validateTransactionStatusFilter, getAllTransactions);
router.get("/gateways", getGatewayStats);
router.get("/logs", getRecentLogs);

module.exports = router;
