import { describe, expect, test } from "vitest";
import { GALLERY, GALLERY_SETS, galleryPath, galleryPrompt } from "../shared/gallery";
import { leeLink, MAX_DRAFT_CHARS } from "../shared/link";
import { pageOf } from "../client/src/main";

describe("prompt gallery", () => {
	test("holds both tweeted sets, 25 prompts, each a valid Lee link", () => {
		expect(GALLERY).toHaveLength(25);
		for (const name of GALLERY_SETS) expect(GALLERY.some((item) => item.set === name)).toBe(true);
		for (const item of GALLERY) {
			expect(item.prompt.length).toBeLessThanOrEqual(MAX_DRAFT_CHARS);
			expect(leeLink(item.prompt, null)._tag).toBe("Link");
		}
	});

	test("slugs are unique and URL safe", () => {
		const slugs = GALLERY.map((item) => item.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
		for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
	});

	test("a gallery path finds its prompt", () => {
		expect(galleryPath("cpu-burn")).toBe("/g/cpu-burn");
		expect(galleryPrompt("cpu-burn")?.prompt).toContain("Top 10 Workers by CPU");
		expect(galleryPrompt("nope")).toBeUndefined();
	});

	test("paths pick the page", () => {
		expect(pageOf("/")).toBe("make");
		expect(pageOf("/gallery")).toBe("gallery");
		expect(pageOf("/stats")).toBe("stats");
	});
});
