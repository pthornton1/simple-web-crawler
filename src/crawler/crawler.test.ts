import { afterEach, beforeEach, describe, expect, it } from "vitest";
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
});
