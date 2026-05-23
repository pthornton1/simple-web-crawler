import { afterEach, describe, expect, it, vi } from "vitest";
import { testLogger } from "../helpers/logger/test-logger.ts";
import fetchRobots from "./fetch-robots.ts";

describe("fetchRobots", () => {
	afterEach(() => {
		vi.resetAllMocks();
		vi.unstubAllGlobals();
	});
	it("should fetch and parse robots.txt", async () => {
		const mockRobots = "User-agent: *\nCrawl-delay: 5";
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(
				new Response(mockRobots, {
					status: 200,
					headers: { "content-type": "text/plain" },
				}),
			),
		);
		const subDomain = new URL("https://example.com");
		const testUrl = new URL("https://example.com/test");
		const robots = await fetchRobots(subDomain, testLogger);
		expect(robots).not.toBeNull();
		expect(robots?.isDisallowed(testUrl.toString(), "my-crawler")).toBe(false);
	});

	it("should return null when robots.txt returns 404", async () => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValue(
					new Response("<html>Not Found</html>", { status: 404 }),
				),
		);
		const robots = await fetchRobots(
			new URL("https://example.com"),
			testLogger,
		);
		expect(robots).toBeNull();
	});

	it("should return null when robots.txt not fetched and warn", async () => {
		const subDomain = new URL("https://invalid-domain");
		const robots = await fetchRobots(subDomain, testLogger);
		expect(robots).toBeNull();
		expect(testLogger.warn).toHaveBeenCalledWith(
			"Failed to fetch robots.txt",
			expect.objectContaining({
				url: `${subDomain}/robots.txt`,
				err: expect.any(Error),
			}),
		);
	});
});
