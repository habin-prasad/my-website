---
title: "Simulating 20,000 Concurrent WebSocket Connections on Linux Kernels"
description: "Tuning OS file descriptors, TCP socket memory buffers, and Epoll event loops to execute massive real-time WebSocket load tests."
pubDate: 2013-12-10
draft: false
tags: ["Performance", "Linux", "WebSockets", "Networking"]
---

Stress testing real-time WebSocket connections introduces unique OS-level challenges compared to standard HTTP requests. While HTTP connections open, transfer data, and close, WebSockets remain open indefinitely, rapidly exhausting Linux file descriptors and socket memory.

## The File Descriptor Limit (`nofile`)

By default, Linux limits a single process to 1,024 open file descriptors. Because every TCP socket connection consumes one file descriptor, a load generator process will crash almost immediately (`java.net.SocketException: Too many open files`).

### Kernel Tuning Parameters

To allow a single worker instance to handle 20,000+ open connections, adjust `/etc/security/limits.conf` and `sysctl.conf`:

```bash
# Raise maximum open files for worker process
* soft nofile 65535
* hard nofile 65535

# Expand local port range for ephemeral TCP outbound sockets
sysctl -w net.ipv4.ip_local_port_range="1024 65535"

# Enable socket reuse to prevent TIME_WAIT saturation
sysctl -w net.ipv4.tcp_tw_reuse=1

Socket Memory Optimization (rmem / wmem)
Every open TCP socket allocates read and write buffers in RAM. At 20,000 idle connections, default memory allocations consume several gigabytes of kernel memory.

Default: 128 KB per socket * 20,000 = ~2.5 GB RAM (Kernel Space)
Tuned:    16 KB per socket * 20,000 = ~320 MB RAM (Kernel Space)
Lowering net.ipv4.tcp_rmem and net.ipv4.tcp_wmem minimum values allows long-lived idle WebSocket connections to consume minimal OS memory without dropping incoming frames.