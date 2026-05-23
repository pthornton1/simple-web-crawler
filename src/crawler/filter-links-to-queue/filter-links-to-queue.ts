import type { Robot } from "robots-parser";

export default function filterLinksToQueue(
	links: string[],
	currentUrl: string | URL,
	robots: Robot | null,
	queuedUrls: Set<string>,
	userAgent: string,
) {
	if (links.length === 0) {
		return [];
	}
	const linksToQueue = links.filter((link) => {
		if (queuedUrls.has(link)) {
			return false;
		}
		if (new URL(link).origin !== new URL(currentUrl).origin) {
			return false;
		}
		if (robots?.isDisallowed(link.toString(), userAgent)) {
			return false;
		}
		return true;
	});
	return linksToQueue;
}
