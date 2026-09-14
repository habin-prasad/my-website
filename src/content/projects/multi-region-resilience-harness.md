---
title: "Multi-Region Chaos & Load Simulation Platform"
role: "Tech Lead / Head of Automation"
period: "2023 - Present"
summary: "Architected a multi-region load and fault-injection harness capable of generating 150k+ RPS across distributed AWS clusters to validate Tier-1 SaaS resilience."
domain: "Platform & Infrastructure"
metrics:
  - "150,000+ RPS Sustained"
  - "Zero Outages during Black Friday"
  - "4 Multi-Region Cell Clusters Tested"
technologies:
  - "AWS EKS"
  - "Go"
  - "k6"
  - "Chaos Mesh"
  - "Terraform"
  - "Datadog"
featured: true
---

### Situation
The core multi-tenant SaaS application was transitioning from a monolithic AWS deployment to a cell-based multi-region architecture. Legacy load testing scripts ran sequentially against single staging targets, failing to uncover cross-region latency spikes, cascading database failovers, and deadlocks under burst conditions.

### Task
Design a scalable load generation and chaos testing runtime from scratch capable of simulating peak holiday traffic across multiple AWS regions simultaneously while injecting network partitioning and dependency failures.

### Action
* **Distributed Load Engine**: Custom-built a distributed orchestrator in Go that provisions ephemeral k6 worker nodes across three AWS regions (us-east-1, us-west-2, eu-west-1) via AWS EKS and Terraform.
* **Chaos Integration**: Automated Chaos Mesh injection during peak load execution to simulate database failovers, network latency degradation (+200ms), and third-party API outages.
* **Real-time Observability**: Streamed client-side and server-side metrics to Datadog and Grafana via StatsD to calculate real-time p99 latency degradation under stress.

### Result
* Discovered 4 critical memory leaks and 2 cross-region connection pool exhaustion bugs prior to production release.
* Verified 99.999% availability during peak traffic events with zero unplanned downtime.