import { Effect, Schema } from "effect";
import { Command } from "foldkit";
import { shareHash } from "../../shared/link";
import { Message } from "./message";

export const CopyText = Command.define("CopyText", {
	args: { key: Schema.String, text: Schema.String },
	messages: [Message.FinishedCopy],
	execute: ({ key, text }) =>
		Effect.tryPromise(() => navigator.clipboard.writeText(text)).pipe(
			Effect.as(Message.FinishedCopy({ key, ok: true })),
			Effect.orElseSucceed(() => Message.FinishedCopy({ key, ok: false })),
		),
});

export const ClearCopied = Command.define("ClearCopied", {
	args: { key: Schema.String },
	messages: [Message.ExpiredCopied],
	execute: ({ key }) => Effect.sleep("1400 millis").pipe(Effect.as(Message.ExpiredCopied({ key }))),
});

export const SaveShareHash = Command.define("SaveShareHash", {
	args: { prompt: Schema.String },
	messages: [Message.SavedShareHash],
	execute: ({ prompt }) =>
		Effect.sync(() => {
			const hash = prompt.length === 0 ? "" : shareHash(prompt);
			globalThis.history.replaceState(null, "", `${globalThis.location.pathname}${hash}`);

			return Message.SavedShareHash();
		}),
});
