import { describe, expect, it } from "vitest";
import normaliseLinks from "./normalise-links.ts";

describe("normaliseLinks", () => {
	it("should handle an empty array", () => {
		const links: URL[] = [];
		const normalised = normaliseLinks(links);
		expect(normalised).toEqual([]);
	});
	it("should convert the domain to lowercase but leave the path in the original case", () => {
		const links = [new URL("HTTP://EXAMPLE.COM/PAGE")];
		const normalised = normaliseLinks(links);
		expect(normalised).toEqual([new URL("http://example.com/PAGE/")]);
	});
	it("should normalise links by removing fragments and query parameters", () => {
		const links = [
			new URL("http://example.com/page?query=123#section"),
			new URL("http://example.com/page#section"),
			new URL("http://example.com/page?query=123"),
		];
		const normalised = normaliseLinks(links);
		expect(normalised).toEqual([new URL("http://example.com/page/")]);
	});

	it("should ensure all urls have trailing slashes, dropping duplicates", () => {
		const links = [
			new URL("http://example.com/page"),
			new URL("http://example.com/page/"),
		];
		const normalised = normaliseLinks(links);
		expect(normalised).toEqual([new URL("http://example.com/page/")]);
	});

	it("should remove duplicates", () => {
		const links = [
			new URL("http://example.com/page"),
			new URL("http://example.com/page/"),
			new URL("http://example.com/page?query=123"),
			new URL("http://example.com/page#section"),
		];
		const normalised = normaliseLinks(links);
		expect(normalised).toEqual([new URL("http://example.com/page/")]);
	});

	it("should handle a mix of normal and abnormal URLs", () => {
		const links = [
			new URL("http://example.com/page"),
			new URL("http://example.com/page?query=123"),
			new URL("http://example.com/page#section"),
			new URL("http://example.com/other-page"),
		];
		const normalised = normaliseLinks(links);
		expect(normalised).toEqual([
			new URL("http://example.com/page/"),
			new URL("http://example.com/other-page/"),
		]);
	});
});
