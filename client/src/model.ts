import { Schema } from "effect";
import { defineTaggedUnion } from "foldkit/schema";

export const Short = defineTaggedUnion({
	Idle: {},
	Making: { forUrl: Schema.String },
	Made: { forUrl: Schema.String, url: Schema.String },
	Failed: { forUrl: Schema.String, reason: Schema.String },
});

export type Short = typeof Short.Type;

export const Page = Schema.Literals(["make", "gallery", "stats"]);

export type Page = typeof Page.Type;

export const DayCount = Schema.Struct({ day: Schema.String, event: Schema.String, count: Schema.Number });

export const TopPrompt = Schema.Struct({ slug: Schema.String, count: Schema.Number });

export const StatsData = Schema.Struct({
	windowDays: Schema.Number,
	since: Schema.NullOr(Schema.String),
	totals: Schema.Struct({ visit: Schema.Number, short_created: Schema.Number, short_opened: Schema.Number, gallery_opened: Schema.Number }),
	days: Schema.Array(DayCount),
	topGallery: Schema.Array(TopPrompt),
});

export type StatsData = typeof StatsData.Type;

export const StatsState = defineTaggedUnion({
	Loading: {},
	Loaded: { data: StatsData },
	Failed: {},
});

export type StatsState = typeof StatsState.Type;

export const Model = Schema.Struct({
	page: Page,
	stats: StatsState,
	prompt: Schema.String,
	account: Schema.String,
	copiedKey: Schema.String,
	copyFailed: Schema.Boolean,
	short: Short,
});

export type Model = typeof Model.Type;
