import { vi } from "vitest";
import type { Logger } from "./logger.ts";

export const testLogger: Logger = {
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
	debug: vi.fn(),
};
