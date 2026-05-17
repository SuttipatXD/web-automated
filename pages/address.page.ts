import { Page, Locator } from '@playwright/test';

export type AddressData = {
  address1: { houseNumber: string; province: string; district: string; subDistrict: string };
  address2: { houseNumber: string; province: string; district: string; subDistrict: string };
  income: string;
  incomeSource: string;
  occupation: string;
  company: string;
  workAddress: { houseNumber: string; province: string; district: string; subDistrict: string };
};

export class AddressPage {
  readonly page: Page;
  // NOTE: react-aria IDs are generated at runtime — update if the app version changes
  readonly houseNumber1: Locator;
  readonly houseNumber2: Locator;
  readonly workHouseNumber: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.houseNumber1 = page.getByPlaceholder('เลขที่, อาคาร').nth(0);
    this.houseNumber2 = page.getByPlaceholder('เลขที่, อาคาร').nth(1);
    this.workHouseNumber = page.getByPlaceholder('เลขที่, อาคาร').nth(2);
    this.nextButton = page.getByRole('button', { name: 'ต่อไป' });
  }

  private async selectDropdown(trigger: Locator, optionName: string) {
    await trigger.waitFor({ state: 'visible' });
    await trigger.click();
    await this.page.getByRole('option', { name: optionName }).click();
  }

  async fillAddress1(data: AddressData['address1']) {
    await this.houseNumber1.waitFor({ state: 'visible' });
    await this.houseNumber1.fill(data.houseNumber);
    await this.selectDropdown(this.page.getByText('จังหวัด').nth(1), data.province);
    await this.selectDropdown(this.page.getByText('อำเภอ/เขต').nth(1), data.district);
    await this.selectDropdown(this.page.getByText('ตำบล/แขวง').nth(1), data.subDistrict);
  }

  async fillAddress2(data: AddressData['address2']) {
    await this.houseNumber2.waitFor({ state: 'visible' });
    await this.houseNumber2.fill(data.houseNumber);
    await this.selectDropdown(this.page.getByText('จังหวัด').nth(2), data.province);
    await this.selectDropdown(this.page.getByText('อำเภอ/เขต').nth(2), data.district);
    await this.selectDropdown(this.page.getByText('ตำบล/แขวง').nth(2), data.subDistrict);
  }

  async fillIncomeAndOccupation(data: Pick<AddressData, 'income' | 'incomeSource' | 'occupation' | 'company'>) {
    await this.selectDropdown(this.page.getByText('ระบุรายได้'), data.income);
    await this.selectDropdown(this.page.getByText('ที่มาของรายได้', { exact: true }), data.incomeSource);
    await this.selectDropdown(this.page.getByText('เลือกอาชีพ'), data.occupation);
    await this.selectDropdown(this.page.getByText('เลือกชื่อบริษัท'), data.company);
  }

  async fillWorkAddress(data: AddressData['workAddress']) {
    await this.workHouseNumber.waitFor({ state: 'visible' });
    await this.workHouseNumber.fill(data.houseNumber);
    await this.selectDropdown(this.page.getByText('จังหวัด', { exact: true }), data.province);
    await this.selectDropdown(this.page.getByText('อำเภอ/เขต', { exact: true }), data.district);
    await this.selectDropdown(this.page.getByText('ตำบล/แขวง', { exact: true }), data.subDistrict);
  }

  async fillAddressForm(data: AddressData) {
    await this.fillAddress1(data.address1);
    await this.fillAddress2(data.address2);
    await this.fillIncomeAndOccupation(data);
    await this.fillWorkAddress(data.workAddress);
    await this.nextButton.waitFor({ state: 'visible' });
    await this.nextButton.click();
  }
}
