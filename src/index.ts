import { writeFile } from "node:fs/promises";
import runCrawler from "./crawler/crawler.ts";
import { consoleLogger } from "./crawler/helpers/logger/logger.ts";
import runStartup from "./crawler/startup/startup.ts";

const startUrl = runStartup(consoleLogger);
const visited = await runCrawler({ startUrl, logger: consoleLogger });

await writeFile(
	"output/crawl-result.json",
	JSON.stringify(Object.fromEntries(visited), null, 2),
);

consoleLogger.info(`Crawl complete, visited ${visited.size} pages`);
consoleLogger.info("Output written to output/crawl-result.json");
