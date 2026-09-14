---
title: "Shift-Left Performance Testing: Enforcing Latency Budgets in CI/CD with k6"
description: "How to automate load testing inside pull request workflows using k6 thresholds and Prometheus metrics to catch performance regressions early."
pubDate: 2016-12-15
draft: false
tags: ["Performance", "k6", "CI/CD", "DevOps", "Benchmarking"]
---

Running load tests once per quarter before a major release is a recipe for production incidents. By the time a regression is discovered, hundreds of commits have been merged, making root-cause analysis slow and costly.

**Shift-Left Performance Testing** embeds lightweight, automated performance assertions directly into PR pipelines.

## Setting SLA Thresholds in k6

k6 allows engineers to write load scripts in JavaScript while executing them on a high-performance Go engine. Crucially, k6 supports **thresholds**—pass/fail criteria based on metric thresholds.

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp-up to 50 virtual users
    { duration: '1m', target: 50 },   // Sustained load
    { duration: '15s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    // 95% of requests must complete in under 200ms
    http_req_duration: ['p(95)<200'],
    // Request failure rate must be less than 1%
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('[http://staging-api.internal/v1/orders](http://staging-api.internal/v1/orders)');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(0.5);
}

Integrating Performance Gates into GitHub ActionsTo prevent merging code that breaks response time budgets, run k6 headlessly inside your pull request checks:YAML- name: Run k6 Load Gate Test
  uses: grafana/k6-action@v0.3.0
  with:
    filename: tests/performance/orders-api.js
    flags: --out json=k6-results.json
If the $p_{95}$ latency threshold exceeds 200ms during the test run, k6 exits with a non-zero code, blocking the PR merge automatically.