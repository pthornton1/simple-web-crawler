import type { Robot } from "robots-parser";
import { describe, expect, it } from "vitest";
import filterLinksToQueue from "./filter-links-to-queue.ts";

describe("filterLinksToQueue", () => {
	const mockUSerAgent = "mock-crawler";
	it("should return an empty array if there are no links", () => {
		const result = filterLinksToQueue(
			[],
			new URL("http://example.com"),
			null,
			new Set(),
			mockUSerAgent,
		);
		expect(result).toEqual([]);
	});
	it("should return all links if they are all valid", () => {
		const links = ["http://example.com/page1", "http://example.com/page2"];
		const result = filterLinksToQueue(
			links,
			new URL("http://example.com"),
			null,
			new Set(),
			mockUSerAgent,
		);
		expect(result).toEqual(links);
	});
	it("should filter out visited URLs", () => {
		const queuedUrls = new Set(["http://example.com/page1"]);
		const links = ["http://example.com/page1", "http://example.com/page2"];
		const result = filterLinksToQueue(
			links,
			new URL("http://example.com"),
			null,
			queuedUrls,
			mockUSerAgent,
		);
		expect(result).toEqual(["http://example.com/page2"]);
	});
	it("should filter out URLs with different origins", () => {
		const links = ["http://example.com/page1", "http://other.com/page2"];
		const result = filterLinksToQueue(
			links,
			new URL("http://example.com"),
			null,
			new Set(),
			mockUSerAgent,
		);
		expect(result).toEqual(["http://example.com/page1"]);
	});
	it("should filter out disallowed URLs according to robots.txt", () => {
		const robots: Robot = {
			isDisallowed: (url: string) => url === "http://example.com/page1",
			isAllowed: () => true,
			getMatchingLineNumber: () => 0,
			getCrawlDelay: () => undefined,
			getSitemaps: () => [],
			getPreferredHost: () => null,
		};
		const links = ["http://example.com/page1", "http://example.com/page2"];
		const result = filterLinksToQueue(
			links,
			new URL("http://example.com"),
			robots,
			new Set(),
			mockUSerAgent,
		);
		expect(result).toEqual(["http://example.com/page2"]);
	});
});
