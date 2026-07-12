import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 }).catch(e => console.log("GOTO ERROR:", e));
  
  const content = await page.evaluate(() => document.getElementById('root')?.innerHTML.substring(0, 500));
  console.log("ROOT CONTENT:", content);
  await browser.close();
})();
