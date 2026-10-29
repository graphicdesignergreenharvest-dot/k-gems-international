import { chromium } from "playwright-core";
import path from "node:path";
import fs from "node:fs";

const outDir = path.resolve("screenshots/journey-verified");
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

async function run() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // Abort external fonts to prevent screenshot hangs
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());

  await page.goto("http://localhost:3000", { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(3000);

  // Measure ScrollTrigger after refresh
  const metrics = await page.evaluate(() => {
    const canvas = document.querySelector("#journey canvas");
    const wrapper = canvas?.closest(".sticky")?.parentElement;
    const pin = canvas?.closest(".sticky");
    const r = wrapper?.getBoundingClientRect();
    return {
      top: r ? r.top + window.scrollY : 0,
      height: wrapper?.offsetHeight || 0,
      pinHeight: pin ? pin.offsetHeight : 0,
    };
  });
  console.log("Wrapper metrics:", metrics);

  // Test clicking each chapter in the nav bar and capturing the result
  for (let i = 0; i < 6; i++) {
    console.log(`Navigating to Chapter ${i + 1}...`);
    await page.evaluate((idx) => {
      const btns = document.querySelectorAll("#journey nav ol button");
      if (btns[idx]) btns[idx].click();
    }, i);
    await page.waitForTimeout(1600);

    const data = await page.evaluate(() => {
      const activeCard = Array.from(document.querySelectorAll("#journey [aria-hidden]")).find(
        (el) => el.getAttribute("aria-hidden") === "false" && el.querySelector("h2")
      );
      const counter = document.querySelector("#journey .text-gold")?.textContent;
      const progressTransform = document.querySelector("#journey span[style*='scaleX']")?.style?.transform;
      const rect = activeCard?.getBoundingClientRect();
      return {
        scrollY: Math.round(window.scrollY),
        counter,
        headline: activeCard?.querySelector("h2")?.textContent,
        progress: progressTransform,
        box: rect ? {
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          bottom: Math.round(rect.bottom),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        } : null,
      };
    });

    console.log(`[Desktop Ch ${i + 1}]:`, data);
    await page.screenshot({ path: path.join(outDir, `desktop-ch0${i + 1}.png`), timeout: 10000 });
  }

  // Mobile test
  console.log("Testing mobile layout (390 x 844)...");
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  await mobile.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await mobile.route("https://fonts.gstatic.com/**", (route) => route.abort());

  await mobile.goto("http://localhost:3000", { waitUntil: "networkidle", timeout: 45000 });
  await mobile.waitForTimeout(2000);

  const mMetrics = await mobile.evaluate(() => {
    const canvas = document.querySelector("#journey canvas");
    const wrapper = canvas?.closest(".sticky")?.parentElement;
    const r = wrapper?.getBoundingClientRect();
    return {
      top: r ? r.top + window.scrollY : 0,
      height: wrapper?.offsetHeight || 0,
    };
  });

  const targets = [0, 11 / 49, 21 / 49, 30 / 49, 39 / 49, 48 / 49];
  const mScrollable = mMetrics.height - 844;

  for (let i = 0; i < 6; i++) {
    const targetY = mMetrics.top + mScrollable * targets[i];
    await mobile.evaluate((y) => {
      window.scrollTo({ top: y, behavior: "instant" });
      window.dispatchEvent(new Event("scroll"));
    }, targetY);
    await mobile.waitForTimeout(800);

    const mData = await mobile.evaluate(() => {
      const activeCard = Array.from(document.querySelectorAll("#journey [aria-hidden]")).find(
        (el) => el.getAttribute("aria-hidden") === "false" && el.querySelector("h2")
      );
      const rect = activeCard?.getBoundingClientRect();
      return {
        headline: activeCard?.querySelector("h2")?.textContent,
        box: rect ? {
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          left: Math.round(rect.left),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        } : null,
      };
    });
    console.log(`[Mobile Ch ${i + 1}]:`, mData);
    await mobile.screenshot({ path: path.join(outDir, `mobile-ch0${i + 1}.png`), timeout: 10000 });
  }

  await browser.close();
  console.log("Verification finished successfully!");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});

