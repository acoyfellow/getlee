import type { LeeLink } from "../../../shared/link";

export const markdownSnippet = (url: string): string => `[Ask Agent Lee](${url})`;

export const htmlSnippet = (url: string): string =>
	`<a href="${url.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}" target="_blank" rel="noopener">Ask Agent Lee</a>`;

export const problemText = (link: LeeLink): string =>
	link._tag === "Link" ? "" : link.problem === "empty" ? "Type a prompt to get a link." : "Lee drops prompts longer than 2,000 characters. Shorten it to get a link.";
