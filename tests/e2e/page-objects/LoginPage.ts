import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  constructor(page: Page, baseURL = "http://localhost:3000") {
    super(page, baseURL);
  }

  async gotoLogin() {
    await this.goto("/login");
  }

  async fillEmail(email: string) {
    const emailInput = this.page.getByTestId("login-email");
    await emailInput.waitFor({ state: "visible" });
    await emailInput.click();
    await emailInput.clear();
    await emailInput.pressSequentially(email, { delay: 50 });
  }

  async fillPassword(password: string) {
    const passwordInput = this.page.getByTestId("login-password");
    await passwordInput.waitFor({ state: "visible" });
    await passwordInput.click();
    await passwordInput.clear();
    await passwordInput.pressSequentially(password, { delay: 50 });
  }

  async submit() {
    const submitButton = this.page.getByTestId("login-submit");
    await submitButton.waitFor({ state: "visible" });
    await submitButton.click();
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  getErrorAlert() {
    return this.page.getByTestId("login-error");
  }
}
