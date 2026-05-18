import { Page, Locator, expect } from "@playwright/test";

export class OtpPage {
  readonly page: Page;
  readonly kycPageHeader: Locator;
  readonly registerPageHeader: Locator;
  readonly otpHeader: Locator;
  readonly otpInput: Locator;
  readonly confirmButton: Locator;
  readonly okButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.kycPageHeader = page.getByText("ตรวจสอบผลสมัคร", { exact: true });
    this.registerPageHeader = page.getByText("สมัครสมาชิกบุญเติม", { exact: true });
    this.otpHeader = page.locator("div.font-medium", { hasText: "กรอกรหัสยืนยันตัวตน" });
    this.otpInput = page.locator("input").first();
    this.confirmButton = page.getByRole("button", { name: "ยืนยัน" });
    this.okButton = page.getByRole("button", { name: "ตกลง" });
  }

  private async fillOtp(otp: string) {
    await this.otpHeader.waitFor({ state: "visible" });
    await this.otpHeader.click();
    await this.otpInput.waitFor({ state: "visible" });
    await this.otpInput.click();
    await this.otpInput.fill(otp);
  }

  async processKYCOtp(otp: string) {
    await this.kycPageHeader.waitFor({ state: "visible" });
    await this.fillOtp(otp);
    await this.okButton.waitFor({ state: "visible" });
    await expect(this.okButton).toBeEnabled();
    await this.okButton.click();
  }

  async processRegisterOtp(otp: string) {
    await this.registerPageHeader.waitFor({ state: "visible" });
    await this.fillOtp(otp);
    await this.confirmButton.waitFor({ state: "visible" });
    await expect(this.confirmButton).toBeEnabled();
    await this.confirmButton.click();
  }
}
