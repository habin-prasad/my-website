---
title: "Why Jenkins Masters Choke on Parallel Builds (and How to Tame Executor Threads)"
description: "A deep dive into JVM heap fragmentation, thread starvation, and socket leaks when scaling parallel test executors on legacy CI controllers."
pubDate: 2013-03-15
draft: false
tags: ["CI/CD", "Jenkins", "Java", "Infrastructure", "Performance"]
---

When scaling test pipelines, the most common bottleneck isn't the test code—it's the CI controller. Running 30+ parallel execution threads on a single Jenkins master quickly leads to JVM garbage collection pauses, thread starvation, and silent build drops.

## The JVM Heap Collapse

Jenkins plugins often retain build state in memory for UI reporting. When firing 50 parallel matrix jobs, each thread retains logs, environment variables, and workspace references in the heap:
[ Parallel Executors (x50) ] ──> [ Shared Controller JVM Heap ] ──> [ Stop-the-World GC Pause ]

## Remediation Strategies

1. **Offload Work to Slaves**: Configure the controller node with **0 executors**. Force all job processing off the master process onto isolated SSH slave nodes.
2. **Disable Heavy Logging Plugins**: Avoid inline log parsers that buffer stdout in memory during thread execution.
3. **Tune Garbage Collection**: Pass `-XX:+UseG1GC -XX:MaxGCPauseMillis=200` to the Jenkins startup daemon to prevent long GC pauses from disconnecting build agents.