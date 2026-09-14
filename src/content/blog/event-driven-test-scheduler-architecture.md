---
title: "Designing Event-Driven Test Schedulers for 100k Daily Executions"
description: "Architecting a high-throughput, dynamic backpressure test execution engine using Node.js, Redis, and Kubernetes worker auto-scalers."
pubDate: 2025-12-18
draft: false
tags: ["System Design", "Node.js", "Redis", "Kubernetes", "Infrastructure"]
---

When scaling test execution past 100,000 daily jobs, standard CI runners (e.g., off-the-shelf GitHub Actions or Jenkins agents) encounter severe resource starvation and queue head-of-line blocking.

To achieve linear scaling and predictable cost controls, you must separate **test scheduling** from **test execution**.

## Key Architectural Components
[ Webhook Ingress ] ──> [ Priority Queue (Redis) ] ──> [ Dynamic Dispatcher ]
│
┌─────────────┴─────────────┐
▼                           ▼
[ Pod Worker (Node/Go) ]    [ Pod Worker (Node/Go) ]


### 1. Priority-Weighted Queuing (Redis BullMQ)
Not all tests carry equal priority:
* **P0 (Smoke / PR Blockers)**: Fast unit and contract checks (Allocated 70% of worker pool capacity).
* **P1 (Regression)**: Deeper UI and E2E flows (Distributed across lower-cost spot instances).
* **P2 (Nightly Stress/Load)**: Scheduled during off-peak cloud billing hours.

### 2. Dynamic Backpressure & Pod Auto-Scaling
Instead of static node pools, the scheduler queries queue depth metrics every 5 seconds. If P0 queue length exceeds 50 pending jobs, an event triggers Kubernetes Horizontal Pod Autoscaler (HPA) to spin up ephemeral worker pods instantly.

### 3. Isolated State Teardown
Each worker pod executes exactly **one test file bundle** before being recycled by Kubernetes. This guarantees clean memory, clean disk state, and zero residual process contamination between runs.