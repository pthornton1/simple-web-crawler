declare module "robots-parser" {
	export interface Robot {
		isAllowed(url: string, ua?: string): boolean | undefined;
		isDisallowed(url: string, ua?: string): boolean | undefined;
		getMatchingLineNumber(url: string, ua?: string): number;
		getCrawlDelay(ua?: string): number | undefined;
		getSitemaps(): string[];
		getPreferredHost(): string | null;
	}

	function robotsParser(url: string, robotstxt: string): Robot;
	export default robotsParser;
}
