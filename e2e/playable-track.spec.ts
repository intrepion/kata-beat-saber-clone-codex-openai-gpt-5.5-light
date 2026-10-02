import { expect, test, type Page } from "@playwright/test";

test("plays a deterministic cursor-touch route through hit, miss, and end summary", async ({ page }) => {
  await page.goto("/dev.html?testMode=1");
  await page.getByTestId("mute-toggle").check();
  await page.getByTestId("reduced-motion-toggle").check();
  await page.getByTestId("start-button").click();

  await setElapsed(page, 2.1);
  await touch(page, { x: 640, y: 360 });

  await expect(page.getByTestId("score")).not.toHaveText("0");
  await expect(page.getByTestId("combo")).toHaveText("1");
  await expect(page.getByTestId("timing-feedback")).toContainText(/Clean cut|early|late/);

  await setElapsed(page, 3.95);
  await page.waitForFunction(() => window.neonSaberTest?.snapshot().misses === 1);

  await expect(page.getByTestId("misses")).toHaveText("1");
  await expect(page.getByTestId("combo")).toHaveText("0");

  const duration = await page.evaluate(() => window.neonSaberTest?.snapshot().trackDuration ?? 0);
  await setElapsed(page, duration + 0.1);

  await expect(page.getByRole("heading", { name: /Rank/ })).toBeVisible();
  await expect(page.getByTestId("restart-button")).toBeVisible();
  await page.screenshot({ path: "test-results/neon-saber-mvp.png", fullPage: true });

  await page.getByTestId("restart-button").click();
  await expect(page.getByRole("heading", { name: /Rank/ })).toBeHidden();
  await expect(page.getByTestId("score")).toHaveText("0");
  await expect(page.getByTestId("combo")).toHaveText("0");
  await expect(page.getByTestId("misses")).toHaveText("0");
});

async function setElapsed(page: Page, seconds: number) {
  await page.evaluate((elapsed) => window.neonSaberTest?.setElapsed(elapsed), seconds);
  await page.waitForTimeout(60);
}

async function touch(page: Page, point: { x: number; y: number }) {
  await page.mouse.move(point.x, point.y);
  await page.waitForTimeout(40);
}
