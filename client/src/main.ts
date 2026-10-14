import { Effect, Schema } from "effect";
import type { Command, Update } from "foldkit";
import { promptFromShareHash } from "../../shared/link";
import { LoadStats } from "./command";
import type { Message } from "./message";
import { type Model, Page, Short, StatsState } from "./model";

export const Flags = Schema.Struct({ prompt: Schema.String, page: Page });

export type Flags = typeof Flags.Type;

export const pageOf = (pathname: string): Page => (pathname.startsWith("/stats") ? "stats" : pathname.startsWith("/gallery") ? "gallery" : "make");

export const flags: Effect.Effect<Flags> = Effect.sync(() => ({ prompt: promptFromShareHash(globalThis.location.hash) ?? "", page: pageOf(globalThis.location.pathname) }));

export const initialModel = ({ prompt, page }: Flags): Model => ({ page, stats: StatsState.Loading(), prompt, account: "", copiedKey: "", copyFailed: false, short: Short.Idle() });

export const init = (startup: Flags): Update.Return<Model, Message> => ({
	model: initialModel(startup),
	commands: startup.page === "stats" ? [LoadStats({}) satisfies Command.Command<Message>] : [],
});
