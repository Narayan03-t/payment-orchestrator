const getHealthStatus = (request, response) => {
  response.json({ status: "ok" });
};

module.exports = {
  getHealthStatus,
};
