const requestLogs = [];

const logger = (request, response, next) => {
  const startTime = Date.now();

  response.on("finish", () => {
    const logEntry = {
      method: request.method,
      url: request.originalUrl,
      timestamp: new Date().toISOString(),
      ip: request.ip,
      statusCode: response.statusCode,
      responseTimeMs: Date.now() - startTime,
    };

    requestLogs.push(logEntry);

    if (requestLogs.length > 1000) {
      requestLogs.shift();
    }

    console.log(
      `${logEntry.method} ${logEntry.url} ${logEntry.statusCode} ${logEntry.responseTimeMs}ms ${logEntry.ip}`
    );
  });

  next();
};

const getRecentLogs = (request, response) => {
  return response.json(requestLogs);
};

module.exports = {
  logger,
  getRecentLogs,
  requestLogs,
};
