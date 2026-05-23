import { afterEach, describe, expect, it, vi } from "vitest";
import { testLogger } from "../logger/test-logger.ts";
import fetchWithRetry from "./fetch-with-retry.ts";

describe("fetchWithRetry", () => {
	afterEach(() => {
		vi.resetAllMocks();
		vi.unstubAllGlobals();
	});
	it("should fetch successfully on first attempt", async () => {
		const mockResponse = new Response("OK", { status: 200 });
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));
		const url = new URL("https://example.com");
		const res = await fetchWithRetry(url, testLogger);
		expect(res).toBe(mockResponse);
		expect(fetch).toHaveBeenCalledTimes(1);
	});

	it("should retry on failure and eventually succeed", async () => {
		const mockResponse = new Response("OK", { status: 200 });
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockRejectedValueOnce(new Error("Network error"))
				.mockResolvedValueOnce(mockResponse),
		);
		const url = new URL("https://example.com");
		const res = await fetchWithRetry(url, testLogger);
		expect(res).toBe(mockResponse);
		expect(fetch).toHaveBeenCalledTimes(2);
	});

	it("should retry the specified number of times and then throw", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockRejectedValue(new Error("Network error")),
		);
		const url = new URL("https://example.com");
		await expect(fetchWithRetry(url, testLogger, {}, 2)).rejects.toThrow(
			"Network error",
		);
		expect(fetch).toHaveBeenCalledTimes(3);
	});

	it("should not retry on 4xx errors except 429", async () => {
		const mockResponse = new Response("Not Found", { status: 404 });
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));
		const url = new URL("https://example.com");
		const res = await fetchWithRetry(url, testLogger);
		expect(res).toBe(mockResponse);
		expect(fetch).toHaveBeenCalledTimes(1);
	});

	it("should retry on 429 errors", async () => {
		const mockResponse429 = new Response("Too Many Requests", { status: 429 });
		const successResponse = new Response("OK", { status: 200 });
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValueOnce(mockResponse429)
				.mockResolvedValueOnce(successResponse),
		);
		const url = new URL("https://example.com");
		const res = await fetchWithRetry(url, testLogger);
		expect(res).toBe(successResponse);
		expect(fetch).toHaveBeenCalledTimes(2);
	});
	it("applies exponential backoff between retries", async () => {
		vi.useFakeTimers();
		vi.spyOn(Math, "random").mockReturnValue(0);

		const fail = new Response("Service Unavailable", { status: 503 });
		const ok = new Response("OK", { status: 200 });

		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValueOnce(fail)
				.mockResolvedValueOnce(fail)
				.mockResolvedValueOnce(ok),
		);

		const promise = fetchWithRetry(new URL("https://example.com"), testLogger);

		// Attempt 1 fires immediately
		expect(fetch).toHaveBeenCalledTimes(1);

		// Backoff before attempt 2: 2**0 * 100 = 100ms
		await vi.advanceTimersByTimeAsync(99);
		expect(fetch).toHaveBeenCalledTimes(1); // not yet
		await vi.advanceTimersByTimeAsync(1);
		expect(fetch).toHaveBeenCalledTimes(2); // fired at exactly 100ms

		// Backoff before attempt 3: 2**1 * 100 = 200ms
		await vi.advanceTimersByTimeAsync(199);
		expect(fetch).toHaveBeenCalledTimes(2);
		await vi.advanceTimersByTimeAsync(1);
		expect(fetch).toHaveBeenCalledTimes(3);

		const res = await promise;
		expect(res).toBe(ok);
		vi.useRealTimers();
	});
});
