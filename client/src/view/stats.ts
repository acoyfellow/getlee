import type { Html, HtmlBuilder } from "foldkit/html";
import { galleryPrompt } from "../../../shared/gallery";
import type { Message } from "../message";
import { type Model, type StatsData, StatsState } from "../model";

type H = HtmlBuilder<Message>;

type Metric = "visit" | "short_created" | "short_opened" | "gallery_opened";

const METRICS: ReadonlyArray<{ readonly key: Metric; readonly label: string; readonly hint: string }> = [
	{ key: "visit", label: "Page views", hint: "Views of getlee.link pages, bots excluded" },
	{ key: "short_created", label: "Short links made", hint: "New getlee.link/s/ codes" },
	{ key: "short_opened", label: "Short links opened", hint: "Clicks that went on to the dashboard" },
	{ key: "gallery_opened", label: "Gallery opens", hint: "Gallery prompts sent to Lee" },
];

const DAY_MS = 86_400_000;

const windowDays = (count: number, now: Date): ReadonlyArray<string> =>
	Array.from({ length: count }, (_, index) => new Date(now.getTime() - (count - 1 - index) * DAY_MS).toISOString().slice(0, 10));

const series = (data: StatsData, metric: Metric, days: ReadonlyArray<string>): ReadonlyArray<number> =>
	days.map((day) => data.days.find((row) => row.day === day && row.event === metric)?.count ?? 0);

const sum = (values: ReadonlyArray<number>): number => values.reduce((total, value) => total + value, 0);

const bars = (h: H, values: ReadonlyArray<number>, days: ReadonlyArray<string>): Html => {
	const peak = Math.max(1, ...values);

	return h.div(
		[h.Class("mt-4 flex h-24 items-end gap-[3px]"), h.AriaHidden(true)],
		values.map((value, index) =>
			h.div(
				[
					h.Class(`flex-1 rounded-t-sm ${value === 0 ? "bg-line" : "bg-flare"}`),
					h.Style({ height: `${Math.max(4, Math.round((value / peak) * 100))}%` }),
					h.Title(`${days[index] ?? ""}: ${value.toLocaleString()}`),
				],
				[],
			),
		),
	);
};

const metricCard = (h: H, data: StatsData, metric: (typeof METRICS)[number], days: ReadonlyArray<string>): Html => {
	const values = series(data, metric.key, days);
	const lastWeek = sum(values.slice(-7));

	return h.section(
		[h.Class("rounded-2xl border border-line bg-panel p-5"), h.AriaLabel(metric.label)],
		[
			h.p([h.Class("text-[13px] font-medium text-dim")], [metric.label]),
			h.p([h.Class("mt-1 text-[40px] leading-none font-semibold tracking-[-0.02em] tabular-nums")], [data.totals[metric.key].toLocaleString()]),
			h.p([h.Class("mt-2 text-[13px] text-faint")], [`${lastWeek.toLocaleString()} in the last 7 days · ${metric.hint}`]),
			bars(h, values, days),
			h.div([h.Class("mt-1 flex justify-between text-[11px] text-faint tabular-nums")], [h.span([], [days[0] ?? ""]), h.span([], ["today"])]),
		],
	);
};

const ratio = (top: number, bottom: number): string => (bottom === 0 ? "–" : `${Math.round((top / bottom) * 100)}%`);

const funnel = (h: H, data: StatsData): Html =>
	h.section(
		[h.Class("rounded-2xl border border-line bg-panel p-5")],
		[
			h.p([h.Class("text-[13px] font-medium text-dim")], ["Conversion"]),
			h.dl(
				[h.Class("mt-3 grid grid-cols-2 gap-4")],
				[
					h.div([], [h.dt([h.Class("text-[12px] text-faint")], ["Views that made a short link"]), h.dd([h.Class("mt-1 text-[28px] font-semibold tabular-nums")], [ratio(data.totals.short_created, data.totals.visit)])]),
					h.div([], [h.dt([h.Class("text-[12px] text-faint")], ["Opens per short link"]), h.dd([h.Class("mt-1 text-[28px] font-semibold tabular-nums")], [data.totals.short_created === 0 ? "–" : (data.totals.short_opened / data.totals.short_created).toFixed(1)])]),
				],
			),
		],
	);

const topGallery = (h: H, data: StatsData): Html =>
	h.section(
		[h.Class("rounded-2xl border border-line bg-panel p-5")],
		[
			h.p([h.Class("text-[13px] font-medium text-dim")], ["Most opened gallery prompts"]),
			data.topGallery.length === 0
				? h.p([h.Class("mt-3 text-[14px] text-faint")], ["None yet."])
				: h.ol(
						[h.Class("mt-3 grid gap-2")],
						data.topGallery.map((row) =>
							h.li(
								[h.Class("flex items-baseline justify-between gap-3 text-[14px]")],
								[h.span([h.Class("truncate")], [galleryPrompt(row.slug)?.title ?? row.slug]), h.span([h.Class("text-dim tabular-nums")], [row.count.toLocaleString()])],
							),
						),
					),
		],
	);

const loaded = (h: H, data: StatsData): ReadonlyArray<Html> => {
	const days = windowDays(data.windowDays, new Date());

	return [
		h.div([h.Class("grid gap-3 sm:grid-cols-2")], METRICS.map((metric) => metricCard(h, data, metric, days))),
		h.div([h.Class("mt-3 grid gap-3 md:grid-cols-2")], [funnel(h, data), topGallery(h, data)]),
		h.p([h.Class("mt-6 text-[13px] text-faint")], [
			data.since === null ? "Counting starts now." : `Counting since ${data.since}. Daily counts only: no cookies, no IPs, no prompts. Updates every minute.`,
		]),
	];
};

export const statsPage = (h: H, model: Model): Html =>
	h.main(
		[h.Class("mx-auto max-w-6xl px-5 pb-16")],
		[
			h.div(
				[h.Class("max-w-2xl pt-10 pb-8 md:pt-16")],
				[
					h.p([h.Class("mb-4 text-[13px] font-medium tracking-[0.08em] text-flare uppercase")], ["Open stats"]),
					h.h1([h.Class("text-[36px] leading-[1.05] font-semibold tracking-[-0.03em] md:text-[52px]")], ["How getlee.link is growing."]),
				],
			),
			...StatsState.match(model.stats, {
				Loading: () => [h.p([h.Class("text-[15px] text-faint")], ["Loading…"])],
				Failed: () => [h.p([h.Class("text-[15px] text-bad")], ["Could not load stats. Reload to try again."])],
				Loaded: ({ data }) => loaded(h, data),
			}),
		],
	);
