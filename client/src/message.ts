import { Schema } from "effect";
import { defineMessageUnion } from "foldkit/message";
import { StatsData } from "./model";

export const Message = defineMessageUnion({
	UpdatedPrompt: { value: Schema.String },
	UpdatedAccount: { value: Schema.String },
	ClickedExample: { text: Schema.String },
	ClickedCopy: { key: Schema.String, text: Schema.String },
	FinishedCopy: { key: Schema.String, ok: Schema.Boolean },
	ExpiredCopied: { key: Schema.String },
	SavedShareHash: {},
	ClickedShorten: { prompt: Schema.String, account: Schema.NullOr(Schema.String), forUrl: Schema.String },
	MadeShort: { forUrl: Schema.String, url: Schema.String },
	FailedShort: { forUrl: Schema.String, reason: Schema.String },
	LoadedStats: { data: StatsData },
	FailedStats: {},
});

export type Message = typeof Message.Type;
