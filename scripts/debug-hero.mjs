import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", e=>console.log("ERR", e.message));
await page.goto("http://127.0.0.1:3000", { waitUntil:"networkidle", timeout:120000 });
await page.waitForTimeout(5000);
for (const y of [0, 300, 700, 1100, 1500, 1900, 2300, 2500, 2700]) {
  await page.evaluate(top=>window.scrollTo({top,behavior:"instant"}), y);
  await page.waitForTimeout(800);
  const info = await page.evaluate(()=>{
    const rail = [...document.querySelectorAll('ol[aria-label="Hero scroll chapters"] li')].map(li=>li.className);
    const featured = document.querySelector('[aria-live="polite"]');
    const copy = document.querySelector('#home .container-luxe [style]');
    return { y: window.scrollY, rail, featuredOpacity: featured ? getComputedStyle(featured).opacity : null, featuredDisplay: featured?.className, bodyText: document.body.innerText.includes('Featured Stone'), canvas: !!document.querySelector('#home canvas'), copyStyle: copy?.getAttribute('style')?.slice(0,120) };
  });
  console.log(y, JSON.stringify(info));
}
await browser.close();
