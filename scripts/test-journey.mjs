import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const base = "http://localhost:3000";
const outDir = path.resolve("screenshots/journey-test");
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
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  page.on("console", (m) => console.log("PAGE LOG:", m.text()));
  page.on("pageerror", (e) => console.log("PAGE ERR:", e.message));

  console.log("Navigating to home page...");
  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3000);

  // Measure Journey section and scroll track
  const info = await page.evaluate(() => {
    const section = document.getElementById("journey");
    const canvas = document.querySelector("#journey canvas");
    const wrapper = canvas ? canvas.closest(".sticky")?.parentElement : null;
    const pin = canvas ? canvas.closest(".sticky") : null;
    if (!section || !wrapper) return null;

    const sRect = section.getBoundingClientRect();
    const wRect = wrapper.getBoundingClientRect();
    return {
      sectionTop: sRect.top + window.scrollY,
      wrapperTop: wRect.top + window.scrollY,
      wrapperHeight: wrapper.offsetHeight,
      pinHeight: pin ? pin.offsetHeight : 0,
      scrollHeight: document.documentElement.scrollHeight,
    };
  });

  console.log("Measured info:", info);
  if (!info) {
    console.error("Could not find journey elements");
    await browser.close();
    return;
  }

  // Scroll to journey intro
  await page.evaluate((top) => {
    window.scrollTo({ top, behavior: "instant" });
    window.dispatchEvent(new Event("scroll"));
  }, info.sectionTop);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, "00-journey-intro.png") });

  // Chapters are 6 (0 through 5).
  // Total scroll distance of the wrapper is (wrapperHeight - window.innerHeight)
  const scrollableDistance = info.wrapperHeight - 900;
  console.log("Scrollable distance for journey:", scrollableDistance);

  const chapters = [
    { id: "01-discovery", progress: 0.08 },
    { id: "02-cutting", progress: 0.25 },
    { id: "03-laboratory", progress: 0.42 },
    { id: "04-craftsmanship", progress: 0.58 },
    { id: "05-showroom", progress: 0.75 },
    { id: "06-fashion", progress: 0.92 },
  ];

  for (const ch of chapters) {
    const targetY = info.wrapperTop + scrollableDistance * ch.progress;
    console.log(`Scrolling to chapter ${ch.id} at Y=${targetY} (progress ${ch.progress})`);
    
    await page.evaluate((y) => {
      window.scrollTo({ top: y, behavior: "instant" });
      window.dispatchEvent(new Event("scroll"));
    }, targetY);
    await page.waitForTimeout(1200);

    const stepData = await page.evaluate(() => {
      const activeCard = Array.from(document.querySelectorAll("#journey [aria-hidden]")).find(
        (el) => el.getAttribute("aria-hidden") === "false" && el.querySelector("h2")
      );
      const counter = document.querySelector("#journey .text-gold")?.textContent;
      const h2 = activeCard?.querySelector("h2")?.textContent;
      const copy = activeCard?.querySelector("p.mt-4")?.textContent;
      const rect = activeCard?.getBoundingClientRect();
      const canvas = document.querySelector("#journey canvas");
      const cRect = canvas?.getBoundingClientRect();

      return {
        counter,
        headline: h2,
        copy,
        box: rect ? {
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          bottom: Math.round(rect.bottom),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        } : null,
        canvas: cRect ? { width: cRect.width, height: cRect.height } : null,
      };
    });

    console.log(`[${ch.id}] Step data:`, stepData);
    await page.screenshot({ path: path.join(outDir, `desktop-${ch.id}.png`) });
  }

  // Mobile test (390 x 844)
  console.log("Starting mobile test...");
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  await mobile.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await mobile.waitForTimeout(2000);

  const mInfo = await mobile.evaluate(() => {
    const canvas = document.querySelector("#journey canvas");
    const wrapper = canvas ? canvas.closest(".sticky")?.parentElement : null;
    if (!wrapper) return null;
    const wRect = wrapper.getBoundingClientRect();
    return {
      wrapperTop: wRect.top + window.scrollY,
      wrapperHeight: wrapper.offsetHeight,
    };
  });

  const mScrollable = mInfo.wrapperHeight - 844;
  for (const ch of chapters) {
    const targetY = mInfo.wrapperTop + mScrollable * ch.progress;
    await mobile.evaluate((y) => {
      window.scrollTo({ top: y, behavior: "instant" });
      window.dispatchEvent(new Event("scroll"));
    }, targetY);
    await mobile.waitForTimeout(1200);

    const mData = await mobile.evaluate(() => {
      const activeCard = Array.from(document.querySelectorAll("#journey [aria-hidden]")).find(
        (el) => el.getAttribute("aria-hidden") === "false" && el.querySelector("h2")
      );
      const h2 = activeCard?.querySelector("h2")?.textContent;
      const rect = activeCard?.getBoundingClientRect();
      return {
        headline: h2,
        box: rect ? {
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          left: Math.round(rect.left),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        } : null,
      };
    });
    console.log(`[Mobile ${ch.id}]:`, mData);
    await mobile.screenshot({ path: path.join(outDir, `mobile-${ch.id}.png`) });
  }

  await browser.close();
  console.log("All done! Screenshots written to", outDir);
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

