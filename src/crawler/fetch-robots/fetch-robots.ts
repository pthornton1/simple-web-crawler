import type { Robot } from "robots-parser";
import robotsParser from "robots-parser";
import type { Logger } from "../helpers/logger/logger.ts";
import fetchWithRetry from "../helpers/retry-fetch/fetch-with-retry.ts";

export default async function fetchRobots(subDomain: URL, logger: Logger) {
	let robots: Robot | null = null;
	try {
		const robotsUrl = new URL("robots.txt", subDomain);
		const res = await fetchWithRetry(robotsUrl, logger);
		if (res.ok) {
			const robotsTxt = await res.text();
			robots = robotsParser(robotsUrl.toString(), robotsTxt);
		}
	} catch (err) {
		logger.warn("Failed to fetch robots.txt", {
			url: `${subDomain}/robots.txt`,
			err,
		});
	}
	return robots;
}
