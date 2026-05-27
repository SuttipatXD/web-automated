import { test, expect } from "../fixtures/base.fixture";
import { Page } from "@playwright/test";
import { MainPage } from "../pages/main.page";
import { LoginPage } from "../pages/login.page";
import { OtpPage } from "../pages/otp.page";
import { ConsentPage } from "../pages/consent.page";
import { KycPhotoPage } from "../pages/kyc-photo.page";
import { PersonalInfoPage } from "../pages/personal-info.page";
import { AddressPage } from "../pages/address.page";
import { PinPage } from "../pages/pin.page";
import { ResultPage } from "../pages/result.page";
import rawData from "../utils/data.json";

const { personalInfo, addressData, files } = rawData.userD;
const { otp: otpCode, pin: pinCode } = rawData.common;

async function setupRegisterFull(
  page: Page,
  user: { phone: string; idcard: string },
) {
  await page.goto("/");
  await expect(page).toHaveTitle(/BeWallet/);
  await new MainPage(page).openRegisterPage();
  await new LoginPage(page).login(user.phone, user.idcard);
  return {
    otp: new OtpPage(page),
    consent: new ConsentPage(page),
    kycPhoto: new KycPhotoPage(page),
    personalInfoPage: new PersonalInfoPage(page),
    address: new AddressPage(page),
    pin: new PinPage(page),
    result: new ResultPage(page),
  };
}

test("@user userD Register → waiting status", async ({ page, user }) => {
  const { otp, consent, kycPhoto, personalInfoPage, address, pin, result } =
  await setupRegisterFull(page, user);

  await otp.processRegisterOtp(otpCode);
  await consent.processConsent();
  await personalInfoPage.fillPersonalInfo(personalInfo);
  await kycPhoto.processPhotoAndUpload(files.selfie, files.idCard);
  await address.fillRegistrationForm(addressData);
  await pin.setPin(pinCode);
  await result.resultWaitingStatus();
});
