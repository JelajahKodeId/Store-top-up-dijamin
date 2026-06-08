const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://127.0.0.1:8000/catalog');
  
  // click first product
  await page.click('a[href^="http://127.0.0.1:8000/products/"]');
  await page.waitForLoadState('networkidle');

  // fill whatsapp
  await page.fill('input[type="tel"]', '081234567890');
  
  // click duration
  const durations = await page.$$('div.grid > div:has-text("Hari")');
  if (durations.length > 0) {
     await durations[0].click({ force: true });
  }

  // select manual payment if it exists
  const manualMethod = await page.$('input[value^="manual_"]');
  if (manualMethod) {
    await manualMethod.click({ force: true });
  }

  // click checkout
  await page.click('button:has-text("Beli Sekarang")');
  
  // wait for modal and click confirm
  await page.waitForSelector('button:has-text("Konfirmasi & Bayar")');
  await page.click('button:has-text("Konfirmasi & Bayar")');
  
  // We want to see if it redirects
  page.on('framenavigated', frame => {
      console.log('Navigated to: ' + frame.url());
  });

  await page.waitForTimeout(5000);
  
  console.log("Final URL: ", page.url());
  
  await browser.close();
})();
