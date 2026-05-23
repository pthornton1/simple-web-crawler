import { describe, expect, it } from "vitest";
import parseHTML from "./parse-html.ts";

describe("parseHTML", () => {
	it("should extract and resolve links from HTML", () => {
		const mockHtml = `<html><body>
            <a href="http://example.com/page1">Page 1</a>
        </body></html>`;
		const mockBaseUrl = new URL("http://example.com");
		const links = parseHTML(mockHtml, mockBaseUrl);
		expect(links).toEqual([new URL("http://example.com/page1")]);
	});
	it("handles empty HTML and returns empty links array", () => {
		const mockHtml = ``;
		const mockBaseUrl = new URL("http://example.com");
		const links = parseHTML(mockHtml, mockBaseUrl);
		expect(links).toEqual([]);
	});
	it("handles malformed HTML and extracts links", () => {
		const mockBaseUrl = new URL("http://example.com");
		const mockHtml = `<html><body><a href="http://example.com/page1">Page 1</a`;
		const links = parseHTML(mockHtml, mockBaseUrl);
		expect(links).toEqual([new URL("http://example.com/page1")]);
	});

	describe("links extraction", () => {
		it("should ignore links without href", () => {
			const mockHtml = `<html><body>
            <a>Page 1</a>
            </body></html>`;
			const mockBaseUrl = new URL("http://example.com");
			const links = parseHTML(mockHtml, mockBaseUrl);
			expect(links).toEqual([]);
		});
		it("should resolve relative URLs", () => {
			const mockHtml = `<html><body>
            <a href="/page1">Page 1</a>
            </body></html>`;
			const mockBaseUrl = new URL("http://example.com");
			const links = parseHTML(mockHtml, mockBaseUrl);
			expect(links).toEqual([new URL("http://example.com/page1")]);
		});
		it("should ignore non-http(s) URLs", () => {
			const mockHtml = `<html><body>
            <a href="http://example.com/page1">Page 1</a>
            <a href="ftp://example.com/file">FTP Link</a>
            </body></html>`;
			const mockBaseUrl = new URL("http://example.com");
			const links = parseHTML(mockHtml, mockBaseUrl);
			expect(links).toEqual([new URL("http://example.com/page1")]);
		});
	});
});
