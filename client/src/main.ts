import { Effect, Schema } from "effect";
import type { Update } from "foldkit";
import { promptFromShareHash } from "../../shared/link";
import type { Message } from "./message";
import type { Model } from "./model";

export const Flags = Schema.Struct({ prompt: Schema.String });

export type Flags = typeof Flags.Type;

export const flags: Effect.Effect<Flags> = Effect.sync(() => ({ prompt: promptFromShareHash(globalThis.location.hash) ?? "" }));

export const initialModel = ({ prompt }: Flags): Model => ({ prompt, account: "", copiedKey: "", copyFailed: false });

export const init = (startup: Flags): Update.Return<Model, Message> => ({ model: initialModel(startup), commands: [] });
