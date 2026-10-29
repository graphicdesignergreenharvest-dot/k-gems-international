import { chromium } from "playwright-core";

const base = "http://127.0.0.1:3000";
const out = "artifacts";

const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_BIN ??
    "/workspace/homes/951e5c22dae6f5c25c10f115/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome",
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
  ],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const shot = (name) => page.screenshot({ path: `${out}/${name}.png` });

/* ---- Hero ---- */
await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(4500);
await shot("v2-hero");

for (const y of [1800, 2600, 3600]) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(2200);
  await shot(`v2-hero-scroll-${y}`);
}

/* ---- Sapphire detail page ---- */
await page.goto(`${base}/collection/ceylon-blue-sapphire`, {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForTimeout(4000);
await shot("v2-viewer");

const refSection = page.locator("#reference-model-heading");
await refSection.scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
await shot("v2-reference-poster");

// Load the actual Sketchfab embed and give the viewer time to start.
const load = page.getByRole("button", { name: /load interactive 3d model/i });
if (await load.count()) {
  await load.click();
  await page.waitForTimeout(12000);
  await shot("v2-reference-embed");
  const frame = page.frames().find((f) => f.url().includes("sketchfab.com"));
  console.log("sketchfab frame present:", Boolean(frame), frame?.url() ?? "");
} else {
  console.log("embed load button not found");
}

await browser.close();
console.log("done");
