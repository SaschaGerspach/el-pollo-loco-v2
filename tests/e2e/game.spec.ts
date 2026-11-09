import { expect, test, type Page } from "@playwright/test";
import { GAME_WIDTH } from "../../src/config/display";
import { ENDBOSS } from "../../src/config/endboss";
import { LEVEL } from "../../src/config/level";
import { PEPE } from "../../src/config/pepe";
import { RULES } from "../../src/config/rules";
import { PAUSE_MENU, START_SCREEN } from "../../src/config/ui";
import { GROUND_Y } from "../../src/config/world";

// The CI runner renders in software, so a boss fight takes far longer there than locally.
const BOSS_FIGHT_TIME = 100_000;

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
  const [, hp, bottles, coins, chickens] =
    text.match(
      /hp (\d+)\s+bottles (\d+)\s+coins (\d+)\/\d+\s+chickens (\d+)/,
    ) ?? [];
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
    coins: Number(coins),
    chickens: Number(chickens),
    bossState,
    bossHp: Number(bossHp),
    bossGap: Number(bossX) - Number(x) - bodies,
  };
}

// Clicks a point given in game coordinates; the canvas is scaled to the window.
async function clickGame(page: Page, x: number, y: number) {
  const box = (await page.locator("canvas").boundingBox())!;
  const scale = box.width / GAME_WIDTH;
  await page.mouse.click(box.x + x * scale, box.y + y * scale);
}

async function startGame(page: Page, url = "/?debug") {
  await page.goto(url);
  const { x, y } = START_SCREEN.playButton;
  // Clicks Play until the start screen has loaded and the game scene runs.
  await expect
    .poll(async () => {
      await clickGame(page, x, y);
      return page.locator("#debug").count();
    })
    .toBe(1);
  await expect(page.locator("#debug")).toContainText(" t ");
}

async function expectFreshRound(page: Page, startX: number = PEPE.startX) {
  const round = await pepe(page);
  expect(round.x).toBe(startX);
  expect(round.hp).toBe(RULES.maxHealth);
  expect(round.coins).toBe(0);
  expect(round.chickens).toBe(LEVEL.chickens.length);
  expect(round.bossHp).toBe(RULES.bossMaxHealth);
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
  test.setTimeout(BOSS_FIGHT_TIME + 20_000);
  const problems = collectProblems(page);
  // Starts in front of the boss with full bottles.
  await startGame(page, "/?debug&boss");

  const deadline = Date.now() + BOSS_FIGHT_TIME;
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

test("Pepe loses when the boss reaches him, and R starts a fresh round", async ({
  page,
}) => {
  test.setTimeout(BOSS_FIGHT_TIME + 20_000);
  const problems = collectProblems(page);
  await startGame(page, "/?debug&boss");
  const start = await pepe(page);

  await expect
    .poll(async () => (await pepe(page)).state, { timeout: BOSS_FIGHT_TIME })
    .toBe("dead");
  expect((await pepe(page)).hp).toBe(0);

  // R works once the end screen is up, after the dead animation; on the slow CI runner that
  // takes longer than the default 5 s.
  await expect
    .poll(
      async () => {
        await page.keyboard.press("r");
        return (await pepe(page)).hp;
      },
      { timeout: 30_000 },
    )
    .toBe(RULES.maxHealth);
  await expectFreshRound(page, start.x);
  expect(problems).toEqual([]);
});

test("pausing stops the game until it is resumed", async ({ page }) => {
  await startGame(page);

  await page.keyboard.press("p");
  const paused = (await pepe(page)).time;
  await page.waitForTimeout(1000);
  expect((await pepe(page)).time).toBe(paused);

  await page.keyboard.press("p");
  await expect
    .poll(async () => (await pepe(page)).time)
    .toBeGreaterThan(paused);
});

test("restarting twice leaves nothing from the previous rounds", async ({
  page,
}) => {
  const problems = collectProblems(page);
  await startGame(page);

  for (let round = 0; round < 2; round++) {
    await page.keyboard.down("d");
    await expect
      .poll(async () => (await pepe(page)).bottles)
      .toBeGreaterThan(0);
    await page.keyboard.up("d");

    await page.keyboard.press("p");
    const restart = PAUSE_MENU.firstButtonY + PAUSE_MENU.buttonGap;
    await clickGame(page, GAME_WIDTH / 2, restart);
    await expect.poll(async () => (await pepe(page)).bottles).toBe(0);
    await expectFreshRound(page);
    await expect(page.locator("#debug")).toHaveCount(1);
  }
  expect(problems).toEqual([]);
});

test("the legal notice opens above the start screen", async ({ page }) => {
  await page.goto("/");
  const { x, y } = START_SCREEN.legal;
  const dialog = page.locator("#legal-page");
  await expect
    .poll(async () => {
      await clickGame(page, x + 60, y);
      return dialog.isVisible();
    })
    .toBe(true);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});
