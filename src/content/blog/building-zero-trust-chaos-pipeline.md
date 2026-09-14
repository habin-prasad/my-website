---
title: "Shift-Left Chaos: Injecting Failure into CI/CD Pipelines"
description: "How to automate network latency, pod kills, and dependency degradation directly inside pull request validation pipelines before reaching production."
pubDate: 2025-11-10
draft: false
tags: ["Chaos Engineering", "Kubernetes", "Reliability", "AWS"]
---

Most chaos engineering practices focus on production GameDays—scheduling controlled chaos experiments during work hours with engineers monitoring Grafana dashboards. While valuable, production chaos is reactive.

If your microservices cannot survive artificial latency or connection resets in CI, they will not survive them in production.

## Architecture of a Pipeline-Integrated Chaos Engine

By combining ephemeral Kubernetes namespaces with Chaos Mesh, we can execute automated resilience assertions on every pull request.
[ PR Trigger ] ──> [ Ephemeral K8s Pods ] ──> [ Inject Chaos (Latency/Loss) ]
│
▼
[ Assert Circuit Breakers ]


## Core Failure Scenarios to Automate

1. **Third-Party API Drops**: Simulating 500 errors from payment gateways to verify fallback worker queues retry gracefully.
2. **Database Failover Latency**: Injecting 3,000ms latency on primary database reads to assert connection pool timeouts and health check circuit breakers.
3. **Pod Eviction Under Stress**: Killing pod instances during active load execution to verify Kubernetes horizontal pod autoscalers (HPA) handle traffic shifting without dropping requests.