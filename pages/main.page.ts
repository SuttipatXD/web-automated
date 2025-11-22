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

  async clickAndFill(locator: string, text: string) {
    await this.page.waitForSelector(locator);
    await this.page.click(locator);
    await this.page.fill(locator, text);
  }
}