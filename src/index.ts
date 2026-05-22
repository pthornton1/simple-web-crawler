import PQueue from "p-queue";
import fetchRobots from "./crawler/fetch-robots/fetch-robots.ts";
import getHTMLFromLink from "./crawler/fetch-url/get-html-from-link.ts";
import { consoleLogger, type Logger } from "./crawler/helpers/logger/logger.ts";
import normaliseLinks from "./crawler/normalise-links/normalise-links.ts";
import parseHTML from "./crawler/parse-html/parse-html.ts";
import queueLinks from "./crawler/queue-links/queue-links.ts";
import runStartup from "./crawler/startup/startup.ts";

const logger: Logger = consoleLogger;

const subDomain = runStartup(logger);
const robots = await fetchRobots(subDomain, logger);

if (robots?.isDisallowed(subDomain.toString(), "my-crawler")) {
	logger.info("Crawling disallowed by robots.txt", { url: subDomain });
	process.exit(0);
}

const vistedUrls = new Set<URL>();
const urlQueue = new PQueue({
	concurrency: 1,
	interval: robots?.getCrawlDelay("my-crawler") ?? 1000,
});

urlQueue.add(() => crawl(subDomain));

async function crawl(url: URL) {
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
