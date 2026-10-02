import { expect, test } from "@playwright/test";

test("boots the Neon Cursor start screen and WebGL arena", async ({ page }) => {
  await page.goto("/dev.html");

  await expect(page.getByRole("heading", { name: "Neon Cursor" })).toBeVisible();
  await expect(page.getByTestId("start-button")).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
});
