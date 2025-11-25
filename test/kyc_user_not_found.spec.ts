import { test, expect } from "../fixtures/base.fixture";
import { MainPage } from '../pages/main.page';
import { LoginPage } from '../pages/login.page';
import { OtpPage } from '../pages/otp.page';
import { ResultPage } from "../pages/result.page";

test('User not Found flow', async ({ page }) => {

  // navigate
  await page.goto('/');
  await expect(page).toHaveTitle(/BeWallet/);

  // POM instances
  const main = new MainPage(page);
  const login = new LoginPage(page);
  const otp = new OtpPage(page);
  const result = new ResultPage(page);
  
  // STEP 1 — go to register page
  await main.openKYCPage();

  // STEP 2 — login (phone + id card)
  await login.login(process.env.USER_NOT_FOUND_PHONE_NUMBER!, process.env.USER_NOT_FOUND_ID_CARD!);

  // STEP 3 — Result
  await result.resultNotFoundStatus();
});
