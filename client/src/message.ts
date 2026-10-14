import { Schema } from "effect";
import { defineMessageUnion } from "foldkit/message";

export const Message = defineMessageUnion({
	UpdatedPrompt: { value: Schema.String },
	UpdatedAccount: { value: Schema.String },
	ClickedExample: { text: Schema.String },
	ClickedCopy: { key: Schema.String, text: Schema.String },
	FinishedCopy: { key: Schema.String, ok: Schema.Boolean },
	ExpiredCopied: { key: Schema.String },
	SavedShareHash: {},
});

export type Message = typeof Message.Type;
