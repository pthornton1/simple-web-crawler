export interface Logger {
	debug(msg: string, meta?: Record<string, unknown>): void;
	info(msg: string, meta?: Record<string, unknown>): void;
	warn(msg: string, meta?: Record<string, unknown>): void;
	error(msg: string, meta?: Record<string, unknown>): void;
}

export const consoleLogger: Logger = {
	debug: (msg, meta) => console.debug(msg, meta ?? ""),
	info: (msg, meta) => console.info(msg, meta ?? ""),
	warn: (msg, meta) => console.warn(msg, meta ?? ""),
	error: (msg, meta) => console.error(msg, meta ?? ""),
};
