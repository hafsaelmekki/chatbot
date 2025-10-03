import { test, expect } from "@playwright/test";

test.describe("Upload flow", () => {
  test("renders home page", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await expect(page.getByText("GlutenScan")).toBeVisible();
  });
});
