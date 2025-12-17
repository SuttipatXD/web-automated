import { test, expect } from "../fixtures/base.fixture";
import { MainPage } from '../pages/main.page';
import { LoginPage } from '../pages/login.page';
import { OtpPage } from '../pages/otp.page';
import { ResultPage } from "../pages/result.page";

test('@user userB User not Found flow', async ({ page, user }) => {

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
  await login.login(user.phone, user.idcard);

  // STEP 3 — Result
  await result.resultNotFoundStatus();
});
