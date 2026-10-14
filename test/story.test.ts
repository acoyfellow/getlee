import { Command, given, message, model, story } from "foldkit/story";
import { describe, expect, test } from "vitest";
import { ClearCopied, CopyText, MakeShort, SaveShareHash } from "../client/src/command";
import { initialModel } from "../client/src/main";
import { Message } from "../client/src/message";
import { update } from "../client/src/update";
import { accountOf, linkOf } from "../client/src/view";

const blank = initialModel({ prompt: "", page: "make" });

describe("making a link", () => {
	test("typing a prompt makes a link and saves the prompt in the page URL", () => {
		story(
			update,
			given(blank),
			message(Message.UpdatedPrompt({ value: "Audit my DNS" })),
			Command.resolve(SaveShareHash, Message.SavedShareHash()),
			model((current) => {
				expect(linkOf(current)).toEqual({ _tag: "Link", url: "https://dash.cloudflare.com/#lee-draft=Audit%20my%20DNS", chars: 12 });
			}),
		);
	});

	test("an example fills the prompt", () => {
		story(
			update,
			given(blank),
			message(Message.ClickedExample({ text: "Set up R2" })),
			Command.resolve(SaveShareHash, Message.SavedShareHash()),
			model((current) => expect(current.prompt).toBe("Set up R2")),
		);
	});

	test("a bad account ID falls back to the account picker instead of a broken link", () => {
		story(
			update,
			given({ ...blank, prompt: "hi" }),
			message(Message.UpdatedAccount({ value: "not-an-account" })),
			model((current) => {
				expect(accountOf(current)).toBeNull();
				expect(linkOf(current)).toEqual({ _tag: "Link", url: "https://dash.cloudflare.com/#lee-draft=hi", chars: 2 });
			}),
		);
	});

	test("an account ID is trimmed and lower-cased", () => {
		story(
			update,
			given({ ...blank, prompt: "hi" }),
			message(Message.UpdatedAccount({ value: "  0123456789ABCDEF0123456789ABCDEF " })),
			model((current) => expect(accountOf(current)).toBe("0123456789abcdef0123456789abcdef")),
		);
	});
});

describe("copying", () => {
	test("a copy marks the button, then the mark expires", () => {
		story(
			update,
			given({ ...blank, prompt: "hi" }),
			message(Message.ClickedCopy({ key: "link", text: "u" })),
			Command.resolve(CopyText, Message.FinishedCopy({ key: "link", ok: true })),
			model((current) => expect(current.copiedKey).toBe("link")),
			Command.resolve(ClearCopied, Message.ExpiredCopied({ key: "link" })),
			model((current) => expect(current.copiedKey).toBe("")),
		);
	});

	test("a blocked clipboard tells the reader to copy by hand", () => {
		story(
			update,
			given(blank),
			message(Message.ClickedCopy({ key: "link", text: "u" })),
			Command.resolve(CopyText, Message.FinishedCopy({ key: "link", ok: false })),
			model((current) => expect(current.copyFailed).toBe(true)),
		);
	});
});

describe("short links", () => {
	test("a short link replaces the panel only for the link it was made for", () => {
		const url = "https://dash.cloudflare.com/#lee-draft=hi";
		story(
			update,
			given({ ...blank, prompt: "hi" }),
			message(Message.ClickedShorten({ prompt: "hi", account: null, forUrl: url })),
			Command.resolve(MakeShort, Message.MadeShort({ forUrl: url, url: "https://getlee.link/s/abc2345" })),
			model((current) => expect(current.short).toEqual({ _tag: "Made", forUrl: url, url: "https://getlee.link/s/abc2345" })),
		);
	});

	test("editing the prompt drops an old short link so it never points at stale text", () => {
		story(
			update,
			given({ ...blank, prompt: "hi", short: { _tag: "Made", forUrl: "x", url: "https://getlee.link/s/abc2345" } }),
			message(Message.UpdatedPrompt({ value: "hi there" })),
			Command.resolve(SaveShareHash, Message.SavedShareHash()),
			model((current) => expect(current.short._tag).toBe("Idle")),
		);
	});

	test("a late answer for an old prompt is ignored", () => {
		story(
			update,
			given({ ...blank, prompt: "new" }),
			message(Message.MadeShort({ forUrl: "old", url: "https://getlee.link/s/abc2345" })),
			model((current) => expect(current.short._tag).toBe("Idle")),
		);
	});
});
