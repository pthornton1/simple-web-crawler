import type { Robot } from "robots-parser";
import { consoleLogger, type Logger } from "./crawler/helpers/logger/logger.ts";
import fetchWithRetry from "./crawler/helpers/retry-fetch/fetch-wth-retry.ts";
import runStartup from "./crawler/startup/startup.ts";

const robotsParser = require("robots-parser");

const subDomain = runStartup();
const logger: Logger = consoleLogger;

let robots: Robot | null = null;
try {
	const robotsUrl = `${subDomain}/robots.txt`;
	const res = await fetchWithRetry(robotsUrl, logger);
	const robotsTxt = await res.text();
	robots = robotsParser(robotsUrl, robotsTxt);
} catch (err) {
	// if we fail to fetch robots.txt, we should log the error but continue crawling anyway,
	// as some sites may not have a robots.txt or it may be temporarily unavailable. However, for this example, we'll exit to keep things simple.
	logger.warn("Failed to fetch robots.txt", {
		url: `${subDomain}/robots.txt`,
		err,
	});
}

const vistedUrls = new Set<string>();
const urlQueue: string[] = [subDomain];
vistedUrls.add(subDomain);

logger.info("Crawling started", { subDomain });

while (urlQueue.length > 0) {
	const url = urlQueue.shift();
	if (!url) continue;

	// fetch page
	// hash content and check if it's the same as a previously visited page to avoid duplicates
	// parse links
	// for each link, normalize and check if it's in the same sub domain and not visited
	// if valid, add to queue and visited set
	// ensure we respect robots.txt rules and rate limits
	// run concurrently with a limit on the number of simultaneous fetches
}
