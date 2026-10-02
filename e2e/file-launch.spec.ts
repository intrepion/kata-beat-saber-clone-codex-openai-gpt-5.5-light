import { expect, test } from "@playwright/test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

test("boots from a direct file URL without Vite module CORS failures", async ({ page }) => {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("requestfailed", (request) => {
    failedRequests.push(`${request.url()} ${request.failure()?.errorText ?? ""}`);
  });

  await page.goto(pathToFileURL(resolve("index.html")).href);

  await expect(page.getByRole("heading", { name: "Neon Cursor" })).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.getByTestId("start-button")).toBeVisible();
  expect(consoleErrors.join("\n")).not.toContain("/src/main.ts");
  expect(failedRequests.join("\n")).not.toContain("/src/main.ts");
});

test("starts real-time block spawning from direct file launch", async ({ page }) => {
  await page.goto(`${pathToFileURL(resolve("index.html")).href}?debug=1`);

  await page.getByTestId("mute-toggle").check();
  await page.getByTestId("start-button").click();
  await page.waitForFunction(() => (window.neonSaberTest?.snapshot().activeBlocks ?? 0) > 0, null, {
    timeout: 5000
  });

  const snapshot = await page.evaluate(() => window.neonSaberTest?.snapshot());
  expect(snapshot?.audioStarted).toBe(true);
  expect(snapshot?.activeBlocks).toBeGreaterThan(0);
});
