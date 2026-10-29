import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:3000", { waitUntil:"networkidle", timeout:120000 });
await page.waitForTimeout(3000);
await page.evaluate(()=>window.scrollTo({top:1550,behavior:"instant"}));
await page.waitForTimeout(2000);
console.log(await page.evaluate(()=>{
  const el = document.querySelector('[aria-live="polite"]');
  const rules=[];
  for(const sheet of document.styleSheets){try{for(const rule of sheet.cssRules){if(rule.cssText.includes('opacity')) rules.push(rule.cssText.slice(0,180));}}catch{}}
  return {style: el.getAttribute('style'), cls: el.getAttribute('class'), opacity: getComputedStyle(el).opacity, rules: rules.filter(r=>/\.opacity-(0|100)/.test(r)).slice(0,8)};
}));
await browser.close();
