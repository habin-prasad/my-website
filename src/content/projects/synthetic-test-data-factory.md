---
title: "High-Throughput Synthetic Test Data Factory & Topological Entity Graph Engine"
role: "Senior Automation Engineer"
period: "Year 2 · Q7 (Previous SaaS)"
summary: "Architected a high-throughput relational test data generation engine that builds complex, constraint-valid entity dependency graphs in-memory to seed database state in milliseconds."
domain: "Platform & Infrastructure"
metrics:
  - "Sub-5ms Entity Graph Seeding"
  - "100% Referential Integrity Enforced"
  - "Zero Relational Lock Contention"
technologies:
  - "Python"
  - "PostgreSQL"
  - "SQLAlchemy"
  - "NetworkX"
  - "Redis"
  - "Docker"
featured: false
---

### Situation
As the relational database schema grew to over 200 tables with deeply nested foreign key constraints, manual SQL fixture files (`seed.sql`) became impossible to maintain. Engineers frequently spent hours manually crafting valid database records for complex test scenarios, leading to fragile, tightly-coupled tests that broke on every schema migration.

### Task
Architect an automated, memory-efficient data generation engine capable of inspecting relational database schemas, resolving complex foreign-key dependency trees, and dynamically instantiating constraint-valid entity sets on demand.

### Action
* **Topological Graph Resolution**: Built an in-memory Directed Acyclic Graph (DAG) model using `NetworkX` that parsed database metadata, analyzed foreign-key relations, and dynamically ordered entity creation sequences using Kahn's algorithm.
* **Deterministic Pseudorandom Seeders**: Implemented custom state builders in Python using `Faker` and `SQLAlchemy`, bound to deterministic seed values (`random.seed(test_id)`), ensuring identical data states across reproducible test executions.
* **Bulk Vectorized Insertions**: Optimized database persistence by batching SQL `INSERT` statements using PostgreSQL `COPY FROM` streams, bypassing ORM instantiation overhead during high-concurrency seeding phases.

### Result
* Reduced fixture generation and database seeding time from **seconds to under 5 milliseconds** per execution block.
* Eliminated 100% of foreign-key constraint violations across 8,000+ automated test suites.