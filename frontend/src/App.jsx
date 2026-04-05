import { useState } from "react";

import Dashboard from "./components/Dashboard";
import PaymentForm from "./components/PaymentForm";
import TransactionList from "./components/TransactionList";
import GatewayStats from "./components/GatewayStats";

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "pay", label: "Make Payment" },
  { id: "transactions", label: "Transactions" },
  { id: "gateways", label: "Gateway Stats" },
];

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="app-shell">
      <header className="hero-panel">
        <p className="eyebrow">PAYMENT INFRASTRUCTURE</p>
        <h1>Smart Payment Orchestration System</h1>
        <p className="hero-copy">
          Test payment routing, retry logic, gateway performance, and
          idempotency from one simple React dashboard.
        </p>
      </header>

      <nav className="tab-bar" aria-label="Main navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? "tab-button active" : "tab-button"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="content-panel">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "pay" && <PaymentForm />}
        {activeTab === "transactions" && <TransactionList />}
        {activeTab === "gateways" && <GatewayStats />}
      </main>
    </div>
  );
}

export default App;
