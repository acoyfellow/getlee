import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(`${process.env.HOME}/cloudflare/skin/`);
const { chromium } = require("playwright");

const BASE = process.env.BASE ?? "http://localhost:8790";
const PROMPT = "Audit my DNS & check #tags, 100% of ?zones\nthen report 🚀";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const outbound = [];
page.on("request", (request) => outbound.push(request.url()));

await page.goto(BASE);
await page.fill("#prompt", PROMPT);
const url = await page.inputValue("#link");
const shared = page.url();
const hash = new URL(url).hash;
const decoded = decodeURIComponent(hash.slice("#lee-draft=".length));

const second = await browser.newPage();
second.on("request", (request) => outbound.push(request.url()));
await second.goto(shared);
const restored = await second.inputValue("#prompt");
await second.fill("#prompt", "x".repeat(2001));
await second.waitForFunction(() => document.querySelector("#result")?.textContent?.includes("2,000"), null, { timeout: 3000 }).catch(() => undefined);
const tooLong = await second.textContent("#result");
await browser.close();

const promptLeaked = outbound.some((request) => request.includes("Audit") || request.includes("lee-draft"));
const receipt = {
	at: new Date().toISOString(),
	base: BASE,
	url,
	checks: {
		usesDocumentedShape: url.startsWith("https://dash.cloudflare.com/?to=/:account#lee-draft="),
		dashboardDecodesSamePrompt: decoded === PROMPT,
		shareUrlRestoresPrompt: restored === PROMPT,
		over2000Refused: (tooLong ?? "").includes("2,000"),
		promptNeverSentOverNetwork: !promptLeaked,
	},
	requests: outbound.length,
};
writeFileSync("receipts/round-trip.json", `${JSON.stringify(receipt, null, 2)}\n`);
console.log(JSON.stringify(receipt.checks));
process.exit(Object.values(receipt.checks).every(Boolean) ? 0 : 1);
