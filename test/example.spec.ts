import { test, expect } from "../fixtures/base.fixture";
import { MainPage } from '../pages/main.page';

test("has title", async ({ page }) => {
  const main = new MainPage(page);

  await Promise.all([
    page.waitForURL('**/'),
    page.goto('/'),
  ]);
  await expect(page).toHaveTitle(/BeWallet/);
  await main.clickElement('div.bg-gradient-to-r')
  // await page.waitForTimeout(3000)
});
