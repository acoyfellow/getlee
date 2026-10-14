import { Schema } from "effect";
import type { Document, Html, HtmlBuilder } from "foldkit/html";
import { AccountId, type LeeLink, leeLink, MAX_DRAFT_CHARS } from "../../../shared/link";
import { Message } from "../message";
import { type Model, Short } from "../model";
import { EXAMPLES } from "./examples";
import { htmlSnippet, markdownSnippet, problemText } from "./output";
import { qrDataUrl } from "./qr";

type H = HtmlBuilder<Message>;

const isAccountId = Schema.is(AccountId);

export const accountOf = (model: Model): AccountId | null => (isAccountId(model.account) ? model.account : null);

export const linkOf = (model: Model): LeeLink => leeLink(model.prompt, accountOf(model));

const accountProblem = (model: Model): boolean => model.account !== "" && accountOf(model) === null;

const header = (h: H): Html =>
	h.header(
		[h.Class("relative z-10 mx-auto flex h-16 max-w-6xl items-center gap-3 px-5")],
		[
			h.img([h.Src("/brand/cloudflare-cloud.svg"), h.Alt("Cloudflare"), h.Width("44"), h.Height("20")]),
			h.span([h.Class("text-[16px] font-semibold tracking-[-0.01em]")], ["getlee.link"]),
			h.a(
				[h.Href("https://developers.cloudflare.com/agents/"), h.Target("_blank"), h.Rel("noreferrer"), h.Class("ml-auto text-[13px] text-dim hover:text-ink")],
				["What is Agent Lee?"],
			),
		],
	);

const hero = (h: H): Html =>
	h.div(
		[h.Class("max-w-xl pt-10 pb-8 md:pt-20 md:pb-12")],
		[
			h.p([h.Class("mb-4 text-[13px] font-medium tracking-[0.08em] text-flare uppercase")], ["For Cloudflare's Agent Lee"]),
			h.h1([h.Class("text-[40px] leading-[1.05] font-semibold tracking-[-0.03em] md:text-[60px]")], ["Send anyone a prompt for Lee."]),
			h.p(
				[h.Class("mt-5 text-[17px] leading-relaxed text-dim md:text-[19px]")],
				["Write a prompt, copy the link. Whoever opens it lands in the Cloudflare dashboard with your prompt typed into Agent Lee. Nothing runs until they press send."],
			),
		],
	);

const counter = (h: H, model: Model): Html => {
	const over = model.prompt.length > MAX_DRAFT_CHARS;

	return h.span([h.Id("count"), h.Class(`text-[12px] tabular-nums ${over ? "text-bad" : "text-faint"}`)], [`${model.prompt.length.toLocaleString()} / ${MAX_DRAFT_CHARS.toLocaleString()}`]);
};

const exampleChip = (h: H, label: string, text: string): Html =>
	h.button(
		[
			h.Type("button"),
			h.Class("rounded-full border border-line-strong bg-panel px-3 py-1 text-[13px] text-dim transition-colors hover:border-flare-line hover:text-ink"),
			h.OnClick(Message.ClickedExample({ text })),
		],
		[label],
	);

const composer = (h: H, model: Model): Html =>
	h.section(
		[h.Class("rounded-2xl border border-line bg-panel/90 p-4 shadow-2xl shadow-black/40 backdrop-blur md:p-5"), h.AriaLabel("Prompt")],
		[
			h.div(
				[h.Class("mb-2 flex items-baseline justify-between")],
				[h.label([h.For("prompt"), h.Class("text-[13px] font-medium text-dim")], ["Your prompt"]), counter(h, model)],
			),
			h.textarea(
				[
					h.Id("prompt"),
					h.Rows(7),
					h.Placeholder("Help me deploy my first Worker"),
					h.Value(model.prompt),
					h.Spellcheck(true),
					h.Class("w-full resize-y rounded-xl border border-line-strong bg-bg px-4 py-3 text-[16px] leading-relaxed text-ink outline-none placeholder:text-faint focus:border-flare"),
					h.OnInput((value) => Message.UpdatedPrompt({ value })),
				]),
			h.div([h.Class("mt-3 flex flex-wrap gap-2")], EXAMPLES.map((example) => exampleChip(h, example.label, example.text))),
			h.details(
				[h.Class("mt-4 text-[13px] text-dim")],
				[
					h.summary([h.Class("cursor-pointer select-none hover:text-ink")], ["Open in a specific account (optional)"]),
					h.div(
						[h.Class("mt-2 grid gap-1.5")],
						[
							h.input([
								h.Id("account"),
								h.Value(model.account),
								h.Placeholder("32-character account ID"),
								h.Spellcheck(false),
								h.Class(`w-full rounded-lg border bg-bg px-3 py-2 font-mono text-[13px] text-ink outline-none placeholder:text-faint focus:border-flare ${accountProblem(model) ? "border-bad" : "border-line-strong"}`),
								h.OnInput((value) => Message.UpdatedAccount({ value })),
							]),
							h.span(
								[h.Class(accountProblem(model) ? "text-bad" : "text-faint")],
								[accountProblem(model) ? "That is not an account ID. The link will ask the reader to pick an account." : "Leave empty for public links. The reader picks their own account."],
							),
						],
					),
				],
			),
		],
	);

