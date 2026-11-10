import {
  devices,
  expect,
  test,
  type CDPSession,
  type Page,
} from "@playwright/test";
import { GAME_WIDTH } from "../../src/config/display";
import { ENDBOSS } from "../../src/config/endboss";
import { LEVEL } from "../../src/config/level";
import { PEPE } from "../../src/config/pepe";
import { RULES } from "../../src/config/rules";
import {
  HUD,
  PAUSE_MENU,
  START_SCREEN,
  TOUCH_ZONES,
} from "../../src/config/ui";
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

// Turns game coordinates into page coordinates; the canvas is scaled to the window.
async function toPage(page: Page, x: number, y: number) {
  const box = (await page.locator("canvas").boundingBox())!;
  const scale = box.width / GAME_WIDTH;
  return { x: box.x + x * scale, y: box.y + y * scale };
}

async function clickGame(page: Page, x: number, y: number) {
  const point = await toPage(page, x, y);
  await page.mouse.click(point.x, point.y);
}

async function tapGame(page: Page, x: number, y: number) {
  const point = await toPage(page, x, y);
  await page.touchscreen.tap(point.x, point.y);
}

// Keeps one finger on each given point of the game until the next call; Playwright itself can
// only tap. Chromium adds, moves or lifts the fingers that changed since the previous call.
async function touchGame(
  page: Page,
  cdp: CDPSession,
  points: { x: number; y: number }[],
) {
  const touchPoints = await Promise.all(
    points.map(async ({ x, y }, index) => ({
      ...(await toPage(page, x, y)),
      id: index + 1,
    })),
  );
  await cdp.send("Input.dispatchTouchEvent", {
    type: touchPoints.length > 0 ? "touchStart" : "touchEnd",
    touchPoints,
  });
}

async function startGame(page: Page, url = "/?debug", press = clickGame) {
  await page.goto(url);
  const { x, y } = START_SCREEN.playButton;
  // Clicks Play until the start screen has loaded and the game scene runs.
  await expect
    .poll(async () => {
      await press(page, x, y);
      return page.locator("#debug").count();
    })
    .toBe(1);
  await expect(page.locator("#debug")).toContainText(" t ");
}

// The game clock stands still while the game scene is paused.
async function expectPaused(page: Page) {
  await expect
    .poll(async () => {
      const { time } = await pepe(page);
      await page.waitForTimeout(500);
      return (await pepe(page)).time - time;
    })
    .toBe(0);
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

test("turning the sound off survives a reload, and one click turns it on again", async ({
  page,
}) => {
  await page.goto("/?debug");
  const { x, y } = START_SCREEN.sound;
  const stored = () =>
    page.evaluate(() => localStorage.getItem("el-pollo-loco:muted"));
  // The toggle is right-aligned at x; clicking until the setting is stored also waits for loading.
  await expect
    .poll(async () => {
      await clickGame(page, x - 80, y);
      return stored();
    })
    .toBe("true");

  await page.reload();
  await startGame(page);
  await expect(page.locator("#debug")).toContainText("sound off");

  // Phaser reports a new mute state only once the audio has rendered it, so a single click must
  // switch the sound on without reading the state back.
  await page.keyboard.press("p");
  const soundSwitch = PAUSE_MENU.firstButtonY + 2 * PAUSE_MENU.buttonGap;
  await clickGame(page, GAME_WIDTH / 2, soundSwitch);
  await expect.poll(stored).toBe("false");
  await page.keyboard.press("p");
  await expect(page.locator("#debug")).toContainText("sound on");
});

test("the fullscreen switch enters and leaves fullscreen", async ({ page }) => {
  const problems = collectProblems(page);
  await page.goto("/");
  const { x, y } = START_SCREEN.fullscreen;
  const isFullscreen = () =>
    page.evaluate(() => document.fullscreenElement !== null);
  // The switch is left-aligned at x. Waiting after each click keeps a slow switch from being
  // clicked twice, and clicking until it reacts waits for the start screen.
  await expect
    .poll(
      async () => {
        await clickGame(page, x + 100, y);
        return page
          .waitForFunction(() => document.fullscreenElement !== null, null, {
            timeout: 3000,
          })
          .then(
            () => true,
            () => false,
          );
      },
      { timeout: 30_000 },
    )
    .toBe(true);

  await clickGame(page, x + 100, y);
  await expect.poll(isFullscreen).toBe(false);
  expect(problems).toEqual([]);
});

test("the web app manifest and the page icons load", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const href = await page.locator('link[rel="manifest"]').getAttribute("href");
  const manifestUrl = new URL(href!, page.url());
  const manifest = await (await request.get(manifestUrl.href)).json();
  const icons: string[] = [
    ...manifest.icons.map(
      (icon: { src: string }) => new URL(icon.src, manifestUrl).href,
    ),
    ...(await page
      .locator('link[rel="icon"], link[rel="apple-touch-icon"]')
      .evaluateAll((links) =>
        links.map((link) => (link as HTMLLinkElement).href),
      )),
  ];
  expect(icons).toHaveLength(4);
  for (const icon of icons) {
    // Vite answers unknown paths with index.html, so only the type tells a missing icon apart.
    const response = await request.get(icon);
    expect(response.headers()["content-type"], icon).toBe("image/png");
  }
});

