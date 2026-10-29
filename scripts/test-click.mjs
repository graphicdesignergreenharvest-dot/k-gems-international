import { chromium } from "playwright";

console.log("Launching browser...");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

console.log("Navigating to http://localhost:3000...");
await page.goto("http://localhost:3000", { timeout: 15000 });
console.log("Loaded!");

await page.waitForTimeout(2000);

for (let i = 0; i < 6; i++) {
  console.log(`Clicking button ${i}...`);
  await page.evaluate((idx) => {
    const btns = document.querySelectorAll("#journey nav ol button");
    if (btns[idx]) btns[idx].click();
  }, i);
  await page.waitForTimeout(1000);
  const data = await page.evaluate(() => ({
    scrollY: Math.round(window.scrollY),
    activeH2: document.querySelector("#journey [aria-hidden='false'] h2")?.textContent,
    activeCounter: document.querySelector("#journey .text-gold")?.textContent,
  }));
  console.log(`Ch ${i + 1}:`, data);
}

await browser.close();
console.log("Done!");