const copyButton = (h: H, model: Model, key: string, label: string, text: string, primary: boolean): Html =>
	h.button(
		[
			h.Type("button"),
			h.Id(`copy-${key}`),
			h.Class(
				primary
					? "h-10 rounded-lg bg-flare px-4 text-[14px] font-semibold text-black transition-opacity hover:opacity-90"
					: "h-10 rounded-lg border border-line-strong px-4 text-[14px] font-medium text-ink transition-colors hover:bg-raised",
			),
			h.OnClick(Message.ClickedCopy({ key, text })),
		],
		[model.copiedKey === key ? "Copied" : label],
	);

const shortButton = (h: H, model: Model, url: string, label: string): Html =>
	h.button(
		[
			h.Type("button"),
			h.Id("shorten"),
			h.Class("h-10 rounded-lg border border-line-strong px-4 text-[14px] font-medium text-ink transition-colors hover:bg-raised disabled:opacity-50"),
			h.Disabled(model.short._tag === "Making"),
			h.OnClick(Message.ClickedShorten({ prompt: model.prompt, account: accountOf(model), forUrl: url })),
		],
		[label],
	);

const SHORT_NOTE = "Short links store your prompt on getlee.link so the code can find it. Long links store nothing.";

const shortRow = (h: H, model: Model, url: string): Html =>
	h.div(
		[h.Class("mt-4 grid gap-2 border-t border-flare-line/60 pt-4")],
		Short.match(model.short, {
			Idle: () => [h.div([h.Class("flex flex-wrap items-center gap-3")], [shortButton(h, model, url, "Make a short link"), h.span([h.Class("text-[12px] text-faint")], [SHORT_NOTE])])],
			Making: () => [h.div([h.Class("flex flex-wrap items-center gap-3")], [shortButton(h, model, url, "Making…"), h.span([h.Class("text-[12px] text-faint")], [SHORT_NOTE])])],
			Failed: ({ reason }) => [h.div([h.Class("flex flex-wrap items-center gap-3")], [shortButton(h, model, url, "Try again"), h.span([h.Id("short-error"), h.Class("text-[12px] text-bad")], [reason])])],
			Made: ({ url: short }) => [
				h.div(
					[h.Class("flex flex-wrap items-center gap-2")],
					[
						h.input([h.Id("short"), h.Value(short), h.Readonly(true), h.Class("h-10 min-w-0 flex-1 rounded-lg border border-line-strong bg-bg px-3 font-mono text-[14px] text-ink outline-none")]),
						copyButton(h, model, "short", "Copy short link", short, true),
					],
				),
				h.span([h.Class("text-[12px] text-faint")], [SHORT_NOTE]),
			],
		}),
	);

const qrBlock = (h: H, url: string): Array<Html> => {
	const source = qrDataUrl(url);

	return source === null
		? [h.p([h.Class("text-[12px] text-faint")], ["This prompt is too long for a QR code."])]
		: [h.img([h.Id("qr"), h.Src(source), h.Alt("QR code for the Lee link"), h.Class("size-32 rounded-lg bg-white p-1 [image-rendering:pixelated]")])];
};

