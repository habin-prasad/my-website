---
title: "Scaling Elastic Distributed Browser Grids on Kubernetes Spot Instances"
description: "Engineering auto-scaling browser node pools using KEDA queue metrics and spot instance termination handlers for fast, cost-effective browser testing."
pubDate: 2016-06-25
draft: false
tags: ["Kubernetes", "Distributed Systems", "Cloud", "Performance"]
---

Executing thousands of end-to-end browser tests in parallel requires massive compute bursts. Maintaining a static cluster of browser containers costs tens of thousands of dollars per month in compute fees while sitting idle 80% of the day.

To achieve fast execution times at low cost, build an **elastic, queue-driven browser grid**.

## Queue-Based Auto-Scaling with KEDA

Instead of scaling worker pods based on CPU or RAM metrics (which lag behind actual load spikes), scale worker pods directly based on the number of pending WebSocket driver connection requests in your grid broker queue.

Using Kubernetes Event-driven Autoscaling (KEDA):

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: browser-grid-scaler
  namespace: automation-grid
spec:
  scaleTargetRef:
    name: headless-chrome-node
  minReplicaCount: 2
  maxReplicaCount: 200
  triggers:
  - type: prometheus
    metadata:
      serverAddress: [http://prometheus.monitoring:9090](http://prometheus.monitoring:9090)
      metricName: selenium_grid_queue_size
      query: sum(selenium_grid_queue_size)
      threshold: '1'
Handling Spot Instance Interruptions Gracefully
AWS Spot Instances offer up to a 90% discount over On-Demand pricing, but nodes can be reclaimed with only a 2-minute notice.

[ AWS Reclaim Warning (2-min) ] ──> [ Node Drain Handler ] ──> [ Stop New Session Invocation ]
                                                                      │
                                                                      ▼
                                                       [ Complete Active Tests -> Terminate ]
When a termination signal (SIGTERM) is received:

The grid broker immediately unregisters the instance from accepting new test incoming requests.

The active browser containers are allowed a 90-second grace window to finish active test assertions.

Incomplete tests automatically re-queue on new pods without failing the overall build pipeline.