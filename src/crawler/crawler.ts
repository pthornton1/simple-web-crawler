import PQueue from "p-queue";
import fetchHTML from "./fetch-html/fetch-html.ts";
import fetchRobots from "./fetch-robots/fetch-robots.ts";
import filterLinksToQueue from "./filter-links-to-queue/filter-links-to-queue.ts";
import type { Logger } from "./helpers/logger/logger.ts";
import normaliseLinks from "./normalise-links/normalise-links.ts";
import parseHTML from "./parse-html/parse-html.ts";

export interface CrawlOptions {
	startUrl: URL;
	logger: Logger;
	userAgent?: string;
	concurrency?: number;
	verbose?: boolean;
}

export default async function runCrawler(
	opts: CrawlOptions,
): Promise<Map<string, string[]>> {
	const {
		startUrl,
		logger,
		userAgent = "phil-crawler/0.1 (+https://github.com/pthornton1/simple-web-crawler)",
		concurrency = 1000,
		verbose = false,
	} = opts;

	const robots = await fetchRobots(startUrl, logger);

	if (robots?.isDisallowed(startUrl.toString(), userAgent)) {
		logger.info("Crawling disallowed by robots.txt", { url: startUrl });
		return new Map();
	}

	const visitedUrls = new Map<string, string[]>();
	const queuedUrls = new Set<string>();
	const urlQueue = new PQueue({
		concurrency,
		interval: robots?.getCrawlDelay(userAgent) ?? 1000,
		intervalCap: robots?.getCrawlDelay(userAgent) ? 1 : Infinity,
	});

	async function crawl(url: string) {
		if (verbose) {
			logger.info(`crawling page ${url}`);
		}
		try {
			const html = await fetchHTML(url, logger, userAgent);
			const links = parseHTML(html, url);
			const normalisedLinks = normaliseLinks(links);
			visitedUrls.set(url, normalisedLinks);
			const linksToQueue = filterLinksToQueue(
				normalisedLinks,
				url,
				robots,
				queuedUrls,
				userAgent,
			);
			for (const link of linksToQueue) {
				queuedUrls.add(link);
			}
			urlQueue.addAll(linksToQueue.map((link) => () => crawl(link)));
		} catch (err) {
			logger.error("Failed to crawl URL", { url, err });
		}
	}
	const normalisedStartUrl = normaliseLinks([startUrl]);
	queuedUrls.add(normalisedStartUrl[0] as string);
	urlQueue.add(() => crawl(startUrl.toString()));
	await urlQueue.onIdle();
	return visitedUrls;
}
