import type { Robot } from "robots-parser";
import { describe, expect, it } from "vitest";
import queueLinks from "./queue-links.ts";

describe("queueLinks", () => {
	it("should return an empty array if there are no links", () => {
		const result = queueLinks(
			[],
			new URL("http://example.com"),
			null,
			new Set(),
		);
		expect(result).toEqual([]);
	});
	it("should return all links if they are all valid", () => {
		const links = [
			new URL("http://example.com/page1"),
			new URL("http://example.com/page2"),
		];
		const result = queueLinks(
			links,
			new URL("http://example.com"),
			null,
			new Set(),
		);
		expect(result).toEqual(links);
	});
	it("should filter out visited URLs", () => {
		const visitedUrls = new Set(["http://example.com/page1"]);
		const links = [
			new URL("http://example.com/page1"),
			new URL("http://example.com/page2"),
		];
		const result = queueLinks(
			links,
			new URL("http://example.com"),
			null,
			visitedUrls,
		);
		expect(result).toEqual([new URL("http://example.com/page2")]);
	});
	it("should filter out URLs with different origins", () => {
		const links = [
			new URL("http://example.com/page1"),
			new URL("http://other.com/page2"),
		];
		const result = queueLinks(
			links,
			new URL("http://example.com"),
			null,
			new Set(),
		);
		expect(result).toEqual([new URL("http://example.com/page1")]);
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
		const links = [
			new URL("http://example.com/page1"),
			new URL("http://example.com/page2"),
		];
		const result = queueLinks(
			links,
			new URL("http://example.com"),
			robots,
			new Set(),
		);
		expect(result).toEqual([new URL("http://example.com/page2")]);
	});
});
