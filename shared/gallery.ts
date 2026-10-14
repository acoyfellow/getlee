export type GallerySet = "Find the cause" | "Know your account";

export type GalleryPrompt = { readonly slug: string; readonly set: GallerySet; readonly title: string; readonly prompt: string };

const cause = (slug: string, title: string, prompt: string): GalleryPrompt => ({ slug, set: "Find the cause", title, prompt });

const account = (slug: string, title: string, prompt: string): GalleryPrompt => ({ slug, set: "Know your account", title, prompt });

export const GALLERY: ReadonlyArray<GalleryPrompt> = [
	cause("cache-drop", "Cache hit rate drop", "Show cache hit rate for my busiest zone. Click the worst hour and tell me whether the drop is a deploy, a cache rule, or origin 5xx."),
	cause("origin-vs-worker", "Origin 5xx vs Worker errors", "Chart origin status >= 500 against Worker exceptions for the same hour. Same incident, or two?"),
	cause("request-spike", "Explain a request spike", "That request spike: split it by referer, HTTP version, country, and colo. Which attribute actually explains it?"),
	cause("slow-request", "Trace a slow request", "Trace one slow request through the platform. Where did the time go: cache, Worker, D1, R2, or origin?"),
	cause("top-5xx-paths", "Top 5xx paths", "Top 10 paths by 5xx in the last 24h. For each, the Worker or route that served it, and the last deploy that touched it."),
	cause("deploy-errors", "Which deploy broke it", "Correlate Worker error spikes with audit-log deploys. Which release moved production, and what was the diff?"),
	cause("cpu-burn", "Workers CPU burn", "Top 10 Workers by CPU. For each, the last deploy from the audit log. What change caused the burn?"),
	cause("waf-own-origin", "Blocking my own origins?", "Zones with the most WAF hits, crossed with the Workers serving them. Am I blocking my own origins?"),
	cause("under-attack", "Attacks hiding behind cache", "Per zone, 7 days of requests, cache hit ratio, threats. Rank by most under attack. Which three are hiding it behind cache?"),
	cause("daily-diff", "What changed since yesterday", "Diff today against yesterday. Zones, Workers, DNS, WAF. Before/after. If nothing changed, say so."),
	cause("one-screen", "One-screen health", "One screen: platform incidents, top 5 Workers by error rate, last 10 audit changes, account health."),
	cause("outage-history", "My outage history", "Every chat where I reported an outage. Incident timeline, the fix you proposed, and whether I applied it."),
	account("bindings", "Orphaned bindings", "Map every binding. Which KV, R2, D1, and Durable Objects are live, and which are orphaned and still billing?"),
	account("ssl-flexible", "SSL Flexible risk", "Zones still on SSL Flexible. For each: HTTPS redirect on or off, and whether I am one setting from a redirect loop."),
	account("zone-score", "Score every zone", "Score every zone: SSL mode, Always Use HTTPS, HSTS, WAF, bot management, rate limiting. Worst to best. One fix each."),
	account("audit-week", "Weekly audit report", "Last 7 days of audit logs, classified by blast radius. Weekly report, plus a chart of how often the account is changing."),
	account("stale-secrets", "Stale Worker secrets", "Worker secrets not rotated in 90 days, from audit history. Flag them. Do not rotate until I confirm."),
	account("unused-entitlements", "Paid but unused", "Entitlements I have never configured. Paid products with zero resources. What to turn on first."),
	account("dependency-map", "Architecture for a new hire", "Dependency map: service bindings, shared KV, zone routes. An architecture table I can hand a new hire."),
	account("bill-model", "Model my bill", "Estimate this month’s Workers, Workers AI, R2, KV, and D1 bill. Then model 50% of R2 to infrequent access and 20% more cached responses."),
	account("generated-projects", "What happened to my projects", "From our past chats: every Worker or project you generated, and whether I exported it, deployed it, or abandoned it."),
	account("asked-not-shipped", "Asked about, never shipped", "What do I actually ask you about, and which of those products have I never shipped?"),
	account("ignored-advice", "Advice I ignored", "Our three longest chats. Every recommendation I ignored, ranked by how expensive the ignore is."),
	account("queue-sentiment", "Build: Queue to D1 sentiment", "Consume my Queue, run Workers AI sentiment, write to D1, export the repo."),
	account("do-rate-limit", "Build: Durable Object rate limit", "Durable Object rate limit per IP across my Workers, plus a second Worker that renders the live state as HTML. Export both."),
];

export const GALLERY_SETS: ReadonlyArray<GallerySet> = ["Find the cause", "Know your account"];

export const galleryPrompt = (slug: string): GalleryPrompt | undefined => GALLERY.find((item) => item.slug === slug);

export const galleryPath = (slug: string): string => `/g/${slug}`;
