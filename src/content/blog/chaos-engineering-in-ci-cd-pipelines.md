---
title: "Automating Chaos Engineering in Staging with Chaos Mesh and Kubernetes"
description: "Injecting pod kills, CPU spikes, and network latency in automated CI runs to validate circuit breakers and self-healing systems."
pubDate: 2017-02-05
draft: false
tags: ["Chaos Engineering", "Kubernetes", "Resilience", "Chaos Mesh", "SRE"]
---

Designing resilient systems on paper is easy; proving that your system actually recovers from real-world infrastructure failures requires **Chaos Engineering**.

Instead of waiting for an AWS availability zone outage to test your system's failover mechanisms, introduce controlled failures automatically in staging environments using **Chaos Mesh**.

## The Mechanics of Kubernetes Fault Injection

Chaos Mesh leverages Custom Resource Definitions (CRDs) and Linux eBPF/Chaos Daemon proxies on Kubernetes nodes to intercept traffic and manipulate kernel calls.

[ Chaos Controller ] ── Applies CRD ──> [ Chaos Daemon (eBPF / Traffic Control) ]
│
▼
[ Target Pod ] <── Injects 300ms Packet Latency ────┘


## Example: Simulating Network Latency and Packet Loss

The following `NetworkChaos` specification injects 300ms of latency and a 10% packet loss on all outgoing requests from the `payment-service` namespace to the database cluster:

```yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: payment-db-latency-injection
  namespace: staging
spec:
  action: delay
  mode: all
  selector:
    namespaces:
      - staging
    labelSelectors:
      'app': 'payment-service'
  delay:
    latency: '300ms'
    jitter: '50ms'
    correlation: '50'
  direction: to
  target:
    selector:
      namespaces:
        - staging
      labelSelectors:
        'app': 'postgres-db'
  duration: '5m'
Automated Resilience Verification
Running chaos in isolation is incomplete without automated verification. Combine Chaos Mesh with synthetic user load runs:

Trigger k6 load test background run.

Apply NetworkChaos injection 30 seconds into the run.

Assert that the client application returns 200 OK (via fallback cache or circuit breaker) and never crashes with 500 Internal Server Error.

Verify that Prometheus metrics show automatic recovery within 15 seconds after chaos removal.