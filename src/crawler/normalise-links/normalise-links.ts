export default function normaliseLinks(links: URL[]) {
	const normalisedSet = new Set<string>();

	for (const link of links) {
		const normalisedUrl = new URL(link.toString());
		normalisedUrl.hash = ""; // Remove fragment
		normalisedUrl.search = ""; // Remove query parameters

		// Ensure trailing slash consistency
		if (!normalisedUrl.pathname.endsWith("/")) {
			normalisedUrl.pathname += "/";
		}

		normalisedSet.add(normalisedUrl.toString());
	}

	return Array.from(normalisedSet).map((urlStr) => new URL(urlStr));
}
