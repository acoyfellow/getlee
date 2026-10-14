export type Example = { readonly label: string; readonly text: string };

export const EXAMPLES: ReadonlyArray<Example> = [
	{ label: "Deploy a Worker", text: "Help me create and deploy a Hello World Cloudflare Worker, step by step." },
	{ label: "Audit my DNS", text: "Review the DNS records on my zone and point out anything that looks misconfigured or risky." },
	{ label: "Why is my site slow?", text: "Look at my zone's analytics for the last 24 hours and tell me what is making my site slow." },
	{ label: "Block a bot", text: "Show me which bots hit my site most this week and help me write a WAF rule to block the bad ones." },
	{ label: "Set up R2", text: "Create an R2 bucket for user uploads and explain how to read and write to it from a Worker." },
];
