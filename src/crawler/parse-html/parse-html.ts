import * as cheerio from "cheerio";

export default function parseHTML(html: string, url: URL) {
	try {
		const $ = cheerio.load(html);
		const links: URL[] = [];

		$("a[href]").each((_, element) => {
			const href = $(element).attr("href");
			if (!href) return;

			links.push(new URL(href, url));
		});
		return links;
	} catch (err) {
		throw new Error(`Failed to parse HTML from ${url}: ${err}`);
	}
}
