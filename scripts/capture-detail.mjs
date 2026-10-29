import { chromium } from "playwright-core";

const base = "http://127.0.0.1:3000";
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
page.on("pageerror", (e) => console.log("PAGE EXCEPTION:", e.message));

await page.goto(`${base}/collection/ceylon-blue-sapphire`, {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForTimeout(2500);

// Switch the detail visual to the real 3D viewer.
await page.getByRole("button", { name: /3d view/i }).click();
await page.waitForTimeout(9000);
await page.screenshot({ path: "artifacts/v2-viewer-3d.png" });
console.log("captured 3d view");

// Load the Sketchfab embed and confirm the viewer frame appears.
await page
  .getByRole("button", { name: /load interactive 3d model/i })
  .scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await page.getByRole("button", { name: /load interactive 3d model/i }).click();
await page.waitForTimeout(9000);
const frames = page
  .frames()
  .map((f) => f.url())
  .filter((u) => u.includes("sketchfab"));
console.log("sketchfab frames:", JSON.stringify(frames));
await page.screenshot({ path: "artifacts/v2-reference-embed.png" });
console.log("captured embed");

await browser.close();
console.log("done");
