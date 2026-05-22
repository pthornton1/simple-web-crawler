import type { Logger } from "../helpers/logger/logger.ts";
import fetchWithRetry from "../helpers/retry-fetch/fetch-with-retry.ts";

export default async function getHTMLFromLink(url: URL, logger: Logger) {
	try {
		const res = await fetchWithRetry(url, logger);
		const contentType = res.headers.get("content-type") || "";
		if (!contentType.includes("text/html")) {
			throw new Error(`Content-Type is not text/html: ${contentType}`);
		}
		const html = await res.text();
		return html;
	} catch (err) {
		throw new Error(`Failed to fetch HTML from ${url}: ${err}`);
	}
}
