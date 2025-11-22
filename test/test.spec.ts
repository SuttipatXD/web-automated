import { test, expect } from "../fixtures/base.fixture";
import { MainPage } from '../pages/main.page';
import { LoginPage } from '../pages/login.page';
import { OtpPage } from '../pages/otp.page';

test('BeWallet KYC Success flow', async ({ page }) => {

  await page.setViewportSize({ width: 1626, height: 1064 });

  // navigate
  await page.goto('/');
  await expect(page).toHaveTitle(/BeWallet/);

  // POM instances
  const main = new MainPage(page);
  const login = new LoginPage(page);
  const otp = new OtpPage(page);

  // STEP 1 — go to register page
  await main.openRegisterPage();

  // STEP 2 — login (phone + id card)
  await login.login(process.env.PHONE_NUMBER!, process.env.ID_CARD!);

  // STEP 3 — OTP
  await otp.processOtp('123456');

  // ผลลัพธ์สุดท้าย (กลับหน้าแรก)
  await expect(page).toHaveURL(process.env.BASE_URL!);
});
