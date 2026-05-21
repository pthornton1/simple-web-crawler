import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import runStartup from "./startup.ts";

describe("runStartup", () => {
	let exitSpy: ReturnType<typeof vi.spyOn>;
	let originalArgv: string[];

	beforeEach(() => {
		originalArgv = process.argv;
		process.argv = ["node", "script.ts"]; // clean slate
		exitSpy = vi.spyOn(process, "exit").mockImplementation((code) => {
			throw new Error(`process.exit called with ${code}`);
		});
	});

	afterEach(() => {
		process.argv = originalArgv;
		vi.restoreAllMocks();
	});

	it("returns the URL provided as a command-line argument", () => {
		process.argv = ["node", "script.ts", "https://example.com"];
		expect(runStartup()).toBe("https://example.com");
	});

	it("exits with code 1 if no URL is provided", () => {
		expect(() => runStartup()).toThrow("process.exit called with 1");
		expect(exitSpy).toHaveBeenCalledWith(1);
	});
});
