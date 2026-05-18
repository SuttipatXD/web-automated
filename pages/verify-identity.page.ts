import { Page, Locator } from '@playwright/test';

export class VerifyIdentityPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByText('กรุณายืนยันตัวตน');
    this.confirmButton = page.getByRole('link', { name: 'ตกลง' });
  }

  async processVerifyIdentity() {
    await this.heading.waitFor({ state: 'visible' });
    await this.confirmButton.waitFor({ state: 'visible' });
    await this.confirmButton.click();
  }
}
