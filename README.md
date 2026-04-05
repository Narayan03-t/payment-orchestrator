# Smart Payment Orchestration System

A portfolio-grade payment backend and analytics dashboard that simulates how a modern payment orchestration platform routes, retries, protects, and observes transactions.

## Why this project matters

This project models the kind of engineering tradeoffs that matter in real payment systems:

- choosing the best gateway dynamically
- preventing duplicate charges through idempotency
- retrying intelligently when a gateway fails
- measuring gateway quality over time
- protecting APIs with rate limiting
- exposing live operational analytics

For any recruiter or engineer in the fintech space, this demonstrates backend fundamentals, API design, data modeling, resilience thinking, observability, and product polish in one project.

## System Design

```text
             +----------------------+
             |   React Dashboard    |
             | Payment / Analytics  |
             +----------+-----------+
                        |
                        v
+--------+      +---------------+       +-------------------+
|  User  +----->| Express APIs  +------>|  Orchestrator     |
+--------+      | /api/pay      |       | smart routing     |
                | /transactions |       | retries           |
                | /gateways     |       | idempotency       |
                +-------+-------+       +---------+---------+
                        |                         |
                        |                         v
                        |             +-----------+-----------+
                        |             | Gateway Simulators    |
                        |             | GatewayA / B / C      |
                        |             +-----------+-----------+
                        |                         |
                        v                         v
                  +-----+-------------------------+-----+
                  |          MongoDB (Mongoose)         |
                  | Transactions | Gateway Metrics      |
                  +-------------------------------------+
```

## Features

- Smart gateway routing based on success rate first, then latency
- Retry and failover across multiple gateways
- Idempotent payment initiation using `transactionId`
- Gateway simulation with different reliability and latency profiles
- MongoDB persistence for transactions and gateway stats
- Request logging and in-memory observability endpoint
- Rate limiting for general APIs and stricter payment protection
- React dashboard for payments, transaction history, gateway health, and analytics
- Auto-refreshing charts for recruiter/demo-friendly visibility

## Tech Stack

### Backend

- Node.js `v22.14.0`
- Express `^5.2.1`
- Mongoose `^9.4.1`
- dotenv `^17.4.0`
- uuid `^13.0.0`
- express-rate-limit `^8.3.2`
- cors `^2.8.6`
- nodemon `^3.1.14`

### Frontend

- React `^19.2.4`
- React DOM `^19.2.4`
- Vite `^8.0.1`
- Recharts `^3.8.1`
- @vitejs/plugin-react `^6.0.1`

### Database

- MongoDB Local: `MongoDB Atlas (cloud) — add your MONGO_URI in .env file`

## Folder Structure

```text
payment-orchestrator/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── frontend/
│   └── src/
│       └── components/
├── server.js
├── README.md
└── SYSTEM_DESIGN.md
```

## How to Run Locally

### 1. Clone or open the project

```powershell
git clone https://github.com/Narayan03-t/payment-orchestrator.git
cd payment-orchestrator
```

### 2. Install backend dependencies

```powershell
npm install
```

### 3. Install frontend dependencies

```powershell
cd frontend
npm install
cd ..
```

### 4. Make sure MongoDB is running locally

The app expects:

```text
MongoDB Atlas (cloud) — add your MONGO_URI in .env file
```

### 5. Seed default gateways

```powershell
npm run seed
```

### 6. Start the backend

Development mode with auto-restart:

```powershell
npm run dev
```

Production-style mode:

```powershell
npm start
```

Backend runs at:

```text
http://localhost:3000
```

### 7. Start the frontend

In a second terminal:

```powershell
cd frontend
npm run dev
```

Frontend runs at the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

## API Documentation

