import API_URL from '../config';
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const defaultGatewayNames = ["GatewayA", "GatewayB", "GatewayC"];

const createHourlyBuckets = () => {
  const buckets = [];
  const now = new Date();

  for (let hoursAgo = 23; hoursAgo >= 0; hoursAgo -= 1) {
    const bucketDate = new Date(now);
    bucketDate.setMinutes(0, 0, 0);
    bucketDate.setHours(bucketDate.getHours() - hoursAgo);

    buckets.push({
      key: bucketDate.toISOString().slice(0, 13),
      label: bucketDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      total: 0,
      success: 0,
    });
  }

  return buckets;
};

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [gateways, setGateways] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [transactionsResponse, gatewaysResponse] = await Promise.all([
          fetch(`${API_URL}/api/transactions`),
          fetch(`${API_URL}/api/gateways`),
        ]);

        const transactionsData = await transactionsResponse.json();
        const gatewaysData = await gatewaysResponse.json();

        if (!transactionsResponse.ok) {
          throw new Error(
            transactionsData.message ||
              transactionsData.error ||
              "Unable to load transaction analytics."
          );
        }

        if (!gatewaysResponse.ok) {
          throw new Error(
            gatewaysData.message ||
              gatewaysData.error ||
              "Unable to load gateway analytics."
          );
        }

        setTransactions(transactionsData);
        setGateways(gatewaysData);
        setError("");
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();

    const intervalId = setInterval(loadDashboardData, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const totalTransactions = transactions.length;
  const successCount = transactions.filter(
    (transaction) => transaction.status === "SUCCESS"
  ).length;
  const failureCount = transactions.filter(
    (transaction) => transaction.status === "FAILED"
  ).length;
  const overallSuccessRate =
    totalTransactions === 0 ? 0 : (successCount / totalTransactions) * 100;

  const gatewayStatsMap = gateways.reduce((currentMap, gateway) => {
    currentMap[gateway.name] = gateway;
    return currentMap;
  }, {});

  const successRateChartData = defaultGatewayNames.map((gatewayName) => {
    const gateway = gatewayStatsMap[gatewayName];

    return {
      name: gatewayName,
      successRate: gateway ? Number(gateway.successRate.toFixed(2)) : 0,
    };
  });

  const latencyChartData = defaultGatewayNames.map((gatewayName) => {
    const gateway = gatewayStatsMap[gatewayName];

    return {
      name: gatewayName,
      avgLatency: gateway ? Math.round(gateway.avgLatency) : 0,
    };
  });

  const hourlyBuckets = createHourlyBuckets();
  const hourlyMap = hourlyBuckets.reduce((currentMap, bucket) => {
    currentMap[bucket.key] = bucket;
    return currentMap;
  }, {});

  transactions.forEach((transaction) => {
    const createdAt = new Date(transaction.createdAt);
    const bucketKey = createdAt.toISOString().slice(0, 13);
    const matchingBucket = hourlyMap[bucketKey];

    if (!matchingBucket) {
      return;
    }

    matchingBucket.total += 1;

    if (transaction.status === "SUCCESS") {
      matchingBucket.success += 1;
    }
  });

  const successTrendData = hourlyBuckets.map((bucket) => ({
    hour: bucket.label,
    successRate:
      bucket.total === 0 ? 0 : Number(((bucket.success / bucket.total) * 100).toFixed(2)),
  }));

  return (
    <section className="dashboard-grid">
      <div className="section-heading">
        <p className="section-kicker">Analytics</p>
        <h2>Live orchestration dashboard</h2>
      </div>

      {isLoading && <p className="empty-state">Loading dashboard metrics...</p>}
      {error && <p className="error-text">{error}</p>}

      {!isLoading && !error && (
        <>
          <div className="stats-grid">
            <article className="stat-card">
              <p className="metric-label">Total Transactions</p>
              <h3>{totalTransactions}</h3>
            </article>
            <article className="stat-card">
              <p className="metric-label">Success Count</p>
              <h3>{successCount}</h3>
            </article>
            <article className="stat-card">
              <p className="metric-label">Failure Count</p>
              <h3>{failureCount}</h3>
            </article>
            <article className="stat-card">
              <p className="metric-label">Overall Success Rate</p>
              <h3>{overallSuccessRate.toFixed(2)}%</h3>
            </article>
          </div>

          <div className="chart-grid">
            <article className="chart-card">
              <div className="chart-header">
                <h3>Gateway Success Rate Comparison</h3>
                <p>Higher is better.</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={successRateChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d7e4ee" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="successRate" fill="#1f6aa5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </article>

            <article className="chart-card">
              <div className="chart-header">
                <h3>Average Latency Comparison</h3>
                <p>Lower is better.</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={latencyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d7e4ee" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgLatency" fill="#1f8a70" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </article>
          </div>

          <article className="chart-card chart-card-wide">
            <div className="chart-header">
              <h3>Success Rate Over Last 24 Hours</h3>
              <p>Calculated from recent transactions grouped by hour.</p>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={successTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d7e4ee" />
                <XAxis dataKey="hour" minTickGap={24} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="successRate"
                  stroke="#c06a2a"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </article>
        </>
      )}
    </section>
  );
}

export default Dashboard;
