import { test, expect } from "@playwright/test";
import { LoginPage } from "./page-objects/LoginPage";

test.describe("Auth", () => {
  test("redirects unauthenticated user from protected page to login", async ({ page }) => {
    await page.goto("/generate");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page loads without redirect", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId("login-email")).toBeVisible();
  });

  test("register page loads without redirect", async ({ page }) => {
    await page.goto("/register");
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByRole("heading", { name: /utwórz konto/i })).toBeVisible();
  });

  test("shows error and stays on login when credentials are invalid", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.gotoLogin();

    const responsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/auth/login") && response.request().method() === "POST",
      { timeout: 15000 }
    );

    await loginPage.login("test@example.com", "wrong-password");
    await responsePromise;

    await expect(loginPage.getErrorAlert()).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("login API returns 200 for valid test user credentials when set", async ({ page }) => {
    const email = process.env.E2E_TEST_USER_EMAIL;
    const password = process.env.E2E_TEST_USER_PASSWORD;
    if (!email || !password) {
      test.skip();
      return;
    }
    const loginPage = new LoginPage(page);
    await loginPage.gotoLogin();

    const loginResponse = page.waitForResponse(
      (res) => res.url().includes("/api/auth/login") && res.request().method() === "POST",
      { timeout: 15000 }
    );

    await loginPage.login(email, password);
    const res = await loginResponse;
    expect(res.status()).toBe(200);
  });
});
