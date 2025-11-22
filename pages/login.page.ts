// pages/login.page.ts
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  readonly phoneInput: Locator;
  readonly idCardInput: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.phoneInput = page.getByLabel('หมายเลขโทรศัพท์');
    this.idCardInput = page.getByLabel('หมายเลขบัตรประชาชน');
    this.nextButton = page.getByRole('button', { name: 'ต่อไป' });
  }

  async fillPhone(phone: string) {
    if (!phone || phone.trim() === '') {
      throw new Error('PHONE_NUMBER is not defined or empty in environment variables');
    }

    await this.phoneInput.waitFor({ state: 'visible' });
    await this.phoneInput.fill(phone);
  }

  async fillIdCard(idCard: string) {
    if (!idCard || idCard.trim() === '') {
      throw new Error('ID_CARD is not defined or empty in environment variables');
    }

    await this.idCardInput.waitFor({ state: 'visible' });
    await this.idCardInput.fill(idCard);
  }

  async clickNext() {
    await this.nextButton.waitFor({ state: 'visible' });
    await expect(this.nextButton).toBeEnabled();
    await this.nextButton.click();
  }

  async login(phone: string, idCard: string) {
    await this.fillPhone(phone);
    await this.fillIdCard(idCard);
    await this.clickNext();
  }
}
