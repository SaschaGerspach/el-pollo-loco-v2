import { expect, test, type Page } from "@playwright/test";
import { RULES } from "../../src/config/rules";
import { GROUND_Y } from "../../src/config/world";

function collectProblems(page: Page) {
  const problems: string[] = [];
  page.on("console", (message) => {
    // Software rendering in headless Chromium reports GPU stalls as warnings.
    const driverNoise = message.text().includes("GL Driver Message");
    if (
      message.type() === "error" ||
      (message.type() === "warning" && !driverNoise)
    ) {
      problems.push(message.text());
    }
  });
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) {
      problems.push(`${response.status()} ${response.url()}`);
    }
  });
  return problems;
}

// Reads the debug overlay, which shows Pepe's position and state and the round's values.
async function pepe(page: Page) {
  const text = (await page.locator("#debug").textContent()) ?? "";
  const [, x, y, state] = text.match(/x (\d+)\s+y (\d+)\s+(\S+)/) ?? [];
  const [, hp, bottles] = text.match(/hp (\d+)\s+bottles (\d+)/) ?? [];
  return {
    x: Number(x),
    y: Number(y),
    state,
    hp: Number(hp),
    bottles: Number(bottles),
  };
}

async function startGame(page: Page) {
  await page.goto("/?debug");
  // The canvas exists right after boot, so wait until the game scene is running.
  await expect(page.locator("#debug")).toContainText("idle");
}

test("game starts without console errors", async ({ page }) => {
  const problems = collectProblems(page);
  await startGame(page);

  expect((await pepe(page)).y).toBe(GROUND_Y);
  expect(problems).toEqual([]);
});

test("Pepe walks and jumps, even on a tap within one frame", async ({
  page,
}) => {
  await startGame(page);
  const start = await pepe(page);

  await page.keyboard.down("d");
  await expect.poll(async () => (await pepe(page)).x).toBeGreaterThan(start.x);
  await page.keyboard.up("d");
  await expect.poll(async () => (await pepe(page)).state).toBe("idle");

  // Dispatched in one task, so keydown and keyup arrive before the next frame.
  await page.evaluate(() => {
    const init = { key: " ", code: "Space", keyCode: 32 };
    window.dispatchEvent(new KeyboardEvent("keydown", init));
    window.dispatchEvent(new KeyboardEvent("keyup", init));
  });
  await expect.poll(async () => (await pepe(page)).y).toBeLessThan(GROUND_Y);
  await expect
    .poll(async () => (await pepe(page)).y, { timeout: 15_000 })
    .toBe(GROUND_Y);
});

test("Pepe collects bottles, gets hurt by a chicken and throws a bottle", async ({
  page,
}) => {
  await startGame(page);

  // The first bottles lie between Pepe's start and the first chicken.
  await page.keyboard.down("d");
  await expect.poll(async () => (await pepe(page)).bottles).toBeGreaterThan(0);
  await expect
    .poll(async () => (await pepe(page)).hp, { timeout: 15_000 })
    .toBeLessThan(RULES.maxHealth);
  await page.keyboard.up("d");

  const { bottles } = await pepe(page);
  await page.keyboard.press("e");
  await expect
    .poll(async () => (await pepe(page)).bottles)
    .toBeLessThan(bottles);
});
