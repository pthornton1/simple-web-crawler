import PQueue from "p-queue";
import fetchRobots from "./fetch-robots/fetch-robots.ts";
import getHTMLFromLink from "./fetch-url/get-html-from-link.ts";
import type { Logger } from "./helpers/logger/logger.ts";
import normaliseLinks from "./normalise-links/normalise-links.ts";
import parseHTML from "./parse-html/parse-html.ts";
import queueLinks from "./queue-links/queue-links.ts";

export interface CrawlOptions {
	startUrl: URL;
	logger: Logger;
	userAgent?: string;
	concurrency?: number;
	fetchRobotsFn?: typeof fetchRobots;
	getHTMLFn?: typeof getHTMLFromLink;
}

export default async function runCrawler(
	opts: CrawlOptions,
): Promise<Map<string, string[]>> {
	const {
		startUrl,
		logger,
		userAgent = "my-crawler",
		concurrency = 1,
		fetchRobotsFn = fetchRobots,
		getHTMLFn = getHTMLFromLink,
	} = opts;

	const robots = await fetchRobotsFn(startUrl, logger);

	if (robots?.isDisallowed(startUrl.toString(), userAgent)) {
		logger.info("Crawling disallowed by robots.txt", { url: startUrl });
		return new Map();
	}

	const visitedUrls = new Map<string, string[]>();
	const urlQueue = new PQueue({
		concurrency,
		interval: robots?.getCrawlDelay(userAgent) ?? 1000,
	});

	async function crawl(url: URL) {
		try {
			const html = await getHTMLFn(url, logger);
			const links = parseHTML(html, url);
			const normalisedLinks = normaliseLinks(links);
			visitedUrls.set(
				url.toString(),
				normalisedLinks.map((link) => link.toString()),
			);
			const linksToQueue = queueLinks(
				normalisedLinks,
				url,
				robots,
				visitedUrls,
			);
			urlQueue.addAll(linksToQueue.map((link) => () => crawl(link)));
		} catch (err) {
			logger.error("Failed to crawl URL", { url, err });
		}
	}

	urlQueue.add(() => crawl(startUrl));
	await urlQueue.onIdle();
	return visitedUrls;
}
