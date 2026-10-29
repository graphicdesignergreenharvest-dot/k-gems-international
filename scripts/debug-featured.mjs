import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:3000", { waitUntil:"networkidle", timeout:120000 });
await page.waitForTimeout(4000);
await page.evaluate(()=>window.scrollTo({top:1550,behavior:"instant"}));
await page.waitForTimeout(2500);
console.log(await page.evaluate(()=>{
  const el = document.querySelector('[aria-live="polite"]');
  const chain=[]; let n=el;
  while(n && n!==document.documentElement){const cs=getComputedStyle(n);chain.push({tag:n.tagName,cls:n.className?.toString().slice(0,80),opacity:cs.opacity,visibility:cs.visibility,display:cs.display,transform:cs.transform,rect:n.getBoundingClientRect().toJSON()});n=n.parentElement;}
  return {chain, text: el?.textContent?.slice(0,120), inner: el?.innerText?.slice(0,120), scrollY: window.scrollY, attrs:{inert:el?.hasAttribute('inert'),ariaHidden:el?.getAttribute('aria-hidden')}};
}));
await browser.close();
