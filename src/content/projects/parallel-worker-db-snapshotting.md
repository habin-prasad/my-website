---
title: "Parallel Test Worker Orchestrator & Ephemeral DB Snapshotting Engine"
role: "Senior Automation Engineer"
period: "Year 1 · Q1 (Previous SaaS)"
summary: "Designed a custom Python worker dispatcher and PostgreSQL copy-on-write database isolation harness, reducing monolithic build validation time from 3.5 hours to 22 minutes."
domain: "Platform & Infrastructure"
metrics:
  - "75% Reduction in Build Execution Time"
  - "Zero Database Lock Contention"
  - "1,200+ Integration Tests Parallelized"
technologies:
  - "Python"
  - "PostgreSQL"
  - "Jenkins"
  - "Bash"
  - "Linux cgroups"
featured: false
---

### Situation
The core SaaS monolith relied on a single 3.5-hour sequential integration test run inside Jenkins. As the engineering team grew, developers experienced severe queue congestion, and concurrent test runs against shared PostgreSQL staging databases constantly failed due to table-level lock contention and shared mutation states.

### Task
Architect an isolated execution framework that allows 16 parallel test worker processes to execute against dedicated, clean database environments without requiring 16 separate physical database servers.

### Action
* **Copy-on-Write Database Isolation**: Utilized PostgreSQL `TEMPLATE` databases to spin up lightweight, ephemeral database instances (`test_db_worker_N`) in sub-second timeframes for each worker process.
* **Custom Python Process Dispatcher**: Built an async worker queue in Python that dynamically distributed tests across local CPU cores using Linux `cgroups` to enforce strict memory boundaries per process.
* **Automated Cleanup Hooks**: Implemented process signal traps in Bash and Python to ensure orphaned database connections and temp schema objects were dropped upon test termination or abort signals.

### Result
* Reduced integration build feedback loop from **210 minutes to 22 minutes**.
* Eliminated 100% of false-positive failures caused by shared database state collisions.