test.describe("on a phone", () => {
  const { viewport, deviceScaleFactor, isMobile, hasTouch, userAgent } =
    devices["Pixel 7 landscape"];
  test.use({ viewport, deviceScaleFactor, isMobile, hasTouch, userAgent });
  const { symbols, steering } = TOUCH_ZONES;
  // On the walk zone, far enough from its edges for a push either way.
  const thumb = { x: 600, y: 850 };
  const push = 200;

  test("a thumb on the left half walks the way it is pushed, a second finger throws and jumps", async ({
    page,
  }) => {
    const problems = collectProblems(page);
    await startGame(page, "/?debug", tapGame);
    const cdp = await page.context().newCDPSession(page);

    // A thumb that only lands keeps Pepe standing.
    await touchGame(page, cdp, [thumb]);
    const start = await pepe(page);
    await page.waitForTimeout(500);
    expect((await pepe(page)).x).toBe(start.x);

    // The first bottles lie between Pepe's start and the first chicken.
    await touchGame(page, cdp, [{ ...thumb, x: thumb.x + push }]);
    await expect
      .poll(async () => (await pepe(page)).bottles)
      .toBeGreaterThan(0);
    await touchGame(page, cdp, []);
    const { bottles } = await pepe(page);
    await tapGame(page, symbols.throw.x, symbols.throw.y);
    await expect
      .poll(async () => (await pepe(page)).bottles)
      .toBeLessThan(bottles);

    // Back to the left, away from the chickens, which could defeat Pepe on a slow runner.
    const pushedLeft = { ...thumb, x: thumb.x - push };
    await touchGame(page, cdp, [thumb]);
    await touchGame(page, cdp, [pushedLeft]);
    await touchGame(page, cdp, [pushedLeft, symbols.jump]);
    await expect.poll(async () => (await pepe(page)).y).toBeLessThan(GROUND_Y);
    // Both fingers count: Pepe keeps walking in the air.
    const inAir = await pepe(page);
    await expect.poll(async () => (await pepe(page)).x).toBeLessThan(inAir.x);
    await touchGame(page, cdp, []);
    expect(problems).toEqual([]);
  });

  test("a thumb from the bar beside the game turns with a short rock and keeps walking over the other zones", async ({
    page,
  }) => {
    const problems = collectProblems(page);
    await startGame(page, "/?debug", tapGame);
    const cdp = await page.context().newCDPSession(page);
    // The thumb steers in CSS pixels. A rock just past the trail and the dead zone turns Pepe,
    // although it is shorter than the push before.
    const { width } = (await page.locator("canvas").boundingBox())!;
    const rock =
      ((steering.trail + 2 * steering.deadZone) * GAME_WIDTH) / width;

    // Left of the canvas, on the bar that the wider phone leaves beside the 16:9 game.
    const onBar = { x: -100, y: thumb.y };
    const pushed = { ...onBar, x: onBar.x + push };
    await touchGame(page, cdp, [onBar]);
    await touchGame(page, cdp, [pushed]);
    const start = await pepe(page);
    await expect
      .poll(async () => (await pepe(page)).x)
      .toBeGreaterThan(start.x);

    await touchGame(page, cdp, [{ ...pushed, x: pushed.x - rock }]);
    const turned = await pepe(page);
    await expect.poll(async () => (await pepe(page)).x).toBeLessThan(turned.x);

    // Slid over to the jump symbol, the thumb still walks instead of jumping.
    await touchGame(page, cdp, [symbols.jump]);
    const slid = await pepe(page);
    await expect.poll(async () => (await pepe(page)).x).toBeGreaterThan(slid.x);
    expect((await pepe(page)).y).toBe(GROUND_Y);
    await touchGame(page, cdp, []);
    expect(problems).toEqual([]);
  });

  test("turning the phone upright pauses the round behind a hint", async ({
    page,
  }) => {
    const problems = collectProblems(page);
    // Pepe starts with full bottles, so a throw after resuming would show.
    await startGame(page, "/?debug&boss", tapGame);
    const hint = page.locator("#rotate-hint");
    await expect(hint).toBeHidden();

    await page.setViewportSize({
      width: viewport.height,
      height: viewport.width,
    });
    await expect(hint).toBeVisible();
    await expect
      .poll(() =>
        hint
          .locator("img")
          .evaluate((img: HTMLImageElement) => img.naturalWidth),
      )
      .toBeGreaterThan(0);
    await expectPaused(page);

    await page.setViewportSize(viewport);
    await expect(hint).toBeHidden();
    const { time, bottles } = await pepe(page);
    // Resume lies in the throw zone, but the finger landed while the round was paused.
    await tapGame(page, GAME_WIDTH / 2 + 40, PAUSE_MENU.firstButtonY);
    await expect
      .poll(async () => (await pepe(page)).time)
      .toBeGreaterThan(time + 300);
    expect((await pepe(page)).bottles).toBe(bottles);

    const { x, y } = HUD.pauseButton;
    await tapGame(page, x, y);
    await expectPaused(page);
    expect(problems).toEqual([]);
  });
});

