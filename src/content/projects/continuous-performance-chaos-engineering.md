---
title: "Continuous Performance Benchmarking & Chaos Engineering Resilience Engine"
role: "Senior Automation Engineer"
period: "Year 3 · Q11 (Previous SaaS)"
summary: "Engineered an automated performance benchmarking harness and chaos testing framework using k6 and Chaos Mesh to enforce SLA budgets and validate microservice fault tolerance before production deployment."
domain: "Platform & Infrastructure"
metrics:
  - "Automated Catching of 95%+ Performance Regressions in CI"
  - "100+ Chaos Fault Scenarios Automated"
  - "Zero Outages from Unhandled Cascading Failures"
technologies:
  - "k6"
  - "Chaos Mesh"
  - "Go"
  - "Prometheus"
  - "Grafana"
  - "Kubernetes"
featured: false
---

### Situation
Performance testing was previously treated as an infrequent, manual pre-release activity. As a result, memory leaks, latency regressions, and fragile circuit-breaker configurations slipped into production, triggering cascading outages during peak load periods.

### Task
Architect an automated performance and resilience testing platform that enforces p95/p99 latency budgets in continuous integration pipelines and continuously injects network and infrastructure faults to verify cluster resilience.

### Action
* **Automated Load Gates in CI**: Built a lightweight k6 load testing execution runner integrated into GitHub Actions, evaluating custom latency SLOs ($p_{95} < 150\text{ms}$) against target microservices and failing pull requests that violated performance budgets.
* **Chaos Mesh Kubernetes Fault Injection**: Deployed Chaos Mesh custom resources to automatically simulate network partitions, packet loss (20–50%), and random pod evictions in staging environments while active synthetic load runs executed.
* **Prometheus Alert-Driven Assertion**: Wrote custom validation runners in Go that queried Prometheus metrics during chaos runs to confirm that Envoy circuit breakers tripped as expected and downstream retries gracefully shed load.

### Result
* Shifted performance testing left, catching **over 95% of latency regressions** in pull requests before staging deployment.
* Verified microservice resilience across **100+ automated chaos experiments**, completely eliminating cascading failures in production.