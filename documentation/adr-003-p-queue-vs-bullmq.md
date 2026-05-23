# ADR-003: p-queue for concurrency control instead of BullMQ

## Status
Accepted

## Context
The crawler needs to issue many HTTP requests concurrently while respecting rate limits from `robots.txt`. A queue abstraction is required to manage concurrency and pacing. Two categories of solution were considered:

- **In-process queue** (e.g. p-queue) — a lightweight promise queue that runs within the Node.js process, backed entirely by in-memory data structures.
- **Distributed queue** (e.g. BullMQ + Redis) — a persistent, multi-process queue backed by a shared in-memory store, designed for horizontal scaling across multiple workers and machines.

## Decision
Use p-queue.

## Rationale
p-queue is a minimal library (no external dependencies, <2 KB) that provides exactly the primitives this crawler needs: a concurrency cap and a rate-limiting interval. Both are configurable at construction time and map directly onto the `robots.txt` crawl-delay value.

The crawl runs as a single Node.js process. I/O concurrency in Node.js is handled by the event loop — true parallelism is not needed for network requests, and p-queue's in-process model is sufficient to keep thousands of outbound requests in flight simultaneously.

BullMQ requires a running Redis instance, introduces operational overhead (connection management, serialisation of job payloads, worker processes), and is designed for workloads that need durability, retries across process restarts, or fan-out across many machines. None of these are requirements here.

## Trade-offs
p-queue is single-process and in-memory. If the crawler were to be scaled to crawl very large domains (millions of URLs) or to run as a distributed service where multiple crawler workers share state, p-queue would need to be replaced. BullMQ (or a similar system backed by Redis or a message broker) would be the natural next step, as it supports:

- Durable job state that survives process crashes
- Multiple concurrent worker processes on separate machines
- Built-in retry policies and dead-letter queues
- Rate limiting coordinated across workers

For the current scope, crawling small to medium sites in a single process, p-queue is the right fit.
