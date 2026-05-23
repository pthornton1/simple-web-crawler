# ADR-002: Breadth-first crawl order

## Status
Accepted

## Context
When crawling a domain, the order in which URLs are visited affects which pages are discovered first and how useful the output is if the crawl is interrupted or capped. The two standard graph traversal strategies are:

- **Breadth-first search (BFS)** - visit all links found on the current level before following links to the next level.
- **Depth-first search (DFS)** - follow one path as deep as possible before backtracking.

## Decision
Traverse URLs in breadth-first order.

## Rationale
The most important and highest-traffic pages on a website are almost always reachable in the fewest hops from the homepage - the root URL is the natural starting point. BFS ensures these high-value pages are crawled first.

In practice, crawls are often constrained: they may be subject to a page limit, a time budget, or rate limiting from `robots.txt`. Under any of these constraints, DFS risks spending the entire budget following one deep path (e.g. paginated archives or deeply nested category trees) while missing the bulk of the site's navigable content.

BFS is implemented naturally by p-queue: new links discovered on the current page are added to the end of the queue, which processes them in FIFO order. No explicit queue management beyond this is required.
