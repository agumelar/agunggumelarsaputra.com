const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  
  console.log('Navigating to login page...');
  await page.goto('https://www.agunggumelarsaputra.com/login');
  
  console.log('Filling login form...');
  await page.fill('input[type="email"]', 'siswa@gmail.com');
  // First try the password the user told me to use in this prompt
  await page.fill('input[type="password"]', 'user@gmai.com');
  await page.click('button[type="submit"]');
  
  await page.waitForTimeout(2000);
  
  let currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    console.log('Login failed with user@gmai.com, trying siswa@gmail.com...');
    await page.fill('input[type="password"]', 'siswa@gmail.com');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  }
  
  currentUrl = page.url();
  if (currentUrl.includes('/dashboard')) {
    console.log('Logged in successfully! Navigating to katalog modul...');
    await page.goto('https://www.agunggumelarsaputra.com/pembelajaran/orientasi-pplg');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const screenshotPath = 'C:\\Users\\agume\\.gemini\\antigravity\\brain\\f51dc6d5-35f9-4106-b4a6-4752814eedcd\\student-catalog.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to: ${screenshotPath}`);
  } else {
    console.error('Failed to login. Current URL:', currentUrl);
  }

  await browser.close();
})();
