import type { Page } from "@playwright/test";

export class BasePage {
  constructor(
    protected readonly page: Page,
    protected readonly baseURL = "http://localhost:3000"
  ) {}

  async goto(path: string) {
    await this.page.goto(`${this.baseURL}${path}`);
  }
}
