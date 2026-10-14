import { Schema } from "effect";
import { defineTaggedUnion } from "foldkit/schema";

export const Short = defineTaggedUnion({
	Idle: {},
	Making: { forUrl: Schema.String },
	Made: { forUrl: Schema.String, url: Schema.String },
	Failed: { forUrl: Schema.String, reason: Schema.String },
});

export type Short = typeof Short.Type;

export const Model = Schema.Struct({
	prompt: Schema.String,
	account: Schema.String,
	copiedKey: Schema.String,
	copyFailed: Schema.Boolean,
	short: Short,
});

export type Model = typeof Model.Type;
