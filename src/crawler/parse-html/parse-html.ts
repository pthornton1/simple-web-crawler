import * as cheerio from "cheerio";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export default function parseHTML(html: string, url: URL | string) {
	try {
		const $ = cheerio.load(html);
		const links: URL[] = [];

		$("a[href]").each((_, element) => {
			const href = $(element).attr("href");
			if (!href) return;

			try {
				const newUrl = new URL(href, url);
				if (!ALLOWED_PROTOCOLS.has(newUrl.protocol)) return;
				links.push(newUrl);
			} catch {
				return;
			}
		});
		return links;
	} catch (err) {
		throw new Error(`Failed to parse HTML from ${url}: ${err}`, { cause: err });
	}
}
