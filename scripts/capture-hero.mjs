import { chromium } from "playwright-core";
import fs from "node:fs";
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", e=>console.log("ERR", e.message));
await page.goto("http://127.0.0.1:3000", { waitUntil:"networkidle", timeout:120000 });
await page.waitForTimeout(8000);
for (const y of [0, 800, 1600, 2200]) {
  await page.evaluate(top=>window.scrollTo({top,behavior:"instant"}), y);
  await page.waitForTimeout(3500);
  const info = await page.evaluate(()=>{
    const pin=document.querySelector('#home [data-progress]');
    const canvas=document.querySelector('#home canvas');
    return {scrollY:window.scrollY, progress:pin?.dataset.progress, start:pin?.dataset.pinStart, end:pin?.dataset.pinEnd, data:canvas?.toDataURL('image/png')};
  });
  if(info.data){fs.writeFileSync(`screenshots/hero-canvas-${y}.png`, Buffer.from(info.data.split(',')[1],'base64'));}
  delete info.data;
  console.log(y, info);
  await page.screenshot({ path: `screenshots/hero-${y}.png`, timeout: 60000 }).catch(e=>console.log('shot fail', e.message));
}
await browser.close();
