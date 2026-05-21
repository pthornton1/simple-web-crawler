export default function runStartup() {
	const url = process.argv[2];
	if (!url) {
		console.error("Please provide a URL to crawl as a command-line argument.");
		process.exit(1);
	}

	return url;
}
