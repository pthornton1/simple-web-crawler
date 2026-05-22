import type { Robot } from "robots-parser";

export default function queueLinks(
	links: URL[],
	currentUrl: URL,
	robots: Robot | null,
	visitedUrls: Set<string>,
) {
	if (links.length === 0) {
		return [];
	}
	const linksToQueue: URL[] = [];
	links.filter((link) => {
		if (visitedUrls.has(link.toString())) {
			return false;
		}
		if (link.origin !== currentUrl.origin) {
			return false;
		}
		if (robots?.isDisallowed(link.toString(), "my-crawler")) {
			return false;
		}
		return true;
	});
	return linksToQueue;
}
