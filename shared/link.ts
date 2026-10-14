import { Schema } from "effect";

export const DRAFT_PREFIX = "#lee-draft=";
export const MAX_DRAFT_CHARS = 2000;
export const DASH_ORIGIN = "https://dash.cloudflare.com";
export const ACCOUNT_PICKER_PATH = "/";

export const AccountId = Schema.String.check(Schema.isPattern(/^[0-9a-f]{32}$/));

export type AccountId = typeof AccountId.Type;

export type LinkProblem = "empty" | "too-long";

export type LeeLink = { readonly _tag: "Link"; readonly url: string; readonly chars: number } | { readonly _tag: "Problem"; readonly problem: LinkProblem; readonly chars: number };

const destination = (account: AccountId | null): string => (account === null ? ACCOUNT_PICKER_PATH : `/${account}`);

export const leeLink = (prompt: string, account: AccountId | null): LeeLink => {
	const chars = prompt.length;

	if (prompt.trim().length === 0) return { _tag: "Problem", problem: "empty", chars };
	if (chars > MAX_DRAFT_CHARS) return { _tag: "Problem", problem: "too-long", chars };

	return { _tag: "Link", url: `${DASH_ORIGIN}${destination(account)}${DRAFT_PREFIX}${encodeURIComponent(prompt)}`, chars };
};

export const SHARE_PREFIX = "#p=";

export const shareHash = (prompt: string): string => `${SHARE_PREFIX}${encodeURIComponent(prompt)}`;

export const promptFromShareHash = (hash: string): string | null => {
	if (!hash.startsWith(SHARE_PREFIX)) return null;

	try {
		return decodeURIComponent(hash.slice(SHARE_PREFIX.length)).slice(0, MAX_DRAFT_CHARS);
	} catch {
		return null;
	}
};

export const draftFromHash = (hash: string): string | null => {
	if (!hash.startsWith(DRAFT_PREFIX)) return null;

	try {
		const text = decodeURIComponent(hash.slice(DRAFT_PREFIX.length));

		return text.trim().length > 0 && text.length <= MAX_DRAFT_CHARS ? text : null;
	} catch {
		return null;
	}
};
