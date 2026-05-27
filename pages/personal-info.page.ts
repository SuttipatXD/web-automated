import { Page, Locator } from "@playwright/test";

export type PersonalInfo = {
  laserCode: string;
  title: string;
  firstName: string;
  lastName: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  email: string;
  purpose: string;
};

export class PersonalInfoPage {
  readonly page: Page;
  readonly laserInput: Locator;
  readonly titleSelect: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly birthYearSelect: Locator;
  readonly birthMonthSelect: Locator;
  readonly birthDaySelect: Locator;
  readonly emailInput: Locator;
  readonly purposeButton: Locator;
  readonly confirmButton: Locator;
  readonly nextButton: Locator;
  readonly contactInfoHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.contactInfoHeading = page.locator("p.text-lg", { hasText: "กรอกข้อมูลส่วนตัว" });
    this.laserInput = page.getByTestId("input-laser");
    this.titleSelect = page.getByText("คำนำหน้าชื่อ");
    this.firstNameInput = page.getByTestId("input-firstname");
    this.lastNameInput = page.getByTestId("input-lastname");
    this.birthYearSelect = page.getByText("ปีเกิด");
    this.birthMonthSelect = page.getByText("เดือนเกิด");
    this.birthDaySelect = page.getByText("วันเกิด");
    this.emailInput = page.getByTestId("input-email");
    this.purposeButton = page.getByRole("button", { name: "เลือกวัตถุประสงค์" });
    this.confirmButton = page.getByRole("button", { name: "ยืนยัน" });
    this.nextButton = page.getByTestId("button-next");
  }

  private async fillIdAndName(info: PersonalInfo) {
    await this.laserInput.waitFor({ state: "visible" });
    await this.laserInput.fill(info.laserCode);
    await this.titleSelect.click();
    await this.page.getByRole("option", { name: info.title }).click();
    await this.firstNameInput.fill(info.firstName);
    await this.lastNameInput.fill(info.lastName);
  }

  async fillPersonalInfo(info: PersonalInfo) {
    await this.contactInfoHeading.waitFor({ state: "visible" });
    await this.fillIdAndName(info);
    await this.birthYearSelect.click();
    await this.page.getByRole("option", { name: info.birthYear }).click();
    await this.birthMonthSelect.click();
    await this.page.getByRole("option", { name: info.birthMonth }).click();
    await this.birthDaySelect.click();
    await this.page.getByRole("option", { name: info.birthDay }).click();
    await this.emailInput.fill(info.email);
    await this.purposeButton.click();
    await this.page.getByRole("checkbox", { name: info.purpose }).check();
    await this.confirmButton.click();
    await this.nextButton.waitFor({ state: "visible" });
    await this.nextButton.click();
  }

  async fillVerifyPersonalInfo(info: PersonalInfo) {
    await this.contactInfoHeading.waitFor({ state: "visible" });
    await this.fillIdAndName(info);
    await this.page.getByTestId("select-birth-year").click();
    await this.page.getByRole("option", { name: info.birthYear }).click();
    await this.page.getByTestId("select-birth-month").click();
    await this.page.getByRole("option", { name: info.birthMonth }).click();
    await this.page.getByTestId("select-birth-day").click();
    await this.page.getByRole("option", { name: info.birthDay }).click();
    await this.emailInput.fill(info.email);
    await this.nextButton.waitFor({ state: "visible" });
    await this.nextButton.click();
  }
}
