import { expect, test } from "@playwright/test";

test("boots the Neon Saber start screen and WebGL arena", async ({ page }) => {
  await page.goto("/dev.html");

  await expect(page.getByRole("heading", { name: "Neon Saber" })).toBeVisible();
  await expect(page.getByTestId("start-button")).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
});
