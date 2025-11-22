// pages/main.page.ts
import { Page, Locator, expect } from '@playwright/test';

export class MainPage {
  readonly page: Page;

  // SELECTORS
  readonly registerCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.registerCard = page.locator('a:nth-of-type(1) > div');
  }

  async openRegisterPage() {
    await this.registerCard.waitFor({ state: 'visible' });
    await this.registerCard.click();
  }
}
