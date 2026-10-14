import { Schema } from "effect";
import { AccountId, leeLink } from "../shared/link";
import { randomShortCode, SHORT_CODE_LENGTH, ShortCode, ShortRequest } from "../shared/short";

type Env = { readonly ASSETS: Fetcher; readonly SHORT: KVNamespace; readonly SHORT_LIMIT: RateLimit };

const PAGE_POLICY =
	"default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'";

const SECURITY_HEADERS: Record<string, string> = {
	"content-security-policy": PAGE_POLICY,
	"referrer-policy": "no-referrer",
	"x-content-type-options": "nosniff",
	"permissions-policy": "camera=(), microphone=(), geolocation=()",
};

const PUBLIC_ORIGIN = "https://getlee.link";
const MAX_BODY_BYTES = 16_384;
const CODE_ATTEMPTS = 5;
const SHORT_PATH = /^\/s\/([^/]+)\/?$/;

const isShortCode = Schema.is(ShortCode);
const isAccountId = Schema.is(AccountId);
const decodeShortRequest = Schema.decodeUnknownOption(Schema.fromJsonString(ShortRequest));

const secured = (response: Response): Response => {
	const copy = new Response(response.body, response);
	for (const [name, value] of Object.entries(SECURITY_HEADERS)) copy.headers.set(name, value);

	return copy;
};

const json = (status: number, body: unknown): Response =>
	secured(new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }));

const freshCode = (): string => randomShortCode(crypto.getRandomValues(new Uint8Array(SHORT_CODE_LENGTH)));

const storeLink = async (store: KVNamespace, url: string): Promise<string | null> => {
	for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt += 1) {
		const code = freshCode();
		if ((await store.get(code)) === null) {
			await store.put(code, url);

			return code;
		}
	}

	return null;
};

const clientKey = (request: Request): string => request.headers.get("cf-connecting-ip") ?? "local";

const createShort = async (request: Request, env: Env): Promise<Response> => {
	const { success } = await env.SHORT_LIMIT.limit({ key: clientKey(request) });
	if (!success) return json(429, { error: "rate-limited" });

	const body = await request.text();
	if (body.length > MAX_BODY_BYTES) return json(413, { error: "too-large" });

	const parsed = decodeShortRequest(body);
	if (parsed._tag === "None") return json(400, { error: "bad-request" });

	const { prompt, account } = parsed.value;
	const link = leeLink(prompt, account !== null && isAccountId(account) ? account : null);
	if (link._tag === "Problem") return json(422, { error: link.problem });

	const code = await storeLink(env.SHORT, link.url);
	if (code === null) return json(503, { error: "busy" });

	return json(201, { code, url: `${PUBLIC_ORIGIN}/s/${code}` });
};

const followShort = async (code: string, env: Env): Promise<Response> => {
	const target = isShortCode(code) ? await env.SHORT.get(code) : null;
	if (target === null) return secured(new Response("This short link does not exist.", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } }));

	return secured(new Response(null, { status: 302, headers: { location: target, "cache-control": "no-store" } }));
};

export default {
	async fetch(request, env): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname === "/api/short") return request.method === "POST" ? createShort(request, env) : json(405, { error: "method" });

		const short = SHORT_PATH.exec(url.pathname);
		if (short?.[1] !== undefined) return followShort(short[1], env);

		return secured(await env.ASSETS.fetch(request));
	},
} satisfies ExportedHandler<Env>;
