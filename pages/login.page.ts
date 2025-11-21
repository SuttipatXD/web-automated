import { Page } from "@playwright/test";

export class LoginPage {
  constructor(public page: Page) {}

  async logIn(phone: string, idcard: string) {
    await this.page.fill("#phone", phone);
    await this.page.fill("#idcard", idcard);
    await this.page.click("#submit");
  }
}
