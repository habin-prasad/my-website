---
title: "High-Throughput Chaos & Load Testing Harness"
role: "Principal Automation Architect"
period: "2023 - 2023"
summary: "Architected custom k6 and Chaos Mesh integration to validate system resilience under 50k RPS peak traffic scenarios."
metrics:
  - "50,000 RPS Tested"
  - "99.99% Availability Verified"
  - "Zero Outages on Cyber Week"
domain: "Quality & Automation"
technologies:
  - "k6"
  - "Go"
  - "Chaos Mesh"
  - "Grafana"
  - "Prometheus"
  - "AWS EKS"
featured: false
---

### Situation
Prior to annual high-traffic sales events, core checkout APIs lacked stress testing validation for sudden 10x traffic spikes and downstream third-party payment gateway failures.

### Task
Build an automated load generation framework capable of simulating 50,000+ RPS while introducing artificial latency and pod failures to verify circuit breakers.

### Action
* **Distributed Load Generation**: Deployed distributed k6 operators on AWS EKS with custom Go extensions for signing OAuth requests.
* **Resilience Injection**: Configured Chaos Mesh experiments to simulate network loss, CPU throttling, and database connection drops during active load tests.

### Result
* Identified and resolved 3 major memory leaks and 2 API deadlocks prior to production release.
* Successfully handled peak Cyber Week traffic with zero unplanned downtime.