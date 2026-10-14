import { createRequire } from "node:module";

const { chromium } = createRequire(`${process.env.HOME}/cloudflare/skin/`)("playwright");
const [host, ip] = (process.env.RESOLVE ?? "").split(":");
const browser = await chromium.launch(ip === undefined ? {} : { args: [`--host-resolver-rules=MAP ${host} ${ip}`] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(process.env.BASE ?? "http://localhost:8790");
await page.click("text=Why is my site slow?");
await page.click("#shorten");
await page.waitForSelector("#short", { timeout: 8000 });
const short = await page.inputValue("#short");
await page.locator("#result").scrollIntoViewIfNeeded();
await page.screenshot({ path: "receipts/prod-short.png" });
console.log(short);
await browser.close();
