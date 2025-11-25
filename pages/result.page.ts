// pages/otp.page.ts
import { Page, Locator, expect } from "@playwright/test";

export class ResultPage {
  readonly page: Page;

  readonly notFoundMsg: Locator;
  readonly waitingMsg: Locator;
  readonly successMsg: Locator;
  readonly confirmButton: Locator;
  readonly understoodButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.notFoundMsg = page.locator("p", {
      hasText: "ไม่สามารถทำรายการได้ สอบถามรายละเอียดเพิ่มเติม โทร.1220",
    });
    this.waitingMsg = page.locator("p", {
      hasText: "กำลังตรวจสอบการยืนยันตัวตน",
    });
    this.successMsg = page.locator("p", { hasText: "สมัคร BeWallet สำเร็จ" });
    this.confirmButton = page.getByRole("button", { name: "ยืนยัน" });
    this.understoodButton = page.getByRole("button", { name: "ฉันเข้าใจแล้ว" });
  }

  async waitForNotFoundMessage() {
    await this.notFoundMsg.waitFor({ state: "visible" });
    await this.notFoundMsg.click();
  }

  async waitForWaitingMessage() {
    await this.waitingMsg.waitFor({ state: "visible" });
    await this.waitingMsg.click();
  }

  async waitForSuccessMessage() {
    await this.successMsg.waitFor({ state: "visible" });
    await this.successMsg.click();
  }

  async clickConfirm() {
    await this.confirmButton.waitFor({ state: "visible" });
    await this.confirmButton.click();
  }

  async clickUnderstood() {
    await this.understoodButton.waitFor({ state: "visible" });
    await this.understoodButton.click();
  }

  async resultNotFoundStatus() {
    await this.waitForNotFoundMessage();
    await this.clickConfirm();
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
