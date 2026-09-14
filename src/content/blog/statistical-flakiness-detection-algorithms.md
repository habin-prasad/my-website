---
title: "Statistical Flakiness Detection: Moving Beyond Naive Retry Loops"
description: "Applying binomial probability models and sliding-window variance metrics to distinguish true regressions from environmental test flakiness."
pubDate: 2016-01-18
draft: false
tags: ["Statistics", "Algorithms", "CI/CD", "Quality"]
---

The most common anti-pattern in modern CI/CD pipelines is the naive retry loop: rerun a failed test up to 3 times, and if it passes once, green-light the build.

While this masks flakiness in the short term, mathematically it destroys the pipeline's ability to detect genuine, low-probability race conditions.

## The Flaw of Naive Retries

Assume a genuine concurrency bug occurs in production under high load with probability $p = 0.30$. If your CI pipeline retries every failing test 3 times, the probability $P(\text{mask})$ of hiding this real regression and marking the build green is:

$$P(\text{mask}) = 1 - p^3 = 1 - (0.30)^3 = 1 - 0.027 = 97.3\%$$

By blindly retrying, **97.3% of true production-impacting race conditions pass through CI undetected**.

## Measuring Non-Determinism with Entropy

Instead of hiding failures, track a test's outcome entropy $H(X)$ over its last $N$ executions on the main branch:

$$H(X) = - \sum_{i \in \{\text{PASS}, \text{FAIL}\}} P(i) \log_2 P(i)$$

Deterministic Pass (100 Passes, 0 Fails)  ──> H(X) = 0.0Deterministic Fail (0 Passes, 100 Fails)  ──> H(X) = 0.0Highly Flaky       (50 Passes, 50 Fails)  ──> H(X) = 1.0 (Maximum Entropy)
```python
import math

def calculate_test_entropy(pass_count: int, fail_count: int) -> float:
    total = pass_count + fail_count
    if total == 0 or pass_count == 0 or fail_count == 0:
        return 0.0  # Zero entropy = completely deterministic
    
    p_pass = pass_count / total
    p_fail = fail_count / total
    
    return -(p_pass * math.log2(p_pass) + p_fail * math.log2(p_fail))
By setting threshold gates (e.g., $H(X) > 0.25$), pipelines automatically flag and quarantine flaky tests for investigation without silencing real defect signals.