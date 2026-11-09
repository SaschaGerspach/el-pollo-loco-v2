import { describe, expect, test } from "vitest";
import {
  horizontalGap,
  nextBossState,
  type BossConditions,
  type BossRules,
} from "./bossState";

const RULES: BossRules = {
  alertDistance: 1200,
  attackRange: 200,
  windupTime: 700,
  chargeTime: 333,
  pauseTime: 1500,
  staggerTime: 500,
};

const far: BossConditions = {
  gap: 5000,
  stateTime: 0,
  alertFinished: false,
  hit: false,
  dead: false,
};

describe("nextBossState", () => {
  test("waits at the level end until Pepe comes near", () => {
    expect(nextBossState("waiting", far, RULES)).toBe("waiting");
    expect(nextBossState("waiting", { ...far, gap: 1200 }, RULES)).toBe(
      "alert",
    );
  });

  test("ignores hits while waiting", () => {
    expect(nextBossState("waiting", { ...far, hit: true }, RULES)).toBe(
      "waiting",
    );
  });

  test("alerts once, then chases", () => {
    expect(nextBossState("alert", far, RULES)).toBe("alert");
    expect(nextBossState("alert", { ...far, alertFinished: true }, RULES)).toBe(
      "chase",
    );
  });

  test("winds up when Pepe is in range", () => {
    expect(nextBossState("chase", { ...far, gap: 201 }, RULES)).toBe("chase");
    expect(nextBossState("chase", { ...far, gap: 200 }, RULES)).toBe("windup");
  });

  test("attacks only after the wind-up, then pauses and chases again", () => {
    const near = { ...far, gap: 0 };
    expect(nextBossState("windup", { ...near, stateTime: 699 }, RULES)).toBe(
      "windup",
    );
    expect(nextBossState("windup", { ...near, stateTime: 700 }, RULES)).toBe(
      "charge",
    );
    expect(nextBossState("charge", { ...near, stateTime: 333 }, RULES)).toBe(
      "pause",
    );
    expect(nextBossState("pause", { ...near, stateTime: 1499 }, RULES)).toBe(
      "pause",
    );
    expect(nextBossState("pause", { ...near, stateTime: 1500 }, RULES)).toBe(
      "chase",
    );
  });

  test("staggers when hit from any active state, then chases", () => {
    for (const state of [
      "alert",
      "chase",
      "windup",
      "charge",
      "pause",
    ] as const) {
      expect(nextBossState(state, { ...far, hit: true }, RULES)).toBe(
        "stagger",
      );
    }
    expect(nextBossState("stagger", { ...far, stateTime: 500 }, RULES)).toBe(
      "chase",
    );
  });

  test("stays dead", () => {
    const dead = { ...far, dead: true, hit: true, gap: 0 };
    expect(nextBossState("charge", dead, RULES)).toBe("dead");
    expect(nextBossState("dead", dead, RULES)).toBe("dead");
  });
});

describe("horizontalGap", () => {
  test("measures the space between two bodies", () => {
    expect(horizontalGap(0, 100, 300, 100)).toBe(200);
    expect(horizontalGap(300, 100, 0, 100)).toBe(200);
  });

  test("is 0 when the bodies overlap", () => {
    expect(horizontalGap(0, 100, 50, 100)).toBe(0);
  });
});
