export default function normaliseLinks(links: URL[]) {
	const normalisedSet = new Set<string>();

	for (const link of links) {
		const normalisedUrl = new URL(link.toString());
		normalisedUrl.hash = "";
		normalisedUrl.search = "";

		if (normalisedUrl.pathname.endsWith("/")) {
			normalisedUrl.pathname = normalisedUrl.pathname.slice(0, -1);
		}

		normalisedSet.add(normalisedUrl.toString());
	}

	return Array.from(normalisedSet);
}
