import { useState } from "react";

const paymentMethods = ["UPI", "CARD", "NETBANKING"];

function PaymentForm() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");
  const [transactionId, setTransactionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const requestBody = {
        amount: Number(amount),
        method,
      };

      if (transactionId.trim()) {
        requestBody.transactionId = transactionId.trim();
      }

      const response = await fetch("/api/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Payment request failed.");
      }

      setResult(data);
      setAmount("");
      setTransactionId("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const statusClassName =
    result?.status === "SUCCESS" ? "result-card success" : "result-card failed";

  return (
    <section className="panel-grid">
      <div className="card">
        <div className="section-heading">
          <p className="section-kicker">New Payment</p>
          <h2>Try the orchestrator</h2>
        </div>

        <form className="payment-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Amount</span>
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount"
              required
            />
          </label>

          <label className="field">
            <span>Payment Method</span>
            <select value={method} onChange={(event) => setMethod(event.target.value)}>
              {paymentMethods.map((paymentMethod) => (
                <option key={paymentMethod} value={paymentMethod}>
                  {paymentMethod}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Transaction ID (Optional)</span>
            <input
              type="text"
              value={transactionId}
              onChange={(event) => setTransactionId(event.target.value)}
              placeholder="Enter custom ID to test idempotency"
            />
          </label>

          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className="button-loading">
                <span className="spinner" aria-hidden="true" />
                Processing...
              </span>
            ) : (
              "Pay Now"
            )}
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="card">
        <div className="section-heading">
          <p className="section-kicker">Result</p>
          <h2>Latest payment response</h2>
        </div>

        {!result && !error && (
          <p className="empty-state">
            Submit a payment to see the chosen gateway, number of attempts, and
            final status.
          </p>
        )}

        {result && (
          <article className={statusClassName}>
            <div className="result-topline">
              <span className="badge">{result.status}</span>
              <span className="muted-text">{result.transactionId}</span>
            </div>
            <h3>{result.message}</h3>
            <p>Gateway Used: {result.gateway || "No gateway succeeded"}</p>
            <p>Attempts Taken: {result.attempts?.length || 0}</p>
            <ul className="attempt-list">
              {(result.attempts || []).map((attempt, index) => (
                <li key={`${attempt.gateway}-${index}`}>
                  <strong>{attempt.gateway}</strong> - {attempt.status} in{" "}
                  {attempt.latency}ms
                </li>
              ))}
            </ul>
          </article>
        )}
      </div>
    </section>
  );
}

export default PaymentForm;
