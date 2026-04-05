require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const healthRoutes = require("./src/routes/healthRoutes");
const paymentRoutes = require("./src/routes/payment");
const { apiLimiter } = require("./src/middleware/rateLimiter");
const { logger } = require("./src/middleware/logger");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(logger);
app.use(express.json());
app.use(apiLimiter);

app.use("/health", healthRoutes);
app.use("/api", paymentRoutes);

app.use((error, request, response, next) => {
  console.error("Unhandled error:", error.message);

  return response.status(500).json({
    error: "Something went wrong",
    details: error.message,
  });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
