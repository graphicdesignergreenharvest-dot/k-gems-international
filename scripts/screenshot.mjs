import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const base = process.argv[2] ?? "http://127.0.0.1:3000";
const outDir = path.resolve("screenshots");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--disable-dev-shm-usage",
  ],
});

const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});

page.on("console", (message) => {
  if (message.type() === "error") console.log("PAGE ERROR:", message.text());
});
page.on("pageerror", (error) => console.log("PAGE EXCEPTION:", error.message));

await page.goto(base, { waitUntil: "networkidle", timeout: 120000 });
await page.waitForTimeout(6000);

async function shot(name) {
  await page.screenshot({ path: path.join(outDir, `${name}.png`) });
  console.log("shot", name);
}

await shot("desktop-hero");

const positions = [450, 900, 1400, 1900, 2400, 2900, 3400, 3900];
for (const y of positions) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
  await page.waitForTimeout(1400);
  await shot(`desktop-scroll-${y}`);
}

// Journey / sections via anchors
const anchors = ["journey", "collection", "about", "trust", "enquiry", "contact"];
for (const id of anchors) {
  await page.evaluate((anchor) => {
    const el = document.getElementById(anchor);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
  }, id);
  await page.waitForTimeout(1800);
  await shot(`section-${id}`);
}

// Mobile
const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
mobile.on("pageerror", (error) => console.log("MOBILE EXCEPTION:", error.message));
await mobile.goto(base, { waitUntil: "networkidle", timeout: 120000 });
await mobile.waitForTimeout(5000);
await mobile.screenshot({ path: path.join(outDir, "mobile-hero.png") });

await mobile.evaluate(() => {
  const el = document.getElementById("collection");
  if (el) window.scrollTo({ top: el.offsetTop, behavior: "instant" });
});
await mobile.waitForTimeout(1500);
await mobile.screenshot({ path: path.join(outDir, "mobile-collection.png") });

await mobile.evaluate(() => {
  const el = document.getElementById("enquiry");
  if (el) window.scrollTo({ top: el.offsetTop, behavior: "instant" });
});
await mobile.waitForTimeout(1500);
await mobile.screenshot({ path: path.join(outDir, "mobile-enquiry.png") });

// Detail page
const detail = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
await detail.goto(`${base}/collection/ceylon-blue-sapphire`, {
  waitUntil: "networkidle",
  timeout: 120000,
});
await detail.waitForTimeout(3000);
await detail.screenshot({
  path: path.join(outDir, "detail-page.png"),
  fullPage: true,
});

// Capture a raw WebGL canvas for inspection
const canvasData = await page.evaluate(() => {
  const canvas = document.querySelector("#home canvas");
  return canvas instanceof HTMLCanvasElement ? canvas.toDataURL("image/png") : null;
});
if (canvasData) {
  fs.writeFileSync(
    path.join(outDir, "hero-canvas.png"),
    Buffer.from(canvasData.split(",")[1], "base64"),
  );
  console.log("captured hero canvas");
}

await browser.close();
console.log("done");
