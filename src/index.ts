import runStartup from "./crawler/startup.ts";

const subDomain = runStartup();

fetch(`${subDomain}/robots.txt`)
	.then((response) => {
		if (response.ok) {
			return response.text();
		} else {
			throw new Error(
				`Failed to fetch robots.txt: ${response.status} ${response.statusText}`,
			);
		}
	})
	.then((robotsTxt) => {
		console.log(`robots.txt for ${subDomain}:\n${robotsTxt}`);
	})
	.catch((error) => {
		console.error(`Error fetching robots.txt: ${error.message}`);
	});
