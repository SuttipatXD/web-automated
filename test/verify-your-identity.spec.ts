import { test, expect } from "../fixtures/base.fixture";
import { Page } from "@playwright/test";
import { MainPage } from "../pages/main.page";
import { LoginPage } from "../pages/login.page";
import { OtpPage } from "../pages/otp.page";
import { ConsentPage } from "../pages/consent.page";
import { VerifyIdentityPage } from "../pages/verify-identity.page";
import { KycPhotoPage } from "../pages/kyc-photo.page";
import { PersonalInfoPage } from "../pages/personal-info.page";
import { AddressPage } from "../pages/address.page";
import { PinPage } from "../pages/pin.page";
import { ResultPage } from "../pages/result.page";
import rawData from "../utils/data.json";

const { personalInfo, addressData, files } = rawData.userD;
const { otp: otpCode } = rawData.common;

async function setupKYC(page: Page, user: { phone: string; idcard: string }) {
  await page.goto("/");
  await expect(page).toHaveTitle(/BeWallet/);
  await new MainPage(page).openKYCPage();
  await new LoginPage(page).login(user.phone, user.idcard);
  return {
    otp: new OtpPage(page),
    consent: new ConsentPage(page),
    verifyIdentity: new VerifyIdentityPage(page),
    kycPhoto: new KycPhotoPage(page),
    personalInfoPage: new PersonalInfoPage(page),
    address: new AddressPage(page),
    pin: new PinPage(page),
    result: new ResultPage(page),
  };
}

test("@user userA KYC → success status", async ({ page, user }) => {
  const { otp, result } = await setupKYC(page, user);
  await otp.processKYCOtp(otpCode);
  await result.resultSuccessStatus();
  await expect(page).toHaveURL(process.env.BASE_URL!);
});

test("@user userB KYC → user not found", async ({ page, user }) => {
  const { result } = await setupKYC(page, user);
  await result.resultNotFoundStatus();
});

test("@user userC KYC → waiting status", async ({ page, user }) => {
  const { otp, result } = await setupKYC(page, user);
  await otp.processKYCOtp(otpCode);
  await result.resultWaitingStatus();
  await expect(page).toHaveURL(process.env.BASE_URL!);
});

test("@user userE KYC → verify success status", async ({ page, user }) => {
  const { otp, consent, verifyIdentity, kycPhoto, personalInfoPage, address, result } =
    await setupKYC(page, user);

  await otp.processKYCOtp(otpCode);
  await consent.processConsent();
  await verifyIdentity.processVerifyIdentity();
  await kycPhoto.processPhotoAndUpload(files.selfie, files.idCard);
  await personalInfoPage.fillVerifyPersonalInfo(personalInfo);
  await address.fillVerifyForm(addressData);
  await result.resultWaitingStatus();
});