test.describe("on an iPhone", () => {
  const { viewport, deviceScaleFactor, isMobile, hasTouch, userAgent } =
    devices["iPhone 11 landscape"];
  test.use({ viewport, deviceScaleFactor, isMobile, hasTouch, userAgent });

  test("the game fits below Safari's toolbars", async ({ page }) => {
    // Safari sizes 100vh as if its toolbars were hidden, as tall as the whole screen: 414 px on
    // an iPhone 11 in landscape. Phaser measures 100vh with a ruler element on iOS, which gets
    // that height here.
    await page.addInitScript(() => {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync('div[style*="100vh"] { height: 414px !important; }');
      document.adoptedStyleSheets = [sheet];
    });
    await page.goto("/");
    await expect
      .poll(async () => {
        const box = (await page.locator("canvas").boundingBox())!;
        return box.y + box.height;
      })
      .toBeLessThanOrEqual(viewport.height);
  });

  test("the game fits the screen after a turn that iOS reports before Phaser measured", async ({
    page,
  }) => {
    await page.goto("/");
    const canvas = page.locator("canvas");
    // Fitted once, so the scale manager listens for turns.
    await expect
      .poll(async () => (await canvas.boundingBox())?.height)
      .toBe(viewport.height);

    // iOS gives the page its new size and reports the turn before Phaser, which measures every
    // half second, has seen that size. Both happen here in one task: the game area shrinks and
    // the screen reports a turn.
    await page.evaluate(() => {
      document.getElementById("game")!.style.bottom = "100px";
      Object.defineProperty(screen.orientation, "type", {
        value: "portrait-primary",
      });
      screen.orientation.dispatchEvent(new Event("change"));
    });
    const area = (await page.locator("#game").boundingBox())!;
    await expect
      .poll(async () => {
        const box = (await canvas.boundingBox())!;
        return (
          box.y >= area.y - 1 && box.y + box.height <= area.y + area.height + 1
        );
      })
      .toBe(true);
  });
});
