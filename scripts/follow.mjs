import { createRequire } from "node:module";

const { chromium } = createRequire(`${process.env.HOME}/cloudflare/skin/`)("playwright");
const browser = await chromium.launch({ args: ["--host-resolver-rules=MAP getlee.link 104.21.45.239"] });
const page = await browser.newPage();
const hops = [];
page.on("response", (response) => hops.push(`${response.status()} ${response.url().slice(0, 90)}`));
await page.goto(process.argv[2], { waitUntil: "commit", timeout: 20000 }).catch((error) => hops.push(`stop ${error.message.slice(0, 80)}`));
await page.waitForTimeout(1500);
console.log(hops.slice(0, 4).join("\n"));
console.log("final:", page.url().slice(0, 140));
await browser.close();
