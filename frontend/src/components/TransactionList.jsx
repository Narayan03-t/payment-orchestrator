import API_URL from '../config';
import { useEffect, useState } from "react";

const filters = [
  { label: "All", value: "ALL" },
  { label: "Success", value: "SUCCESS" },
  { label: "Failed", value: "FAILED" },
];

function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoading(true);
      setError("");

      try {
        const query =
          activeFilter === "ALL" ? "" : `?status=${encodeURIComponent(activeFilter)}`;
        const response = await fetch(`${API_URL}${API_URL}/api/transactions${query}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.error || "Unable to load transactions.");
        }

        setTransactions(data.slice(0, 20));
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [activeFilter]);

  return (
    <section className="card">
      <div className="section-heading section-heading-inline">
        <div>
          <p className="section-kicker">History</p>
          <h2>Recent transactions</h2>
        </div>

        <div className="filter-group">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={
                activeFilter === filter.value ? "filter-button active" : "filter-button"
              }
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="empty-state">Loading transactions...</p>}
      {error && <p className="error-text">{error}</p>}

      {!isLoading && !error && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Gateway</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="table-empty">
                    No transactions found for this filter.
                  </td>
                </tr>
              )}

              {transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td className="mono-text">
                    {transaction.transactionId.slice(0, 12)}...
                  </td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.method}</td>
                  <td>
                    <span
                      className={
                        transaction.status === "SUCCESS"
                          ? "status-pill success"
                          : transaction.status === "FAILED"
                            ? "status-pill failed"
                            : "status-pill pending"
                      }
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td>{transaction.gatewayUsed || "-"}</td>
                  <td>{new Date(transaction.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default TransactionList;
