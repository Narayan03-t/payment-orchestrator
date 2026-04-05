# System Design Deep Dive

## Overview

The Smart Payment Orchestration System models a simplified payment platform where a single payment request can be routed through multiple gateways based on historical performance.

The main design goals are:

- maximize successful transactions
- reduce gateway latency impact
- prevent duplicate processing
- preserve a complete attempt history
- expose operational visibility to the frontend

## Core Flow

```text
Client Request
    |
    v
Validate input
    |
    v
Check transactionId for idempotency
    |
    +--> Existing SUCCESS -> return stored result
    |
    v
Create PENDING transaction
    |
    v
Load gateway stats from MongoDB
    |
    v
Sort gateways by successRate desc, avgLatency asc
    |
    v
Try gateway 1 -> success? yes -> save SUCCESS -> return
    |
    no
    v
Try gateway 2 -> success? yes -> save SUCCESS -> return
    |
    no
    v
Try gateway 3 -> success? yes -> save SUCCESS -> return
    |
    no
    v
Mark transaction FAILED
```

## Main Components

### 1. API Layer

The Express controllers accept incoming requests, validate them, and delegate the payment decision-making to the orchestrator service.

This separation is intentional:

- controllers handle HTTP concerns
- services handle business logic
- models handle persistence

That keeps the code easier to reason about and easier to extend.

### 2. Orchestrator

The orchestrator is the central decision engine.

Responsibilities:

- enforce idempotency
- create a transaction record
- choose gateway order
- execute retries
- update gateway performance metrics
- finalize transaction outcome

### 3. Gateway Simulator

Because this is a portfolio project, the system uses simulated gateways instead of real payment provider APIs.

Each gateway has:

- a different success probability
- a different average latency
- UPI-specific failure conditions

This lets the system behave like a real integration environment without requiring external credentials or third-party dependencies.

### 4. Database

MongoDB stores two major entities:

- `Transaction`
- `Gateway`

`Transaction` stores payment history and attempt traces.

`Gateway` stores performance metrics that influence future routing decisions.

## Idempotency Explained

Idempotency means that repeating the same request should not create duplicate side effects.

In payments, this is critical.

### Example

Suppose a user taps the pay button once, but their internet is slow. They tap again because they think nothing happened.

Without idempotency:

- payment can be charged twice
- two transaction records can be created
- reconciliation becomes messy

With idempotency:

- both requests carry the same `transactionId`
- the backend checks whether that transaction already exists
- if it already succeeded, the stored success result is returned
- no duplicate charge is created

### Example Request

```json
{
  "transactionId": "order-2026-1001",
  "amount": 1999,
  "method": "CARD"
}
```

If this request is retried, the orchestrator returns the existing successful transaction instead of processing a second payment.

## Retry Strategy

The retry strategy in this project is deterministic and bounded.

Rules:

1. Determine the best gateway order from database metrics.
2. Attempt gateways one at a time.
3. Stop immediately after the first success.
4. Cap total attempts at 3.
5. Save every attempt to the transaction record.

This is deliberately simple and practical for a first version.

### Why bounded retries matter

Unlimited retries are dangerous:

- they waste time
- they increase latency
- they can overload dependencies
- they create confusing system behavior

By capping retries, the user gets a fast and predictable answer while the system still benefits from failover.

## Smart Routing Algorithm

The routing decision uses two metrics:

1. `successRate`
2. `avgLatency`

Sorting logic:

- higher success rate wins
- if success rates tie, lower latency wins

This favors reliability first and speed second.

That is a sensible payment-oriented tradeoff because a successful payment is generally more valuable than a slightly faster failed one.

## How Success Rate Is Calculated

For each gateway:

```text
successRate = (successCount / totalAttempts) * 100
```

Example:

- `totalAttempts = 50`
- `successCount = 45`

Then:

```text
successRate = (45 / 50) * 100 = 90%
```

## How Average Latency Is Calculated

The system uses a rolling average formula:

```text
newAvgLatency =
  (previousAvgLatency * previousTotalAttempts + latestLatency)
  / newTotalAttempts
```

Example:

- previous average latency = `100 ms`
- previous total attempts = `4`
- new latency = `140 ms`

Then:

```text
newAvgLatency = (100 * 4 + 140) / 5 = 108 ms
```

This approach is efficient because it does not require storing every historical latency value separately.

## Observability Design

The project includes two lightweight observability features:

### Request Logging

Each request records:

- method
- URL
- timestamp
- IP
- status code
- response time

### Analytics Dashboard

The React dashboard visualizes:

- total transaction volume
- success and failure counts
- overall success rate
- gateway-wise success rate
- latency comparison
- hourly success trend

These are helpful because payment systems are not just about API correctness. They are also about operational visibility.

## Rate Limiting Design

Two layers of rate limiting are used:

### General limit

- 100 requests per 15 minutes per IP

### Payment-specific limit

- 10 payment requests per minute per IP

This protects the system from:

- accidental frontend loops
- bot traffic
- abuse
- noisy users affecting shared resources

## Tradeoffs in Current Design

This project intentionally keeps some areas simple:

- no distributed lock for concurrent duplicate transaction creation
- no queue for asynchronous retries
- no external cache like Redis
- no background worker system
- analytics are derived from recent API data, not heavy database aggregation pipelines

These tradeoffs keep the project understandable while still demonstrating the right architectural instincts.

## What I Would Add With More Time

### 1. Circuit Breaker

If a gateway starts failing repeatedly, the orchestrator should temporarily stop sending new traffic to it.

Benefits:

- reduce unnecessary failures
- recover faster from dependency outages
- protect user experience

### 2. Webhook Notifications

Real payment systems often notify external systems when payment status changes.

Examples:

- merchant backend receives `payment.success`
- merchant backend receives `payment.failed`

Benefits:

- event-driven integrations
- easier reconciliation
- better merchant experience

### 3. Multi-Tenant Design

If multiple merchants use the platform, each tenant should have:

- separate credentials
- separate metrics
- separate rate limits
- separate reporting views

Benefits:

- merchant isolation
- safer analytics
- cleaner scaling path

### 4. Distributed Idempotency Store

Move idempotency from a single MongoDB uniqueness check to a shared cache/store such as Redis.

Benefits:

- better performance
- better concurrency handling
- easier horizontal scaling

### 5. Production-Grade Monitoring

- Prometheus metrics
- Grafana dashboards
- structured logs
- alerting on error rates and latency spikes

## Final Takeaway

This system is intentionally small, but the architecture reflects real payment-platform concerns:

- reliability
- consistency
- observability
- protective controls
- learning from historical gateway behavior

That is what makes payment orchestration interesting and why the project is directly relevant to modern payment platforms.