| Method | Endpoint | Description | Sample Request | Sample Response |
|---|---|---|---|---|
| GET | `/health` | Health check endpoint | None | `{ "status": "ok" }` |
| POST | `/api/pay` | Initiate a payment through the orchestrator | `{ "amount": 1200, "method": "CARD" }` | `{ "transactionId": "...", "status": "SUCCESS", "gateway": "GatewayA", "attempts": [...], "message": "Payment processed successfully." }` |
| GET | `/api/transaction/:transactionId` | Fetch one transaction by idempotency key | None | Full transaction document |
| GET | `/api/transactions` | Fetch recent transactions | None | Array of transactions |
| GET | `/api/transactions?status=SUCCESS` | Filter recent transactions by status | None | Filtered array |
| GET | `/api/gateways` | Fetch current gateway success and latency stats | None | Array of gateway stat documents |
| GET | `/api/logs` | View recent in-memory request logs | None | Array of log entries |

## Example Payment Request

```json
{
  "amount": 2500,
  "method": "UPI",
  "transactionId": "demo-order-123"
}
```

## Example Payment Response

```json
{
  "transactionId": "demo-order-123",
  "status": "SUCCESS",
  "gateway": "GatewayC",
  "attempts": [
    {
      "gateway": "GatewayC",
      "status": "SUCCESS",
      "latency": 241,
      "timestamp": "2026-04-05T18:30:00.000Z"
    }
  ],
  "message": "Payment processed successfully."
}
```

## How Smart Routing Works

The orchestrator uses a simple but realistic scoring strategy:

1. Load all gateway records from MongoDB.
2. Sort gateways by `successRate` in descending order.
3. If two gateways have the same success rate, prefer the one with lower `avgLatency`.
4. Try up to 3 gateways in that order.
5. After each attempt:
   - update transaction attempt history
   - update gateway total attempts
   - update success count
   - recompute success rate
   - recompute average latency
6. Stop immediately when a payment succeeds.
7. Mark the transaction as `FAILED` if every gateway fails.

This means routing becomes smarter over time because the system learns from previous outcomes.

## Idempotency

Every payment request can include a `transactionId`.

- If the same `transactionId` is sent again after a successful payment, the orchestrator returns the existing success result.
- This prevents duplicate charging for the same payment attempt.

That matters in real systems because networks retry, users double-click buttons, and mobile apps can resend requests after flaky connectivity.

## Analytics Dashboard

The React frontend includes:

- payment initiation form
- transaction history with filters
- gateway health cards
- dashboard analytics with:
  - total transactions
  - success count
  - failure count
  - overall success rate
  - gateway success-rate comparison bar chart
  - latency comparison bar chart
  - hourly success-rate trend line chart

## Security and Observability

- General API rate limit: 100 requests per 15 minutes per IP
- Payment endpoint limit: 10 requests per minute per IP
- Request and response logging with:
  - method
  - URL
  - timestamp
  - IP address
  - status code
  - response time

These are the kinds of non-functional details that make a backend feel production-aware instead of toy-like.

why the project is directly relevant to modern payment platforms

Modern payment platforms operate in the payment orchestration and checkout infrastructure space. This project maps directly to several important payment-system concerns:
- routing payments across multiple gateways
- using fallback logic when a gateway fails
- measuring gateway quality with success rate and latency
- preventing duplicate transactions with idempotency
- protecting payment APIs from abuse
- exposing operational data in a usable dashboard

Even though this is a simulated system, the engineering ideas are real. It shows understanding of how reliability, latency, data consistency, and observability affect payment platforms.

## Future Improvements

- circuit breaker logic for temporarily unhealthy gateways
- webhook notifications for payment state changes
- Redis-backed idempotency and caching
- persistent log storage
- authentication and admin roles
- multi-tenant merchant isolation
- containerized deployment with Docker
- test coverage with Jest and Supertest

## Demo Checklist for Recruiters

- Start backend and frontend
- Seed gateways
- Make a payment with no `transactionId`
- Make the same payment again with a custom `transactionId`
- Observe idempotency behavior
- Open transaction history
- Open gateway stats
- Open analytics dashboard and watch auto-refresh

## Author Note

This project was built to demonstrate backend system design thinking, resilient API behavior, and clear frontend presentation for payment orchestration workflows.
