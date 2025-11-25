// pages/otp.page.ts
import { Page, Locator, expect } from "@playwright/test";

export class OtpPage {
  readonly page: Page;

  readonly pageKYCHeader: Locator;
  readonly pageRegisterHeader: Locator;
  readonly otpHeader: Locator;
  readonly otpInput: Locator;
  readonly confirmButton: Locator;
  readonly okButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageKYCHeader = page.getByText("ตรวจสอบผลสมัคร", { exact: true });
    this.pageRegisterHeader = page.getByText("สมัครสมาชิกบุญเติม", {
      exact: true,
    });
    this.otpHeader = page.locator("div.font-medium", {
      hasText: "กรอกรหัสยืนยันตัวตน",
    });
    this.otpInput = page.locator("input").first(); // ตัว OTP
    this.confirmButton = page.getByRole("button", { name: "ยืนยัน" });
    this.okButton = page.getByRole("button", { name: "ตกลง" });
  }

  async waitForHeaderPage(value: Boolean) {
    if (value === true) {
      await this.pageKYCHeader.waitFor({ state: "visible" });
    } else {
      await this.pageRegisterHeader.waitFor({ state: "visible" });
    }
  }

  async waitForOtpPage() {
    await this.otpHeader.waitFor({ state: "visible" });
    await this.otpHeader.click();
  }

  async fillOtp(otp: string) {
    await this.otpInput.waitFor({ state: "visible" });
    await this.otpInput.click();
    await this.otpInput.fill(otp);
  }

  async submitOtp(value: Boolean) {
     if (value === true) {
      await this.okButton.waitFor({ state: "visible" });
      await expect(this.okButton).toBeEnabled();
      await this.okButton.click();
     } else {
      await this.confirmButton.waitFor({ state: "visible" });
      await expect(this.confirmButton).toBeEnabled();
      await this.confirmButton.click();
     }
  }

  async processOtp(otp: string, value: Boolean) {
    await this.waitForHeaderPage(value);
    await this.waitForOtpPage();
    await this.fillOtp(otp);
    await this.submitOtp(value);
  }
}
