import API_URL from '../config';
import { useEffect, useState } from "react";

const defaultGateways = ["GatewayA", "GatewayB", "GatewayC"];

function GatewayStats() {
  const [gateways, setGateways] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGatewayStats = async () => {
      try {
        const response = await fetch("${API_URL}/api/gateways");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.error || "Unable to load gateways.");
        }

        setGateways(data);
        setError("");
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadGatewayStats();

    const intervalId = setInterval(loadGatewayStats, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const gatewayMap = gateways.reduce((currentMap, gateway) => {
    currentMap[gateway.name] = gateway;
    return currentMap;
  }, {});

  return (
    <section className="gateway-section">
      <div className="section-heading">
        <p className="section-kicker">Live Metrics</p>
        <h2>Gateway health dashboard</h2>
      </div>

      {isLoading && <p className="empty-state">Loading gateway stats...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="gateway-grid">
        {defaultGateways.map((gatewayName) => {
          const gateway = gatewayMap[gatewayName];

          return (
            <article className="gateway-card" key={gatewayName}>
              <p className="gateway-name">{gatewayName}</p>
              <h3>{gateway ? gateway.successRate.toFixed(2) : "0.00"}%</h3>
              <p className="metric-label">Success Rate</p>
              <div className="metric-row">
                <span>Average Latency</span>
                <strong>{gateway ? Math.round(gateway.avgLatency) : 0} ms</strong>
              </div>
              <div className="metric-row">
                <span>Total Attempts</span>
                <strong>{gateway ? gateway.totalAttempts : 0}</strong>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default GatewayStats;
