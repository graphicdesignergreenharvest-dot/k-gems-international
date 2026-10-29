// Playwright script to capture console errors and network failures on the dev server
process.chdir(__dirname);
import { chromium } from 'playwright';
(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    const responseErrors = [];
    page.on('response', response => {
        if (!response.ok()) responseErrors.push(`${response.status()} ${response.url()}`);
    });
    try {
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
    } catch (e) {
        consoleErrors.push('Navigation error: ' + e.message);
    }
    console.log('=== Console Errors ===');
    consoleErrors.forEach(e => console.log(e));
    console.log('=== Network Errors ===');
    responseErrors.forEach(e => console.log(e));
    await browser.close();
})();
