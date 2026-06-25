import { test, expect } from "../fixtures/base.fixture";
import { Page } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { OtpPage } from "../pages/otp.page";
import { BindAccountPage } from "../pages/bind-account.page";
import rawData from "../utils/data.json";

const { otp: otpCode } = rawData.common;

async function setupBindAccount(page: Page, user: { phone: string; idcard: string }) {
  await page.goto("/");
  await expect(page).toHaveTitle(/BeWallet/);
  const bindAccount = new BindAccountPage(page);
  await bindAccount.openBindAccountPage();
  await new LoginPage(page).login(user.phone, user.idcard);
  return {
    otp: new OtpPage(page),
    bindAccount,
  };
}

test("@user userF Bind Account OSM", async ({ page, user }) => {
  const { otp, bindAccount } = await setupBindAccount(page, user);
  await otp.processBindAccountOtp(otpCode);
  await bindAccount.selectOsmImg();
  await bindAccount.verifyBindAccountPageVisible();
  await bindAccount.verifyOsmImgBanks();
});

test("@user userF Bind Account OTHER", async ({ page, user }) => {
  const { otp, bindAccount } = await setupBindAccount(page, user);
  await otp.processBindAccountOtp(otpCode);
  await bindAccount.selectOtherImg();
  await bindAccount.verifyBindAccountPageVisible();
  await bindAccount.verifyOtherImgBanks();
});
