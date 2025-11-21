import { test, expect } from "../fixtures/base.fixture";

test("has title", async ({ page }) => {

  await Promise.all([
    page.waitForURL("**/"),
    page.goto("/"),
  ]);
  await expect(page).toHaveTitle(/BeWallet/);
  await page.waitForTimeout(3000);
});
