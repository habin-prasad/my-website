---
title: "Architecting Ephemeral Staging Environments on Kubernetes with Helm and Dynamic Routing"
description: "How to dynamically provision, route traffic to, and tear down per-PR preview environments using Kubernetes namespaces and Helm charts."
pubDate: 2016-04-12
draft: false
tags: ["Kubernetes", "DevOps", "Infrastructure", "Helm", "CI/CD"]
---

Static staging environments are anti-patterns in modern software engineering. They create deployment bottlenecks, encourage persistent dirty state across team boundaries, and accumulate idle cloud compute costs during off-hours.

Ephemeral environments—short-lived, isolated staging clusters instantiated automatically for a specific Pull Request—solve these problems at scale.

## The Ephemeral Lifecycle State Machine

[ PR Created ] ──> [ K8s Operator Spawn ] ──> [ Helm Install (Namespace PR-102) ]
│
▼
[ PR Merged/Closed ] <── [ Auto Cleanup / TTL ] <── [ Ingress Proxy Route Attached ]


## Dynamic Wildcard Routing with Ingress Controllers

To prevent needing manual DNS updates for every preview environment, combine wildcard DNS records (`*.preview.domain.internal`) with dynamic Ingress routing rules:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: preview-ingress
  namespace: pr-102
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: web
spec:
  rules:
  - host: pr-102.preview.domain.internal
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app-gateway-service
            port:
              number: 8080
Resource Quotas & Garbage Collection
Without strict limits, ephemeral stacks can quickly exhaust cloud provider IP addresses and node capacity. Enforce namespace resource quotas directly in your chart values:

YAML
apiVersion: v1
kind: ResourceQuota
metadata:
  name: pr-namespace-quota
  namespace: pr-102
spec:
  hard:
    requests.cpu: "2"
    requests.memory: 4Gi
    limits.cpu: "4"
    limits.memory: 8Gi
Decoupling preview environments from static infrastructure guarantees that developers validate microservices against clean, pristine isolated dependencies on every single commit.
