import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const { chromium } = createRequire(`${process.env.HOME}/cloudflare/skin/`)("playwright");
const icon = readFileSync("public/brand/icon.svg", "utf8");
const cloud = readFileSync("public/brand/cloudflare-cloud.svg", "utf8");
const hero = readFileSync("public/brand/hero.jpg").toString("base64");
const browser = await chromium.launch();

const shoot = async (html, width, height, path) => {
	const page = await browser.newPage({ viewport: { width, height } });
	await page.setContent(`<html><body style="margin:0;background:transparent">${html}</body></html>`);
	await page.screenshot({ path, omitBackground: true, type: path.endsWith(".jpg") ? "jpeg" : "png", ...(path.endsWith(".jpg") ? { quality: 88 } : {}) });
	await page.close();
};

for (const size of [32, 180, 192, 512]) await shoot(icon.replace("<svg ", `<svg width="${size}" height="${size}" `), size, size, `public/brand/icon-${size}.png`);

await shoot(
	`<div style="width:1200px;height:630px;background:url(data:image/jpeg;base64,${hero}) center/cover;font-family:'Helvetica Neue',Helvetica,sans-serif;color:#f5f1ea;position:relative">
		<div style="position:absolute;left:80px;top:64px;display:flex;align-items:center;gap:14px;font-size:26px;color:#d6cec4">${cloud.replace("<svg ", '<svg height="40" ')}<span>for Agent Lee</span></div>
		<div style="position:absolute;left:76px;top:150px;font-size:96px;font-weight:700;letter-spacing:-3px">getlee.link</div>
		<div style="position:absolute;left:82px;top:272px;font-size:36px;line-height:1.3;color:#dcd4ca">Turn any prompt into a link that<br>opens Agent Lee, ready to send.</div>
	</div>`,
	1200,
	630,
	"public/brand/og.jpg",
);
await browser.close();
