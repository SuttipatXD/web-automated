import { Page, Locator, expect } from '@playwright/test';

export class ConsentPage {
  readonly page: Page;
  readonly consentDataText: Locator;
  readonly lastTermsHeading: Locator;
  readonly consentButton: Locator;
  readonly personalDataText: Locator;
  readonly lastConsentHeading: Locator;
  readonly acceptAllCheckbox: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.consentDataText = page.getByText('ข้อกำหนดและเงื่อนไขการให้บริการ (Terms & Conditions)', { exact: true });
    this.lastTermsHeading = page.getByRole('heading', { name: 'กฎหมายที่ใช้บังคับ' });
    this.consentButton = page.getByRole('button', { name: 'ยินยอม', exact: true });
    this.personalDataText = page.getByText('การจัดการข้อมูลส่วนบุคคล', { exact: true });
    this.lastConsentHeading = page.getByText('https://www.boonterm.com/PDPA/', { exact: true });
    this.acceptAllCheckbox = page.getByRole('checkbox', { name: 'ยินยอมทั้งหมด' });
    this.confirmButton = page.getByRole('button', { name: 'ยืนยัน' });
  }

  private async isVisible(locator: Locator, timeout = 5000): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async acceptTermsAndConditions() {
    await this.consentDataText.waitFor({ state: 'visible' });
    await this.consentDataText.click();
    await this.lastTermsHeading.scrollIntoViewIfNeeded();
    await expect(this.consentButton).toBeEnabled();
    await this.consentButton.click();
  }

  async acceptPersonalDataConsent() {
    await this.personalDataText.waitFor({ state: 'visible' });
    await this.personalDataText.click();
    await this.lastConsentHeading.scrollIntoViewIfNeeded();
    await expect(this.acceptAllCheckbox).toBeEnabled();
    await this.acceptAllCheckbox.check();
    await expect(this.confirmButton).toBeEnabled();
    await this.confirmButton.click();
  }

  async processConsent() {
    if (await this.isVisible(this.consentDataText)) await this.acceptTermsAndConditions();
    if (await this.isVisible(this.personalDataText)) await this.acceptPersonalDataConsent();
  }
}
