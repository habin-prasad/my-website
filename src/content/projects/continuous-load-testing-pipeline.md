---
title: "Continuous Distributed Load Testing & Performance Regression Pipeline"
role: "Senior Automation Engineer"
period: "Year 1 · Q3 (Previous SaaS)"
summary: "Integrated a headless, distributed load testing engine into nightly Jenkins pipelines to catch HTTP/REST throughput degradation and memory leaks before release candidate tags."
domain: "Platform & Infrastructure"
metrics:
  - "30,000 Peak RPS Simulated"
  - "14 Production Memory Leaks Caught Pre-Release"
  - "100% Automated SLA Regression Verification"
technologies:
  - "JMeter"
  - "AWS EC2"
  - "Python"
  - "Jenkins"
  - "InfluxDB"
  - "Grafana"
featured: false
---

### Situation
Performance regressions were discovered only after code reached production or during manual end-of-quarter load testing runs. Staging environments lacked automated load validation, leaving the engineering team unaware when a pull request introduced database query lockups or HTTP connection pool leaks.

### Task
Architect an automated, nightly load testing harness that spins up cloud execution nodes, subjects the application to 30,000 RPS, records latency metrics, and fails the nightly build if p95 latency degrades by more than 5%.

### Action
* **Automated EC2 Provisioning**: Wrote Python orchestration scripts using `boto` to dynamically spin up 10 headless EC2 load generator instances on demand and terminate them immediately after test completion.
* **Distributed JMeter Engine**: Configured a master-slave JMeter runtime that distributed thread execution across nodes while streaming real-time HTTP metrics to InfluxDB.
* **Automated SLA Threshold Assertion**: Built a post-execution analysis script in Python that queried InfluxDB for p95/p99 response times and automatically raised build failure flags if latency exceeded defined SLA limits.

### Result
* Eliminated emergency hotfixes caused by performance regressions by catching **14 critical memory leaks** in CI over a 12-month period.
* Reduced nightly performance execution infrastructure costs by **90%** through ephemeral EC2 provisioning.