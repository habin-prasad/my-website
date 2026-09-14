---
title: "Zero-Trust API Contract & Backward-Compatibility Engine"
role: "Head of Software Automation"
period: "2021 - 2023"
summary: "Engineered an automated API governance framework across 80+ microservices, stopping breaking API changes in CI before deployment to integration environments."
domain: "Quality & Automation"
technologies:
  - "TypeScript"
  - "OpenAPI v3"
  - "eBPF"
  - "Pact"
  - "GitHub Actions"
  - "Kafka"
featured: false
---

### Situation
With 80+ microservices owned by disparate squads, unannounced breaking schema changes (e.g., deleted JSON attributes, type mutations) frequently broke downstream dependencies in staging, delaying release cycles by days.

### Task
Create an automated contract validation gateway that detects schema regressions and breaking payload alterations at the pull request phase without running full end-to-end service stacks.

### Action
* **eBPF-Driven Schema Extraction**: Deployed eBPF probes in development clusters to capture real microservice-to-microservice payload schemas and dynamically generate OpenAPI specifications.
* **Consumer-Driven Contract Engine**: Standardized Pact testing rules across squads, baking automated breaking-change analysis (`oasdiff`) into pre-merge CI checks.
* **Event-Driven Schema Registry**: Integrated a centralized schema registry that blocks PR merges if a producer service breaks a registered consumer contract.

### Result
* Prevented **140+ breaking API shifts** in CI over a 12-month period.
* Reduced dependency-related staging outages to **zero**.