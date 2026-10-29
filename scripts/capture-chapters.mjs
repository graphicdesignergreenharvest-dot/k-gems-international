import { chromium } from "playwright-core";
import path from "node:path";
import fs from "node:fs";

const outDir = path.resolve("screenshots/journey-chapters");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

// Use the chapter navigation buttons to navigate directly to each chapter!
// Because the page has chapter nav buttons that call goToChapter(index)!
for (let i = 0; i < 6; i++) {
  console.log(`Clicking chapter button ${i + 1}...`);
  await page.evaluate((idx) => {
    const btns = document.querySelectorAll("#journey nav ol button");
    if (btns[idx]) btns[idx].click();
  }, i);
  await page.waitForTimeout(1800);

  const data = await page.evaluate(() => {
    const activeCard = Array.from(document.querySelectorAll("#journey [aria-hidden]")).find(
      (el) => el.getAttribute("aria-hidden") === "false" && el.querySelector("h2")
    );
    const counter = document.querySelector("#journey .text-gold")?.textContent;
    const progressTransform = document.querySelector("#journey span[style*='scaleX']")?.style?.transform;
    const rect = activeCard?.getBoundingClientRect();
    return {
      counter,
      headline: activeCard?.querySelector("h2")?.textContent,
      copy: activeCard?.querySelector("p.mt-4")?.textContent,
      progress: progressTransform,
      box: rect ? { top: Math.round(rect.top), left: Math.round(rect.left), width: Math.round(rect.width), height: Math.round(rect.height) } : null,
    };
  });
  console.log(`Chapter ${i + 1} data:`, data);
  await page.screenshot({ path: path.join(outDir, `chapter-0${i + 1}.png`) });
}

await browser.close();
console.log("All 6 chapter screenshots saved!");

