import { describe, expect, it, vi } from "vitest";
import { consoleLogger } from "./logger.ts";

describe("consoleLogger", () => {
	it("should have debug, info, warn, and error methods", () => {
		expect(typeof consoleLogger.debug).toBe("function");
		expect(typeof consoleLogger.info).toBe("function");
		expect(typeof consoleLogger.warn).toBe("function");
		expect(typeof consoleLogger.error).toBe("function");
	});

	describe.each([
		["debug", "Debug message"],
		["info", "Info message"],
		["warn", "Warn message"],
		["error", "Error message"],
	] as const)("consoleLogger.%s", (method, message) => {
		it(`should log messages to the console using ${method}`, () => {
			const spy = vi.spyOn(console, method).mockImplementation(() => {});
			consoleLogger[method](message);
			expect(spy).toHaveBeenCalledWith(message, "");
			spy.mockRestore();
		});

		it(`should log messages with metadata using ${method}`, () => {
			const spy = vi.spyOn(console, method).mockImplementation(() => {});
			const meta = { key: "value" };
			consoleLogger[method](message, meta);
			expect(spy).toHaveBeenCalledWith(message, meta);
			spy.mockRestore();
		});
	});
});
