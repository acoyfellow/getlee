import { describe, expect, test } from "vitest";
import { draftFromHash, leeLink, MAX_DRAFT_CHARS, promptFromShareHash, shareHash } from "../shared/link";

const ACCOUNT = "0123456789abcdef0123456789abcdef";

const urlOf = (prompt: string, account: string | null = null): string => {
	const link = leeLink(prompt, account);
	if (link._tag !== "Link") throw new Error(`expected a link, got ${link.problem}`);

	return link.url;
};

describe("the Lee link", () => {
	test("a public link opens the dashboard root and carries the prompt after the hash", () => {
		expect(urlOf("Deploy a Worker")).toBe("https://dash.cloudflare.com/#lee-draft=Deploy%20a%20Worker");
	});

	test("an account link opens that account", () => {
		expect(urlOf("hi", ACCOUNT)).toBe(`https://dash.cloudflare.com/${ACCOUNT}#lee-draft=hi`);
	});

	test("every character the dashboard decodes comes back exactly", () => {
		const prompt = "Use #hash & ?q=1 + 100% /path é 🚀\nline two";
		const url = urlOf(prompt);
		expect(draftFromHash(url.slice(url.indexOf("#")))).toBe(prompt);
	});

	test("nothing in the prompt can escape the fragment", () => {
		const url = urlOf("a#b?c&d=e /f");
		expect(url.split("#").length).toBe(2);
		expect(new URL(url).search).toBe("");
	});

	test("an empty or blank prompt makes no link", () => {
		expect(leeLink("", null)._tag).toBe("Problem");
		expect(leeLink("  \n\t ", null)).toEqual({ _tag: "Problem", problem: "empty", chars: 5 });
	});

	test("exactly 2000 characters is allowed and 2001 is refused, matching the dashboard", () => {
		expect(leeLink("x".repeat(MAX_DRAFT_CHARS), null)._tag).toBe("Link");
		expect(leeLink("x".repeat(MAX_DRAFT_CHARS + 1), null)).toEqual({ _tag: "Problem", problem: "too-long", chars: 2001 });
	});

	test("the page's own share hash round-trips and is capped", () => {
		expect(promptFromShareHash(shareHash("a & b #c"))).toBe("a & b #c");
		expect(promptFromShareHash("#p=%E0%A4%A")).toBeNull();
		expect(promptFromShareHash(`#p=${"y".repeat(3000)}`)?.length).toBe(MAX_DRAFT_CHARS);
	});
});
