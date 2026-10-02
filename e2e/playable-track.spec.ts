import { expect, test, type Page } from "@playwright/test";

test("plays a deterministic mouse-saber slice through hit, miss, and end summary", async ({ page }) => {
  await page.goto("/?testMode=1");
  await page.getByTestId("mute-toggle").check();
  await page.getByTestId("reduced-motion-toggle").check();
  await page.getByTestId("start-button").click();

  await setElapsed(page, 2.1);
  await slash(page, { from: { x: 640, y: 250 }, to: { x: 640, y: 360 } });

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

async function slash(
  page: Page,
  points: {
    from: { x: number; y: number };
    to: { x: number; y: number };
  }
) {
  await page.mouse.move(points.from.x, points.from.y);
  await page.waitForTimeout(40);
  await page.mouse.move(points.to.x, points.to.y, { steps: 8 });
}
