import { Page, Locator, expect } from "@playwright/test";

export class BindAccountPage {
  readonly page: Page;

  readonly bindAccountCard: Locator;
  readonly membershipHeader: Locator;
  readonly osmImgLink: Locator;
  readonly otherImgLink: Locator;
  readonly bindAccountHeader: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.bindAccountCard = page.getByRole("link", { name: "Account ผูกบัญชี ธนาคาร" });
    this.membershipHeader = page.getByText("เลือกการเป็นสมาชิก");
    this.osmImgLink = page.getByRole("link", { name: "OSM-Img" });
    this.otherImgLink = page.getByRole("link", { name: "OTHER-Img" });
    this.bindAccountHeader = page.getByText("ผูกบัญชีเติมเงิน BeWallet");
    this.backButton = page.getByRole("img", { name: "Back" });
  }

  async openBindAccountPage() {
    await this.bindAccountCard.waitFor({ state: "visible" });
    await this.bindAccountCard.click();
  }

  async selectOsmImg() {
    await this.membershipHeader.waitFor({ state: "visible" });
    await this.osmImgLink.waitFor({ state: "visible" });
    await this.osmImgLink.click();
  }

  async selectOtherImg() {
    await this.membershipHeader.waitFor({ state: "visible" });
    await this.otherImgLink.waitFor({ state: "visible" });
    await this.otherImgLink.click();
  }

  async goBack() {
    await this.backButton.waitFor({ state: "visible" });
    await this.backButton.click();
  }

  async verifyBindAccountPageVisible() {
    await this.bindAccountHeader.waitFor({ state: "visible" });
    await expect(this.bindAccountHeader).toBeVisible();
  }

  async verifyOsmImgBanks() {
    await expect(this.page.getByRole("button", { name: "ธ.ก.ส." })).toBeVisible();
  }

  async verifyOtherImgBanks() {
    await expect(this.page.getByRole("button", { name: "ธ.ก.ส." })).toBeVisible();
    await expect(this.page.getByRole("button", { name: "กรุงไทย" })).toBeVisible();
  }
}
