# Simple Web Crawler in TypeScript

## Description

A web crawler implemented in TypeScript using [cheerio](https://cheerio.js.org/) and [p-queue](https://github.com/sindresorhus/p-queue). It crawls a given URL, extracting all links and following them in roughly breadth-first order, staying within the same domain. The high level architecture can be seen in this diagram:

<img width="1253" height="834" alt="Screenshot 2026-05-23 at 16 47 21" src="https://github.com/user-attachments/assets/ff3bcc65-e7b9-4568-a1ef-829fff9b87b0" />

## Setup

This project requires Node.js v24. It is recommended to use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions — run `nvm use` in the project root to switch to the correct version.

Install dependencies:

```
npm install
```

## Usage

Run the crawler by passing a URL:

```
npm run crawl https://crawlme.monzo.com
```

Replace the URL as needed. The crawler will stay within the same domain as the starting URL.

## Output

Results are written to `output/crawl-result.json` as a JSON map of each crawled URL to its list of discovered links.

## Testing

Run the test suite:

```
npm test
```

Type-check the project:

```
npm run typecheck
```

Lint and format:

```
npm run biome
```

Husky is used for pre-commit checks and runs the linting, typechecking and tests before commits.

## Design decisions

Detailed ADRs for the larger decisions can be found in the [`documentation/`](./documentation) folder.


**Breadth-first search** — The most important links on a site are typically reachable from the homepage. Breadth-first captures these early, which matters if the crawl hits a page limit or timeout.

**Server-rendered HTML only** — Cheerio parses static HTML. Crawling JavaScript-rendered content would require Playwright or Puppeteer, which are far more CPU-intensive and would slow the crawl significantly.

**HTML-only parsing** — Only `text/html` responses are parsed. Other content types (XML, JSON, etc.) are skipped, as HTML makes up the majority of navigable web content.

**URL Normalisation** — All trailing slashes are removed for consistency. Hashes that link to sections are ignored as these do not represent distinct pages. Query params are also removed for simplicity in this project as can often contain params that don't impact page content eg. marketing and tracking params. For production usage, certain params should be removed whilst others left eg. ?page=1 should typically be left.

**In-memory queue with high concurrency** — p-queue with a concurrency of 1000 is used alongside Maps and Sets to run against the test link in short space of time. In real usage, the concurrency should be a sensible value eg. 5-10 to avoid abusing the target server. The main bottleneck is network I/O, not CPU, so high concurrency is justified. Node.js is single-threaded, so very high concurrency does introduce more event-loop interruptions, but the trade-off is worthwhile here. For larger-scale crawls, a distributed queue (e.g. BullMQ + Redis) would allow true parallelisation across multiple machines.

**Robots.txt support** — The crawler fetches and respects `robots.txt` before starting, honouring both disallowed routes and crawl rate limits.

**Retry with exponential back-off** — Failed network requests are retried up to twice with exponential back-off. A 5-second timeout prevents requests from hanging indefinitely.

**Pluggable logger** — The logger interface is generic so it can be swapped for a structured observability library (e.g. Datadog, New Relic) without changing crawler logic.

**Fault-tolerant per-URL** — If crawling a URL fails, it is logged as a warning and skipped so the rest of the crawl can continue.
