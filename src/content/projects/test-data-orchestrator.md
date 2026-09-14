---
title: "Cross-Cloud Multi-Tenant Test Data Orchestrator"
role: "Tech Lead / Head of Automation"
period: "2022 - 2024"
summary: "Designed a distributed test data orchestration engine that generates isolated, GDPR/HIPAA-compliant, stateful datasets on demand across multi-tenant environments."
domain: "Platform & Infrastructure"
metrics:
  - "Sub-3s Dataset Provisioning"
  - "100% GDPR/HIPAA Compliant"
  - "Zero Cross-Tenant Pollution"
technologies:
  - "Go"
  - "PostgreSQL"
  - "Redis"
  - "AWS KMS"
  - "Docker"
  - "gRPC"
featured: true
---

### Situation
As the platform expanded into healthcare and financial enterprise verticals, running automated tests against shared database snapshots violated compliance guidelines. Furthermore, parallel test workers constantly deadlocked on mutated database records, forcing test runners into slow sequential execution modes.

### Task
Architect a secure, high-throughput data isolation service capable of generating, masking, and tearing down complex multi-tenant relational data graphs in under 5 seconds for parallel test execution pipelines.

### Action
* **State Engine Architecture**: Built a lightweight gRPC service in Go that reads entity dependency graphs and provisions isolated schema tenants (`tenant_uuid`) on ephemeral database instances.
* **Cryptographic Data Masking**: Integrated AWS KMS-driven deterministic hashing for PII fields, allowing realistic data distributions without exposing real production records.
* **Copy-on-Write Snapshots**: Leveraged PostgreSQL template databases and ZFS/Btrfs snapshotting capabilities to instantly clone clean data states for parallel runner threads.

### Result
* Cut dataset setup latency from **45 seconds per test run to under 2.8 seconds**.
* Unlocked 100% parallel execution across 64 concurrent runner pods without database deadlocks.