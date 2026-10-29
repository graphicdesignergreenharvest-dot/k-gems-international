import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

const wrapperRect = await page.evaluate(() => {
  const el = document.querySelector("#journey div.sticky")?.parentElement;
  const r = el?.getBoundingClientRect();
  return { top: r ? r.top + window.scrollY : 0, height: el?.offsetHeight || 0 };
});
console.log("Journey wrapper in document:", wrapperRect);

for (let top = 0; top <= 14000; top += 1000) {
  await page.evaluate((y) => {
    window.scrollTo({ top: y, behavior: "instant" });
    window.dispatchEvent(new Event("scroll"));
  }, top);
  await page.waitForTimeout(300);

  const data = await page.evaluate(() => {
    const activeCard = Array.from(document.querySelectorAll("#journey [aria-hidden]")).find(
      (el) => el.getAttribute("aria-hidden") === "false" && el.querySelector("h2")
    );
    const counter = document.querySelector("#journey .text-gold")?.textContent;
    const progressTransform = document.querySelector("#journey span[style*='scaleX']")?.style?.transform;
    return {
      scrollY: Math.round(window.scrollY),
      counter,
      headline: activeCard?.querySelector("h2")?.textContent,
      progress: progressTransform,
    };
  });
  console.log(`ScrollY ${top}:`, data);
}

await browser.close();

