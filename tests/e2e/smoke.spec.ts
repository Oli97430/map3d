import { test, expect } from "@playwright/test";

test("home loads, title visible, search bar present", async ({ page }) => {
  await page.goto("/");

  // Hero title appears after splash
  await expect(page.locator("text=Generate a 3D map")).toBeVisible({ timeout: 10_000 });

  // GitHub button is present
  await expect(page.getByRole("button", { name: /GitHub/i })).toBeVisible();

  // Search input
  await expect(page.getByPlaceholder(/Search address/i)).toBeVisible();
});

test("city presets pill exists if rendered", async ({ page }) => {
  await page.goto("/");
  // Hero should have the OpenStreetMap pill
  await expect(page.locator("text=OpenStreetMap").first()).toBeVisible({ timeout: 10_000 });
});

test("opens shortcuts modal on '?' key", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await page.locator("body").click(); // ensure focus
  await page.keyboard.press("Shift+/"); // '?'
  await expect(page.locator("text=Keyboard shortcuts")).toBeVisible({ timeout: 5_000 });
});
