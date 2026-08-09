import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to login...');
    await page.goto('http://localhost:4321/login');
    await page.fill('#email', 'siswa@gmail.com');
    await page.fill('#password', 'user@gmai.com');
    
    console.log('Submitting login...');
    await page.click('button[type="submit"]');
    
    console.log('Waiting for navigation to dashboard...');
    await page.waitForURL('**/dashboard**', { timeout: 10000 }).catch(() => console.log('Timeout waiting for dashboard, but will proceed...'));
    
    console.log('Navigating to /pembelajaran...');
    await page.goto('http://localhost:4321/pembelajaran');
    
    // Wait for the page to load
    await page.waitForTimeout(2000);
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'C:\\Users\\agume\\.gemini\\antigravity\\brain\\f51dc6d5-35f9-4106-b4a6-4752814eedcd\\student-catalog.png', fullPage: true });
    console.log('Screenshot saved to artifact dir.');

  } catch (error) {
    console.error('Error during screenshot:', error);
  } finally {
    await browser.close();
  }
})();
