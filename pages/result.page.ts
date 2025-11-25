// pages/otp.page.ts
import { Page, Locator, expect } from "@playwright/test";

export class ResultPage {
  readonly page: Page;

  readonly waitingMsg: Locator;
  readonly successMsg: Locator;
  readonly understoodButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.waitingMsg = page.locator("p", { hasText: "กำลังตรวจสอบการยืนยันตัวตน" });
    this.successMsg = page.locator("p", { hasText: "สมัคร BeWallet สำเร็จ" });
    this.understoodButton = page.getByRole("button", { name: "ฉันเข้าใจแล้ว" });
  }

  async waitForWaitingMessage() {
    await this.waitingMsg.waitFor({ state: "visible" });
    await this.waitingMsg.click();
  }

  async waitForSuccessMessage() {
    await this.successMsg.waitFor({ state: "visible" });
    await this.successMsg.click();
  }

  async clickUnderstood() {
    await this.understoodButton.waitFor({ state: "visible" });
    await this.understoodButton.click();
  }

  async resultWaitingStatus() {
    await this.waitForWaitingMessage();
    await this.clickUnderstood();
  }

    async resultSuccessStatus() {
    await this.waitForSuccessMessage();
    await this.clickUnderstood();
  }
}
