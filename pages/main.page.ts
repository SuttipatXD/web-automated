import { Page } from "@playwright/test";

export class MainPage {
  constructor(public page: Page) {}

  async goTo() {
    await this.page.goto('/', { waitUntil: 'networkidle' });
  }

  async clickElement(locator: string) {
    await this.page.waitForSelector(locator);
    await this.page.click(locator);
  }
}