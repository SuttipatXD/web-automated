import { Page } from "@playwright/test";

export class MainPage {
  constructor(public page: Page) {}

  async goTo() {
    await this.page.goto('/');
  }

  async clickBanner(locator: string) {
    await this.page.click(locator);
  }
}