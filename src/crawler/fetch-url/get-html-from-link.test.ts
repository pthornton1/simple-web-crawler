import { afterEach, describe, expect, it, vi } from "vitest";
import { testLogger } from "../helpers/logger/logger.ts";
import getHTMLFromLink from "./get-html-from-link.ts";

describe("getHTMLFromLink", () => {
	afterEach(() => {
		vi.resetAllMocks();
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
		const html = await getHTMLFromLink(url, testLogger);
		expect(typeof html).toBe("string");
		expect(html.length).toBeGreaterThan(0);
	});
	it("should throw an error when content type is not html", async () => {
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
		await expect(getHTMLFromLink(url, testLogger)).rejects.toThrow(
			"Content-Type is not text/html",
		);
	});
	it("should throw an error when fetch fails", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockRejectedValue(new Error("Network error")),
		);
		const url = new URL("https://example.com");
		await expect(getHTMLFromLink(url, testLogger)).rejects.toThrow(
			"Network error",
		);
	});
});
