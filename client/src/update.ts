import type { Command, Update } from "foldkit";
import { modifyFields } from "foldkit/struct";
import { ClearCopied, CopyText, MakeShort, SaveShareHash } from "./command";
import { Message } from "./message";
import { type Model, Short, StatsState } from "./model";

type UpdateReturn = Update.Return<Model, Message>;

type AnyCommand = Command.Command<Message>;

const matchesShort = (model: Model, forUrl: string): boolean => model.short._tag === "Making" && model.short.forUrl === forUrl;

const withPrompt = (model: Model, prompt: string): UpdateReturn => ({
	model: modifyFields(model, { prompt: () => prompt, short: () => Short.Idle() }),
	commands: [SaveShareHash({ prompt }) satisfies AnyCommand],
});

export const update = (model: Model, message: Message): UpdateReturn =>
	Message.match<UpdateReturn>(message, {
		UpdatedPrompt: ({ value }) => withPrompt(model, value),
		ClickedExample: ({ text }) => withPrompt(model, text),
		UpdatedAccount: ({ value }) => ({ model: modifyFields(model, { account: () => value.trim().toLowerCase(), short: () => Short.Idle() }) }),
		ClickedCopy: ({ key, text }) => ({ model, commands: [CopyText({ key, text })] }),
		FinishedCopy: ({ key, ok }) =>
			ok
				? { model: modifyFields(model, { copiedKey: () => key, copyFailed: () => false }), commands: [ClearCopied({ key })] }
				: { model: modifyFields(model, { copyFailed: () => true }) },
		ExpiredCopied: ({ key }) => ({ model: modifyFields(model, { copiedKey: (current) => (current === key ? "" : current) }) }),
		SavedShareHash: () => ({ model }),
		ClickedShorten: ({ prompt, account, forUrl }) => ({
			model: modifyFields(model, { short: () => Short.Making({ forUrl }) }),
			commands: [MakeShort({ prompt, account, forUrl })],
		}),
		MadeShort: ({ forUrl, url }) => ({ model: matchesShort(model, forUrl) ? modifyFields(model, { short: () => Short.Made({ forUrl, url }) }) : model }),
		LoadedStats: ({ data }) => ({ model: modifyFields(model, { stats: () => StatsState.Loaded({ data }) }) }),
		FailedStats: () => ({ model: modifyFields(model, { stats: () => StatsState.Failed() }) }),
		FailedShort: ({ forUrl, reason }) => ({ model: matchesShort(model, forUrl) ? modifyFields(model, { short: () => Short.Failed({ forUrl, reason }) }) : model }),
	});
