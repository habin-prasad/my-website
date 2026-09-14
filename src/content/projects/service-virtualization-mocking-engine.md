---
title: "Enterprise Service Virtualization & High-Throughput HTTP Mocking Harness"
role: "Senior Automation Engineer"
period: "Year 2 · Q6 (Previous SaaS)"
summary: "Architected an enterprise service virtualization engine to mock third-party payment gateways and legacy SOAP/REST dependencies, cutting sandbox vendor fees by $85,000 annually."
domain: "Platform & Infrastructure"
metrics:
  - "12,000+ Mock Requests/Sec Throughput"
  - "$85,000 Annual Vendor Sandbox Cost Saved"
  - "Zero Test Failures from Rate Limiting"
technologies:
  - "Java"
  - "WireMock"
  - "Netty"
  - "Redis"
  - "Docker"
  - "Jackson"
featured: false
---

### Situation
Integration test suites depended on third-party staging sandboxes (e.g., payment gateways, SMS providers, credit checking services). These external endpoints introduced severe rate-limiting, frequent weekend maintenance downtime, and per-API-call billing costs that scaled linearly with pipeline parallelization.

### Task
Design a high-throughput, stateful HTTP service virtualization harness capable of simulating third-party network failures, latency spikes, and dynamic payload responses locally inside Docker containerized build pipelines.

### Action
* **Non-Blocking I/O Architecture**: Wrapped a headless WireMock core in a custom Netty-based server wrapper, optimizing socket reuse and thread pools to process over 12,000 HTTP requests per second.
* **Stateful Response Stubs**: Engineered a dynamic scenario engine backed by Redis that maintained stateful transaction workflows (e.g., `Authorizing -> Captured -> Refunded`) across multi-step API sequences without external network calls.
* **Fault Injection Profiles**: Implemented dynamic HTTP header injection (`X-Simulate-Fault: connection-drop`) to force the mock engine to drop connections mid-transfer or inject 5,000ms latency to validate client-side timeout logic.

### Result
* Saved **$85,000 per year** in third-party API sandbox execution costs.
* Completely eliminated third-party API rate-limiting errors in CI, reducing test execution time by 35%.