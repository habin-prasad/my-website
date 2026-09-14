---
title: "Architecting Low-Latency HTTP Mock Servers with Netty and In-Memory Caching"
description: "How non-blocking I/O event loops and in-memory response caching enable mock servers to handle 10,000+ requests per second in test environments."
pubDate: 2015-04-22
draft: false
tags: ["Java", "Netty", "Performance", "Networking", "Concurrency"]
---

When hundreds of parallel test executors target a local mock server, traditional thread-per-request servlet containers (like Tomcat or Jetty) quickly exhaust thread pools (`java.lang.OutOfMemoryError: unable to create new native thread`).

To support high-concurrency performance testing, mock servers must use **non-blocking I/O event loops**.

## Thread-per-Request vs. Event-Loop Architecture

Thread-per-Request:  [Req 1] ──> [Thread 1 (Blocked on Disk/I/O)]
[Req 2] ──> [Thread 2 (Blocked on Disk/I/O)]

Event-Loop (Netty):  [Req 1, Req 2, Req 3] ──> [Single Boss Event Loop] ──> [Worker Pool]


## Optimizing Netty Event Loops for Mocking Workflows

Using Netty’s `NioEventLoopGroup`, a small cluster of worker threads can handle thousands of concurrent open socket connections:

```java
EventLoopGroup bossGroup = new NioEventLoopGroup(1); // Accepts incoming connections
EventLoopGroup workerGroup = new NioEventLoopGroup(); // Handles HTTP parsing & routing

ServerBootstrap b = new ServerBootstrap();
b.group(bossGroup, workerGroup)
 .channel(NioServerSocketChannel.class)
 .childHandler(new ChannelInitializer<SocketChannel>() {
     @Override
     public void initChannel(SocketChannel ch) {
         ch.pipeline().addLast(new HttpServerCodec());
         ch.pipeline().addLast(new HttpObjectAggregator(65536));
         ch.pipeline().addLast(new FastMockResponseHandler());
     }
 })
 .option(ChannelOption.SO_BACKLOG, 1024)
 .childOption(ChannelOption.SO_KEEPALIVE, true);
Key Memory Optimizations
Pre-Compiled Byte Buffers: Cache frequently returned JSON payloads as raw ByteBuf byte arrays in RAM to bypass serialization overhead during runtime response writes.

Off-Heap Allocations: Utilize Netty's Unpooled.directBuffer() to keep response buffers outside JVM Garbage Collection heap sweeps, completely eliminating stop-the-world GC pauses during high-RPS execution.