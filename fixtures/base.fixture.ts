import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {

    // ปิด animation (ลด flaky)
    await page.addStyleTag({
      content: `* { transition-duration: 0s !important; animation: none !important; }`
    });

    // กัน cache
    await page.route('**/*', route => {
      route.continue({
        headers: { 'Cache-Control': 'no-cache' }
      });
    });

    await use(page);
  }
});

export const expect = test.expect;
