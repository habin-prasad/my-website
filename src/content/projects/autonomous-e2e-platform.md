---
title: "Distributed Autonomous E2E Platform"
role: "Tech Lead / Head of Automation"
period: "2023 - Present"
summary: "Designed and built an enterprise-grade autonomous test runtime from scratch, reducing overall execution time by 65% across 4 major product lines."
metrics:
  - "65% Faster Test Cycles"
  - "$45k/mo Infra Cost Savings"
  - "99.4% Flake-Free Execution"
domain: "Platform & Infrastructure"
technologies:
  - "TypeScript"
  - "Playwright"
  - "Docker"
  - "Kubernetes"
  - "Redis"
  - "GraphQL"
featured: true
---

### Situation
The organization suffered from fragmented UI/API automation suites running across legacy Jenkins nodes. Tests took over 3.5 hours per PR, causing severe deployment bottlenecks, high infrastructure costs, and frequent false negatives due to test flakiness.

### Task
As the technical lead, architect a unified, zero-flakiness test execution platform capable of dynamically scaling across microservice repositories while keeping runtime under 15 minutes.

### Action
* **Architecture Design**: Engineed an event-driven test scheduler using Node.js, Redis queues, and Kubernetes worker pods to isolate test runners.
* **Smart Re-execution**: Implemented an automated root-cause analysis layer that auto-retries transient network drops and quarantines consistently failing tests.
* **Developer Experience**: Built CLI tooling for engineers to run isolated ephemeral environment tests locally with identical Docker images.

### Result
* Reduced CI pipeline test execution times from **210 minutes to 14 minutes**.
* Cut infrastructure costs by dynamic auto-scaling K8s worker pods down to zero outside peak deployment hours.

### Architecture Highlights
[ Developer PR ] ──> [ Webhook Handler ] ──> [ Redis Queue ]
│
┌─────────────┴─────────────┐
▼                           ▼
[ Pod Worker 01 ]           [ Pod Worker 02 ]
(Playwright / Node)         (Playwright / Node)
│                           │
└─────────────┬─────────────┘
▼
[ Test Analytics API ]