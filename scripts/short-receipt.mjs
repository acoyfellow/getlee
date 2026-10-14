import { writeFileSync } from "node:fs";
import { request as httpsRequest } from "node:https";
import { request as httpRequest } from "node:http";

const [resolveHost, resolveIp] = (process.env.RESOLVE ?? "").split(":");

const fetch = (target, init = {}) =>
	new Promise((resolve, reject) => {
		const url = new URL(target);
		const send = url.protocol === "https:" ? httpsRequest : httpRequest;
		const lookup = resolveIp !== undefined && url.hostname === resolveHost ? (_host, options, done) => (options.all ? done(null, [{ address: resolveIp, family: 4 }]) : done(null, resolveIp, 4)) : undefined;
		const outgoing = send(url, { method: init.method ?? "GET", headers: init.headers ?? {}, lookup }, (incoming) => {
			const chunks = [];
			incoming.on("data", (chunk) => chunks.push(chunk));
			incoming.on("end", () => {
				const text = Buffer.concat(chunks).toString("utf8");
				resolve({ status: incoming.statusCode, headers: { get: (name) => incoming.headers[name.toLowerCase()] ?? null }, json: async () => JSON.parse(text) });
			});
		});
		outgoing.on("error", reject);
		outgoing.end(init.body);
	});

const BASE = process.env.BASE ?? "http://localhost:8790";
const PROMPT = `Short link receipt ${new Date().toISOString()}: audit my DNS & #tags, 100% 🚀`;
const create = (prompt) => fetch(`${BASE}/api/short`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt, account: null }) });

const made = await create(PROMPT);
const body = made.status === 201 ? await made.json() : null;
const followed = body === null ? null : await fetch(`${BASE}/s/${body.code}`, { redirect: "manual" });
const location = followed?.headers.get("location") ?? "";
const decoded = location.includes("#lee-draft=") ? decodeURIComponent(location.slice(location.indexOf("#lee-draft=") + "#lee-draft=".length)) : null;
const tooLong = await create("x".repeat(2001));
const missing = await fetch(`${BASE}/s/zzzzzzz`, { redirect: "manual" });

const checks = {
	createsShortLink: made.status === 201 && typeof body?.url === "string" && body.url === `https://getlee.link/s/${body.code}`,
	redirectsWith302: followed?.status === 302,
	locationIsExactLeeLink: location.startsWith("https://dash.cloudflare.com/?to=/:account#lee-draft=") && decoded === PROMPT,
	refusesOver2000: tooLong.status === 422,
	unknownCodeIs404: missing.status === 404,
};
writeFileSync("receipts/short-link.json", `${JSON.stringify({ at: new Date().toISOString(), base: BASE, short: body?.url ?? null, location, checks }, null, 2)}\n`);
console.log(JSON.stringify(checks));
process.exit(Object.values(checks).every(Boolean) ? 0 : 1);
