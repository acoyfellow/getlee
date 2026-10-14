import type { Html, HtmlBuilder } from "foldkit/html";
import { GALLERY, GALLERY_SETS, type GalleryPrompt, type GallerySet, galleryPath } from "../../../shared/gallery";
import { shareHash } from "../../../shared/link";
import type { Message } from "../message";

type H = HtmlBuilder<Message>;

const SET_BLURB: Record<GallerySet, string> = {
	"Find the cause": "Point Lee at a symptom and make it name the cause: a deploy, a rule, an origin.",
	"Know your account": "Audits, inventories, bills, and small builds across everything you run on Cloudflare.",
};

const card = (h: H, item: GalleryPrompt): Html =>
	h.article(
		[h.Class("flex flex-col rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-flare-line")],
		[
			h.h3([h.Class("text-[15px] font-semibold")], [item.title]),
			h.p([h.Class("mt-2 flex-1 text-[14px] leading-relaxed text-dim")], [item.prompt]),
			h.div(
				[h.Class("mt-4 flex flex-wrap gap-2")],
				[
					h.a(
						[h.Href(galleryPath(item.slug)), h.Target("_blank"), h.Rel("noopener"), h.Class("flex h-9 items-center rounded-lg bg-flare px-3.5 text-[13px] font-semibold text-black hover:opacity-90")],
						["Open in Lee"],
					),
					h.a([h.Href(`/${shareHash(item.prompt)}`), h.Class("flex h-9 items-center rounded-lg border border-line-strong px-3.5 text-[13px] font-medium hover:bg-raised")], ["Edit and share"]),
				],
			),
		],
	);

const set = (h: H, name: GallerySet): Html =>
	h.section(
		[h.Class("mt-12")],
		[
			h.h2([h.Class("text-[22px] font-semibold tracking-[-0.01em]")], [name]),
			h.p([h.Class("mt-1 text-[15px] text-dim")], [SET_BLURB[name]]),
			h.div([h.Class("mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3")], GALLERY.filter((item) => item.set === name).map((item) => card(h, item))),
		],
	);

export const galleryPage = (h: H): Html =>
	h.main(
		[h.Class("mx-auto max-w-6xl px-5 pb-16")],
		[
			h.div(
				[h.Class("max-w-2xl pt-10 md:pt-16")],
				[
					h.p([h.Class("mb-4 text-[13px] font-medium tracking-[0.08em] text-flare uppercase")], ["Prompt gallery"]),
					h.h1([h.Class("text-[36px] leading-[1.05] font-semibold tracking-[-0.03em] md:text-[52px]")], ["Prompts worth sending to Lee."]),
					h.p(
						[h.Class("mt-4 text-[17px] leading-relaxed text-dim")],
						[`${GALLERY.length} prompts. Open one to land in your dashboard with it typed into Agent Lee, or edit it first and share your own link. Nothing runs until you press send.`],
					),
				],
			),
			...GALLERY_SETS.map((name) => set(h, name)),
		],
	);
