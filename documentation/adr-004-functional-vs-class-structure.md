# ADR-004: Functional structure for the crawler instead of a class

## Status
Accepted

## Context
The crawler logic could be organised in two ways:

- **Class-based** — a `Crawler` class that holds state (visited URLs, the queue, robots rules) as instance properties, with methods like `crawl()` and `start()`.
- **Functional** — a top-level async function (`runCrawler`) that owns its state via closures and returns a result.

## Decision
Use a functional structure: a single exported `runCrawler` async function with an inner `crawl` closure that captures the shared queue and visited-URL map.

## Rationale
The crawler has one well-defined lifecycle: it starts, runs until the queue is empty, and returns a result. There is no need to instantiate multiple crawlers, pause and resume state between method calls, or inherit from a base class. A class would complexity with little benefit.

The shared state (`visitedUrls`, `queuedUrls`, `urlQueue`) is naturally scoped to a single invocation of `runCrawler`. Closures express this scope directly: the inner `crawl` function can read and mutate these without being passed them as arguments on every call, keeping the call signature clean.

Functional composition also makes unit testing straightforward: each helper (`fetchHTML`, `parseHTML`, `normaliseLinks`, `filterLinksToQueue`) is a pure or near-pure function that can be tested in isolation without constructing a class instance or mocking instance methods.

## Trade-offs
If multiple crawler configurations needed to be created and reused across a long-lived process, a class with constructor injection would be cleaner. For the current use case, a single crawl per process invocation, the functional approach is simpler.
