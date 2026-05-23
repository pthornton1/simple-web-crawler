import { afterEach, beforeEach, describe, expect, it, type Mock } from "vitest";
import { startMockServer } from "../mock-server/mock-server.ts";
import runCrawler from "./crawler.ts";
import { testLogger } from "./helpers/logger/logger.ts";

describe("runCrawler", () => {
	let baseUrl: URL;
	let close: () => Promise<void>;

	beforeEach(async () => {});

	afterEach(() => close());

	it("handles pages with no links", async () => {
		const mockPages: Record<string, string> = {
			"/": `<html><body>
                
            </body></html>`,
		};
		({ baseUrl, close } = await startMockServer(mockPages));
		const visited = await runCrawler({
			startUrl: baseUrl,
			logger: testLogger,
		});
		expect(visited.size).toBe(1);
		expect(visited.has(`${baseUrl}`)).toBe(true);
		expect(visited.get(`${baseUrl}`)).toEqual([]);
	});

	it("discovers all linked pages", async () => {
		const mockPages: Record<string, string> = {
			"/": `<html><body>
                <a href="/about">About</a>
                <a href="/products">Products</a>
            </body></html>`,
			"/about": `<html><body>
                <a href="/">Home</a>
                <a href="/team">Team</a>
            </body></html>`,
			"/products": `<html><body>
                <a href="/products/1">Product 1</a>
            </body></html>`,
		};
		({ baseUrl, close } = await startMockServer(mockPages));
		const visited = await runCrawler({
			startUrl: baseUrl,
			logger: testLogger,
		});
		expect(visited.has(`${baseUrl}`)).toBe(true);
		expect(visited.has(`${baseUrl}about`)).toBe(true);
		expect(visited.has(`${baseUrl}products`)).toBe(true);
	});
	it("crawls urls only once", async () => {
		const mockPages: Record<string, string> = {
			"/": `<html><body>
                <a href="/about">About</a>
                <a href="/products">Products</a>
            </body></html>`,
			"/about": `<html><body>
                <a href="/">Home</a>
                <a href="/products">Products</a>
            </body></html>`,
			"/products": `<html><body>
                <a href="/products/1">Product 1</a>
            </body></html>`,
		};
		({ baseUrl, close } = await startMockServer(mockPages));
		await runCrawler({
			startUrl: baseUrl,
			logger: testLogger,
			verbose: true,
		});
		const productCrawls = (testLogger.info as Mock).mock.calls.filter(
			([string]) => string === `crawling page ${baseUrl}products`,
		);
		expect(productCrawls.length).toBe(1);
	});
	it("terminates on cycles", async () => {
		const mockPages = {
			"/": `<a href="/loop">Loop</a>`,
			"/loop": `<a href="/">Home</a>`,
		};
		({ baseUrl, close } = await startMockServer(mockPages));
		const visited = await runCrawler({ startUrl: baseUrl, logger: testLogger });
		expect(visited.size).toBe(2);
	});
	it("does not follow external links", async () => {
		const mockPages = {
			"/": `
			<a href="/internal">Internal</a>
			<a href="https://external.example.com/">External</a>
			`,
			"/internal": `<p>Internal page</p>`,
		};
		({ baseUrl, close } = await startMockServer(mockPages));
		const visited = await runCrawler({ startUrl: baseUrl, logger: testLogger });
		const visitedUrls = [...visited.keys()];
		expect(visitedUrls.every((u) => u.startsWith(baseUrl.origin))).toBe(true);
		expect(visited.size).toBe(2);
	});
	it("continues crawling when a page returns 404", async () => {
		const mockPages = {
			"/": `
			<a href="/missing">Missing</a>
			<a href="/exists">Exists</a>
			`,
			"/exists": `<p>I exist</p>`,
		};
		({ baseUrl, close } = await startMockServer(mockPages));
		const visited = await runCrawler({ startUrl: baseUrl, logger: testLogger });
		expect(visited.has(`${baseUrl}exists`)).toBe(true);
	});
	it("respects robots.txt disallow", async () => {
		const mockPages = {
			"/": `
			<a href="/public">Public</a>
			<a href="/private">Private</a>
			`,
			"/public": `<p>OK</p>`,
			"/private": `<p>Should not be visited</p>`,
			"/robots.txt": `User-agent: *\nDisallow: /private`,
		};
		({ baseUrl, close } = await startMockServer(mockPages));
		const visited = await runCrawler({ startUrl: baseUrl, logger: testLogger });
		expect(visited.has(`${baseUrl}private`)).toBe(false);
		expect(visited.has(`${baseUrl}public`)).toBe(true);
	});
	it("returns empty when start URL is disallowed", async () => {
		const mockPages = {
			"/": `<p>Forbidden</p>`,
			"/robots.txt": `User-agent: *\nDisallow: /`,
		};
		({ baseUrl, close } = await startMockServer(mockPages));
		const visited = await runCrawler({ startUrl: baseUrl, logger: testLogger });
		expect(visited.size).toBe(0);
	});
});
