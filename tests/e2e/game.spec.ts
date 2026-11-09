import { expect, test, type Page } from "@playwright/test";
import { ENDBOSS } from "../../src/config/endboss";
import { PEPE } from "../../src/config/pepe";
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

// Reads the debug overlay, which shows Pepe, the round's values and the boss.
async function pepe(page: Page) {
  const text = (await page.locator("#debug").textContent()) ?? "";
  const [, x, y, state, time] =
    text.match(/x (\d+)\s+y (\d+)\s+(\S+)\s+t (\d+)/) ?? [];
  const [, hp, bottles] = text.match(/hp (\d+)\s+bottles (\d+)/) ?? [];
  const [, bossState, bossHp, bossX] =
    text.match(/boss (\S+) (\d+) x (\d+)/) ?? [];
  const bodies = (ENDBOSS.body.width + PEPE.body.width) / 2;
  return {
    x: Number(x),
    y: Number(y),
    state,
    time: Number(time),
    hp: Number(hp),
    bottles: Number(bottles),
    bossState,
    bossHp: Number(bossHp),
    bossGap: Number(bossX) - Number(x) - bodies,
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

test("a bottle thrown onto the ground splashes without errors", async ({
  page,
}) => {
  const problems = collectProblems(page);
  await startGame(page);

  await page.keyboard.down("d");
  await expect.poll(async () => (await pepe(page)).bottles).toBe(1);
  await page.keyboard.up("d");
  // Turn left, where no chicken can be hit, so the bottle lands on the ground.
  await page.keyboard.press("a");
  await page.keyboard.press("e");
  await expect.poll(async () => (await pepe(page)).bottles).toBe(0);
  await page.waitForTimeout(2000);
  expect(problems).toEqual([]);
});

test("Pepe defeats the boss with five bottles", async ({ page }) => {
  test.setTimeout(60_000);
  const problems = collectProblems(page);
  // Starts in front of the boss with full bottles.
  await page.goto("/?debug&boss");
  await expect(page.locator("#debug")).toContainText("boss");

  const deadline = Date.now() + 45_000;
  let lastThrow = -Infinity;
  let state = await pepe(page);
  while (state.bossState !== "dead" && Date.now() < deadline) {
    if (state.bossState === "windup") {
      // Dodge the charge by running away, then face the boss again.
      await page.keyboard.down("a");
      while (["windup", "charge"].includes((await pepe(page)).bossState)) {
        await page.waitForTimeout(20);
      }
      await page.keyboard.up("a");
      await page.keyboard.press("d");
    } else if (
      state.bossGap <= 600 &&
      state.bottles > 0 &&
      state.time - lastThrow > 900
    ) {
      await page.keyboard.press("e");
      lastThrow = state.time;
    }
    await page.waitForTimeout(20);
    state = await pepe(page);
  }

  expect(state.bossState).toBe("dead");
  expect(state.bossHp).toBe(0);
  expect(problems).toEqual([]);
});

test("Pepe loses when the boss reaches him", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/?debug&boss");

  await expect
    .poll(async () => (await pepe(page)).state, { timeout: 45_000 })
    .toBe("dead");
  expect((await pepe(page)).hp).toBe(0);
});
