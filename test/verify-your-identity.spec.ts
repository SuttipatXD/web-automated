import { test, expect } from "../fixtures/base.fixture";
import { Page } from "@playwright/test";
import { MainPage } from "../pages/main.page";
import { LoginPage } from "../pages/login.page";
import { OtpPage } from "../pages/otp.page";
import { ResultPage } from "../pages/result.page";
import rawData from "../utils/data.json";

const { otp: otpCode } = rawData.common;

async function setupKYC(page: Page, user: { phone: string; idcard: string }) {
  await page.goto("/");
  await expect(page).toHaveTitle(/BeWallet/);
  await new MainPage(page).openKYCPage();
  await new LoginPage(page).login(user.phone, user.idcard);
  return { otp: new OtpPage(page), result: new ResultPage(page) };
}

test("@user userA KYC → success status", async ({ page, user }) => {
  const { otp, result } = await setupKYC(page, user);
  await otp.processOtp(otpCode, true);
  await result.resultSuccessStatus();
  await expect(page).toHaveURL(process.env.BASE_URL!);
});

test("@user userB KYC → user not found", async ({ page, user }) => {
  const { result } = await setupKYC(page, user);
  await result.resultNotFoundStatus();
});

test("@user userC KYC → waiting status", async ({ page, user }) => {
  const { otp, result } = await setupKYC(page, user);
  await otp.processOtp(otpCode, true);
  await result.resultWaitingStatus();
  await expect(page).toHaveURL(process.env.BASE_URL!);
});
