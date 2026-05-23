import { afterEach, describe, expect, it, vi } from "vitest";
import { testLogger } from "../helpers/logger/test-logger.ts";
import fetchHTML from "./fetch-html.ts";

describe("fetchHTML", () => {
	const mockUserAgent = "mock-crawler";
	afterEach(() => {
		vi.resetAllMocks();
		vi.unstubAllGlobals();
	});

	it("should fetch HTML content from a URL when content is html", async () => {
		const mockHTML = "<html><body><h1>Test Page</h1></body></html>";
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(
				new Response(mockHTML, {
					status: 200,
					headers: { "content-type": "text/html" },
				}),
			),
		);
		const url = new URL("https://example.com");
		const html = await fetchHTML(url, testLogger, mockUserAgent);
		expect(typeof html).toBe("string");
		expect(html.length).toBeGreaterThan(0);
	});
	it("should handle empty content", async () => {
		const mockHTML = "";
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(
				new Response(mockHTML, {
					status: 200,
					headers: { "content-type": "text/html" },
				}),
			),
		);
		const url = new URL("https://example.com");
		const html = await fetchHTML(url, testLogger, mockUserAgent);
		expect(typeof html).toBe("string");
		expect(html).toBe("");
	});
	it("should pass the provided user agent to fetch", async () => {
		const mockHTML = "<html><body><h1>Test Page</h1></body></html>";
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(
				new Response(mockHTML, {
					status: 200,
					headers: { "content-type": "text/html" },
				}),
			),
		);
		const url = new URL("https://example.com");
		await fetchHTML(url, testLogger, mockUserAgent);
		expect(fetch).toHaveBeenCalledWith(
			expect.any(URL),
			expect.objectContaining({
				headers: { "User-Agent": "mock-crawler" },
				signal: expect.any(AbortSignal),
			}),
		);
	});
	it("should throw an error when response is not ok", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(
				new Response("<html><body>Not found</body></html>", {
					status: 404,
					headers: { "content-type": "text/html" },
				}),
			),
		);
		const url = new URL("https://example.com");
		await expect(fetchHTML(url, testLogger, mockUserAgent)).rejects.toThrow(
			"Response is not okay",
		);
	});
	it("should throw an error when content type is not text/html", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(
				new Response(JSON.stringify({ some: "json" }), {
					status: 200,
					headers: { "content-type": "application/json" },
				}),
			),
		);
		const url = new URL("https://example.com");
		await expect(fetchHTML(url, testLogger, mockUserAgent)).rejects.toThrow(
			"Content-Type is not text/html",
		);
	});
	it("should throw an error when fetch fails", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockRejectedValue(new Error("Network error")),
		);
		const url = new URL("https://example.com");
		await expect(fetchHTML(url, testLogger, mockUserAgent)).rejects.toThrow(
			"Network error",
		);
	});
});
