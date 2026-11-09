import { expect, test } from "@playwright/test";

test("game starts without console errors", async ({ page }) => {
  const problems: string[] = [];
  page.on("console", (message) => {
    const text = message.text();
    // Phaser reports missing textures and frames only as warnings.
    const missingAsset = /not found|missing/i.test(text);
    if (
      message.type() === "error" ||
      (message.type() === "warning" && missingAsset)
    ) {
      problems.push(text);
    }
  });
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400)
      problems.push(`${response.status()} ${response.url()}`);
  });

  await page.goto("/?debug");

  // The canvas exists right after boot, so wait until the game scene is running.
  await expect(page.locator("#debug")).toContainText("idle");
  expect(problems).toEqual([]);
});
