# ADR-001: Cheerio for HTML parsing instead of Playwright/Puppeteer

## Status
Accepted

## Context
The crawler needs to extract links from web pages. Two broad approaches exist:

- **Static HTML parsing** (e.g. cheerio): fetch raw HTML via a standard HTTP request and parse the DOM directly.
- **Headless browser automation** (e.g. Playwright, Puppeteer): launch a full browser, load the page, execute JavaScript, and then read the resulting DOM.

## Decision
Use cheerio to parse server-rendered HTML.

## Rationale
The goal of this crawler is to map the link structure of a domain, not to test or interact with its JavaScript-driven UI. The vast majority of navigable links on the web are present in the initial HTML response and do not require JavaScript execution to discover.

Cheerio is a lightweight HTML parser with a jQuery-like API. It runs in the same Node.js process, adds negligible memory overhead, and is orders of magnitude faster than a headless browser for parsing static content.

Playwright and Puppeteer each launch a full Chromium (or similar) instance per page. This brings significant costs:
- **CPU and memory** — a headless browser process is expensive even for simple pages.
- **Concurrency** — running hundreds of browser instances in parallel is impractical on standard hardware; cheerio allows a concurrency of 1000+ with no meaningful overhead.
- **Startup latency** — browser launch adds latency to every cold worker.

## Trade-offs
Pages that render their navigation purely via JavaScript (e.g. single-page apps that build `<a>` tags client-side) will not have those links discovered. This is an acceptable limitation for the current scope. If JavaScript-rendered link discovery became a requirement, Playwright could be introduced for a targeted subset of URLs, or the crawler could be extended to follow API calls observed in network traffic.
