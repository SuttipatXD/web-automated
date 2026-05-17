import { Page, Locator } from '@playwright/test';

export class KycPhotoPage {
  readonly page: Page;
  readonly pageOneHeading: Locator;
  readonly pageTwoHeading: Locator;
  readonly startPhotoButton: Locator;
  readonly takePhotoButton: Locator;
  readonly savePhotoButton: Locator;
  readonly errorHeading: Locator;
  readonly okButton: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageOneHeading = page.getByRole('heading', { name: 'ถ่ายภาพบัตรประชาชนของตนเอง' });
    this.pageTwoHeading = page.getByRole('heading', { name: 'การยืนยันตัวตนถ่ายรูปคู่บัตรประชาชน' });
    this.startPhotoButton = page.getByRole('button', { name: 'เริ่มถ่ายภาพ' });
    this.takePhotoButton = page.getByRole('button', { name: 'ถ่ายภาพ' });
    this.savePhotoButton = page.getByRole('button', { name: 'บันทึกภาพ' });
    this.errorHeading = page.getByRole('heading', { name: 'ไม่สามารถทำรายการได้' });
    this.okButton = page.getByRole('button', { name: 'ตกลง' });
    this.nextButton = page.getByRole('button', { name: 'ต่อไป' });
  }

  async attemptPhoto() {
    await this.pageOneHeading.waitFor({ state: 'visible' });
    await this.page.evaluate(() => {
      navigator.mediaDevices.getUserMedia = async () => {
        throw new DOMException('Permission denied', 'NotAllowedError');
      };
    });
    await this.startPhotoButton.click();
  }

  async dismissError() {
    await this.errorHeading.waitFor({ state: 'visible' });
    await this.errorHeading.click();
    await this.okButton.waitFor({ state: 'visible' });
    await this.okButton.click();
  }

  async attemptPhotoWithError() {
    await this.attemptPhoto();
    await this.dismissError();
  }

  async uploadSelfieWithIdCard(filePath: string) {
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      this.page.getByRole('img', { name: 'Upload Person with ID Card' }).click(),
    ]);
    await fileChooser.setFiles(filePath);
  }

  async uploadIdCard(filePath: string) {
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      this.page.getByRole('img', { name: 'Upload ID Card' }).click(),
    ]);
    await fileChooser.setFiles(filePath);
  }

  async processPhotoAndUpload(selfieFilePath: string, idCardFilePath: string) {
    await this.attemptPhotoWithError();
    await this.attemptPhotoWithError();
    await this.uploadSelfieWithIdCard(selfieFilePath);
    await this.uploadIdCard(idCardFilePath);
    await this.nextButton.waitFor({ state: 'visible' });
    await this.nextButton.click();
  }
}
