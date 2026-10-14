import { Effect, Schema } from "effect";
import { Command } from "foldkit";
import { shareHash } from "../../shared/link";
import { ShortResponse } from "../../shared/short";
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

const decodeShortResponse = Schema.decodeUnknownEffect(ShortResponse);

const shortFailure = (status: number): string =>
	status === 422 ? "That prompt cannot become a link." : status === 429 ? "Too many short links. Try again in a minute." : "Could not make a short link. The long link still works.";

export const MakeShort = Command.define("MakeShort", {
	args: { prompt: Schema.String, account: Schema.NullOr(Schema.String), forUrl: Schema.String },
	messages: [Message.MadeShort, Message.FailedShort],
	execute: ({ prompt, account, forUrl }) =>
		Effect.gen(function* () {
			const response = yield* Effect.tryPromise(() =>
				fetch("/api/short", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt, account }) }),
			);
			if (!response.ok) return Message.FailedShort({ forUrl, reason: shortFailure(response.status) });

			const body = yield* Effect.tryPromise(() => response.json());
			const short = yield* decodeShortResponse(body);

			return Message.MadeShort({ forUrl, url: short.url });
		}).pipe(Effect.orElseSucceed(() => Message.FailedShort({ forUrl, reason: shortFailure(0) }))),
});
