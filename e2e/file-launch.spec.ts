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

  await expect(page.getByRole("heading", { name: "Neon Saber" })).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.getByTestId("start-button")).toBeVisible();
  expect(consoleErrors.join("\n")).not.toContain("/src/main.ts");
  expect(failedRequests.join("\n")).not.toContain("/src/main.ts");
});
