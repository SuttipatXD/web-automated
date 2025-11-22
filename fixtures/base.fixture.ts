import { test as base } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    // ตั้งค่า viewport เป็น Full HD
    await page.setViewportSize({
      width: 1920,
      height: 1080,
    });

    // ปิด animation (ลด flaky)
    await page.addStyleTag({
      content: `* { transition-duration: 0s !important; animation: none !important; }`,
    });

    await use(page);
  },
});

export const expect = test.expect;
