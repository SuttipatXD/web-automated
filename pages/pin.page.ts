import { Page, Locator } from "@playwright/test";

export class PinPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly confirmHeading: Locator;
  readonly pinInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "ตั้งรหัส PIN ใหม่" });
    this.confirmHeading = page.getByRole("heading", { name: "ยืนยันรหัส PIN" });
    this.pinInput = page.locator('[data-input-otp="true"]');
  }

  async fillPin(pin: string) {
    await this.heading.waitFor({ state: "visible" });
    await this.pinInput.pressSequentially(pin);
  }

  async confirmPin(pin: string) {
    await this.confirmHeading.waitFor({ state: "visible" });
    await this.pinInput.pressSequentially(pin);
  }

  async setPin(pin: string) {
    await this.fillPin(pin);
    await this.confirmPin(pin);
  }
}
