export default function normaliseLinks(links: URL[]) {
	return links.map((link) => {
		link.hash = "";
		return link;
	});
}
