import { test, expect } from "@playwright/test";

test.describe("E2E environment", () => {
  test("opens login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login/);
  });
});
