import type { Logger } from "../logger/logger.ts";

export default async function fetchWithRetry(
	url: URL | string,
	logger: Logger,
	fetctOptions: RequestInit = {},
	retries = 2,
	backoffBase = 100,
) {
	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			const res = await fetch(url, {
				...fetctOptions,
				signal: AbortSignal.timeout(5000),
			});
			if (res.ok) return res;
			if (res.status >= 400 && res.status < 500 && res.status !== 429) {
				return res;
			}
			throw new Error(`HTTP ${res.status}`);
		} catch (err) {
			if (attempt === retries) {
				logger.error("fetch failed", {
					url,
					attempt,
					err: err instanceof Error ? err.message : String(err),
				});
				throw err;
			}
			const delay = backoffBase * 2 ** attempt + Math.random() * 100;

			await new Promise((r) => setTimeout(r, delay));
		}
	}
	throw new Error("Unreachable code");
}
