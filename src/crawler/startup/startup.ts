import type { Logger } from "../helpers/logger/logger.ts";

export default function runStartup(logger: Logger): URL {
	const url = process.argv[2];
	if (!url) {
		logger.error("No url provided as an argument.");
		process.exit(1);
	}

	return new URL(url);
}
