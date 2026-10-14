import type { Command, Update } from "foldkit";
import { modifyFields } from "foldkit/struct";
import { ClearCopied, CopyText, SaveShareHash } from "./command";
import { Message } from "./message";
import type { Model } from "./model";

type UpdateReturn = Update.Return<Model, Message>;

type AnyCommand = Command.Command<Message>;

const withPrompt = (model: Model, prompt: string): UpdateReturn => ({
	model: modifyFields(model, { prompt: () => prompt }),
	commands: [SaveShareHash({ prompt }) satisfies AnyCommand],
});

export const update = (model: Model, message: Message): UpdateReturn =>
	Message.match<UpdateReturn>(message, {
		UpdatedPrompt: ({ value }) => withPrompt(model, value),
		ClickedExample: ({ text }) => withPrompt(model, text),
		UpdatedAccount: ({ value }) => ({ model: modifyFields(model, { account: () => value.trim().toLowerCase() }) }),
		ClickedCopy: ({ key, text }) => ({ model, commands: [CopyText({ key, text })] }),
		FinishedCopy: ({ key, ok }) =>
			ok
				? { model: modifyFields(model, { copiedKey: () => key, copyFailed: () => false }), commands: [ClearCopied({ key })] }
				: { model: modifyFields(model, { copyFailed: () => true }) },
		ExpiredCopied: ({ key }) => ({ model: modifyFields(model, { copiedKey: (current) => (current === key ? "" : current) }) }),
		SavedShareHash: () => ({ model }),
	});
