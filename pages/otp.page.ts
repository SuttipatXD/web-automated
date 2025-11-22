// pages/otp.page.ts
import { Page, Locator, expect } from '@playwright/test';

export class OtpPage {
  readonly page: Page;

  readonly otpHeader: Locator;
  readonly otpInput: Locator;
  readonly confirmButton: Locator;
  readonly successMsg: Locator;
  readonly understoodButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.otpHeader = page.locator('div.font-medium', { hasText: 'กรอกรหัสยืนยันตัวตน' });
    this.otpInput = page.locator('input').first(); // ตัว OTP
    this.confirmButton = page.getByRole('button', { name: 'ตกลง' });
    this.successMsg = page.locator('p', { hasText: 'สมัคร BeWallet สำเร็จ' });
    this.understoodButton = page.getByRole('button', { name: 'ฉันเข้าใจแล้ว' });
  }

  async waitForOtpPage() {
    await this.otpHeader.waitFor({ state: 'visible' });
    await this.otpHeader.click();
  }

  async fillOtp(otp: string) {
    await this.otpInput.waitFor({ state: 'visible' });
    await this.otpInput.click();
    await this.otpInput.fill(otp);
  }

  async submitOtp() {
    await this.confirmButton.waitFor({ state: 'visible' });
    await expect(this.confirmButton).toBeEnabled();
    await this.confirmButton.click();
  }

  async waitForSuccessMessage() {
    await this.successMsg.waitFor({ state: 'visible' });
    await this.successMsg.click();
  }

  async clickUnderstood() {
    await this.understoodButton.waitFor({ state: 'visible' });
    await this.understoodButton.click();
  }

  async processOtp(otp: string) {
    await this.waitForOtpPage();
    await this.fillOtp(otp);
    await this.submitOtp();
    await this.waitForSuccessMessage();
    await this.clickUnderstood();
  }
}