const readyCard = (h: H, model: Model, url: string): Html =>
	h.section(
		[h.Id("result"), h.Class("rounded-2xl border border-flare-line bg-flare-soft/60 p-4 md:p-5"), h.AriaLabel("Your link"), h.AriaLive("polite")],
		[
			h.p([h.Class("mb-2 text-[13px] font-medium text-flare")], ["Your link is ready"]),
			h.input([h.Id("link"), h.Value(url), h.Readonly(true), h.Class("w-full truncate rounded-lg border border-line-strong bg-bg px-3 py-2 font-mono text-[12px] text-dim outline-none")]),
			h.div(
				[h.Class("mt-3 flex flex-wrap items-center gap-2")],
				[
					copyButton(h, model, "link", "Copy link", url, true),
					h.a(
						[h.Id("try"), h.Href(url), h.Target("_blank"), h.Rel("noopener"), h.Class("flex h-10 items-center rounded-lg border border-line-strong px-4 text-[14px] font-medium hover:bg-raised")],
						["Try it"],
					),
					copyButton(h, model, "markdown", "Markdown", markdownSnippet(url), false),
					copyButton(h, model, "html", "HTML button", htmlSnippet(url), false),
				],
			),
			shortRow(h, model, url),
			...(model.copyFailed ? [h.p([h.Class("mt-2 text-[12px] text-bad")], ["The browser blocked the clipboard. Select the link and copy it by hand."])] : []),
			h.div([h.Class("mt-4 flex items-end gap-4")], [...qrBlock(h, model.short._tag === "Made" ? model.short.url : url), h.p([h.Class("pb-1 text-[12px] leading-relaxed text-faint")], ["Scan to open on another device. Good for slides and posters."])]),
		],
	);

const waitingCard = (h: H, link: LeeLink): Html =>
	h.section(
		[h.Id("result"), h.Class("grid min-h-40 place-items-center rounded-2xl border border-dashed border-line-strong p-5 text-center"), h.AriaLive("polite")],
		[h.p([h.Class(`text-[14px] ${link._tag === "Problem" && link.problem === "too-long" ? "text-bad" : "text-faint"}`)], [problemText(link)])],
	);

const preview = (h: H, model: Model): Html =>
	h.section(
		[h.Class("rounded-2xl border border-line bg-panel/90 p-4 md:p-5"), h.AriaLabel("What the reader sees")],
		[
			h.p([h.Class("mb-3 text-[13px] font-medium text-dim")], ["What the reader sees in Lee"]),
			h.div(
				[h.Class("rounded-xl border border-line bg-bg p-3")],
				[
					h.p([h.Class("mb-2 rounded-md bg-raised px-2.5 py-1.5 text-[12px] text-dim")], ["Draft opened from a link. Review before sending."]),
					h.p([h.Id("preview"), h.Class("min-h-12 text-[14px] leading-relaxed break-words whitespace-pre-wrap text-ink")], [model.prompt.trim() === "" ? "…" : model.prompt]),
					h.div([h.Class("mt-2 flex justify-end")], [h.span([h.Class("rounded-md bg-raised px-2.5 py-1 text-[12px] text-faint")], ["Send ↵"])]),
				],
			),
		],
	);

const FACTS: ReadonlyArray<readonly [string, string]> = [
	["Nothing runs by itself", "Lee never sends the prompt for the reader. They see it, can change it, and press send."],
	["Your prompt stays in the link", "A long link keeps the prompt after the #, which browsers never send to a server. Only short links store it."],
	["It survives login", "If the reader is signed out, the dashboard keeps the draft through sign-in for up to ten minutes."],
	["It cannot reach further", "A link carries plain text only. It cannot pick tools, change permissions, or act for the reader."],
];

const facts = (h: H): Html =>
	h.section(
		[h.Class("mx-auto grid max-w-6xl gap-px overflow-hidden rounded-2xl border border-line bg-line px-0 sm:grid-cols-2 lg:grid-cols-4"), h.AriaLabel("How it works")],
		FACTS.map(([title, body]) =>
			h.div([h.Class("bg-panel p-5")], [h.h2([h.Class("text-[15px] font-semibold")], [title]), h.p([h.Class("mt-1.5 text-[14px] leading-relaxed text-dim")], [body])]),
		),
	);

const footer = (h: H): Html =>
	h.footer(
		[h.Class("mx-auto max-w-6xl px-5 py-10 text-[13px] text-faint")],
		["A community tool for Cloudflare's Agent Lee. Links open dash.cloudflare.com. ", h.a([h.Href("https://github.com/acoyfellow/getlee"), h.Class("underline underline-offset-2 hover:text-ink")], ["Source"])],
	);

export const view = (model: Model, h: H): Document => {
	const link = linkOf(model);

	return {
		title: "getlee.link: send anyone a prompt for Agent Lee",
		body: h.div(
			[h.Class("min-h-full")],
			[
				h.div(
					[h.Class("hero-glow")],
					[
						header(h),
						h.main(
							[h.Class("mx-auto max-w-6xl px-5 pb-12")],
							[
								hero(h),
								h.div(
									[h.Class("grid items-start gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]")],
									[composer(h, model), h.div([h.Class("grid content-start gap-4")], [link._tag === "Link" ? readyCard(h, model, link.url) : waitingCard(h, link), preview(h, model)])],
								),
							],
						),
					],
				),
				h.div([h.Class("px-5")], [facts(h)]),
				footer(h),
			],
		),
	};
};
