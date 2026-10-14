import { Schema } from "effect";

export const Model = Schema.Struct({
	prompt: Schema.String,
	account: Schema.String,
	copiedKey: Schema.String,
	copyFailed: Schema.Boolean,
});

export type Model = typeof Model.Type;
