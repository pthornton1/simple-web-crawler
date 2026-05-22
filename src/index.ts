import PQueue from "p-queue";
import type { Robot } from "robots-parser";
import robotsParser from "robots-parser";
import getHTMLFromLink from "./crawler/fetch-url/get-html-from-link.ts";
import { consoleLogger, type Logger } from "./crawler/helpers/logger/logger.ts";
import fetchWithRetry from "./crawler/helpers/retry-fetch/fetch-wth-retry.ts";
import normaliseLinks from "./crawler/normalise-links/normalise-links.ts";
import parseHTML from "./crawler/parse-html/parse-html.ts";
import queueLinks from "./crawler/queue-links/queue-links.ts";
import runStartup from "./crawler/startup/startup.ts";

const subDomain = runStartup();
const logger: Logger = consoleLogger;

try {
	const robotsUrl = new URL("robots.txt", subDomain);
	const res = await fetchWithRetry(robotsUrl, logger);
	const robotsTxt = await res.text();
	const robots = robotsParser(robotsUrl.toString(), robotsTxt);
} catch (err) {
	// if we fail to fetch robots.txt, we should log the error but continue crawling anyway,
	// as some sites may not have a robots.txt or it may be temporarily unavailable. However, for this example, we'll exit to keep things simple.
	logger.warn("Failed to fetch robots.txt", {
		url: `${subDomain}/robots.txt`,
		err,
	});
}

const vistedUrls = new Set<URL>();
const urlQueue = new PQueue({ concurrency: 1 });

urlQueue.add(() => crawl(subDomain));

async function crawl(url: URL) {
	logger.debug("Crawling URL", { url });
	vistedUrls.add(url);

	try {
		const html = await getHTMLFromLink(url, logger);
		const links = parseHTML(html, url);
		const normalisedLinks = normaliseLinks(links);
		console.debug("Found links", { url, links: normalisedLinks });
		const linksToQueue = queueLinks(normalisedLinks);
		urlQueue.addAll(linksToQueue.map((link: URL) => () => crawl(link)));
	} catch (err) {
		logger.error("Failed to crawl URL", { url, err });
	}
}
