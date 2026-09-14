---
title: "Deterministic Synthetic Data Generation Strategies for Complex Relational Schemas"
description: "Patterns for generating millions of constraint-valid relational database records deterministically using seed-based pseudorandom algorithms."
pubDate: 2015-07-14
draft: false
tags: ["Database", "Architecture", "Data Engineering", "Testing Strategy"]
---

Relying on hardcoded static SQL dumps (`seed.sql`) or completely random data generators creates two distinct engineering failures: static dumps become obsolete as schemas evolve, while purely random data causes non-deterministic test failures when edge-case values unpredictably trigger validation errors.

## The Principle of Deterministic Seeded Randomness

To guarantee that a test failure is 100% reproducible across local developer machines and CI build runners, synthetic data generation must be **deterministic**.

Given the exact same initial seed value $S$, a pseudorandom number generator (PRNG) must produce the exact same sequence of synthetic attributes $A_1, A_2, \dots, A_n$:

$$\text{PRNG}(S) \to \{ \text{Email}_1, \text{UUID}_1, \text{Amount}_1 \}$$

```python
import random
from faker import Faker

def generate_test_user(seed_value: int) -> dict:
    # Initialize PRNG state deterministically
    fake = Faker()
    Faker.seed(seed_value)
    random.seed(seed_value)

    return {
        "user_id": fake.uuid4(),
        "email": fake.company_email(),
        "account_balance": round(random.uniform(10.0, 5000.0), 2),
    }


Enforcing Schema Rules via Type-Driven BuildersInstead of hardcoding attributes, derive generator rules directly from database column metadata:
1. VARCHAR Boundaries: Enforce string length limits based on SQL column definitions (VARCHAR(50) -> fake.text(max_nb_chars=50)).
2. Numeric Precision: Respect floating-point and decimal constraints (DECIMAL(10,2) -> round(val, 2)).
3. Unique Constraints: Maintain an in-memory bloom filter during the run to prevent duplicate collisions on unique index columns (UNIQUE(email)).