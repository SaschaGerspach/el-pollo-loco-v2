import { describe, expect, test } from "vitest";
import { nextPepeState, type PepeConditions } from "./pepeState";

const LONG_IDLE_DELAY = 7000;

const standing: PepeConditions = {
  onGround: true,
  moving: false,
  idleTime: 0,
  landingFinished: false,
};

describe("nextPepeState", () => {
  test("stays idle while standing still", () => {
    expect(nextPepeState("idle", standing, LONG_IDLE_DELAY)).toBe("idle");
  });

  test("switches to long idle after the delay", () => {
    const waited = { ...standing, idleTime: LONG_IDLE_DELAY };
    expect(nextPepeState("idle", waited, LONG_IDLE_DELAY)).toBe("long-idle");
  });

  test("walks when moving on the ground", () => {
    const moving = { ...standing, moving: true };
    expect(nextPepeState("idle", moving, LONG_IDLE_DELAY)).toBe("walk");
    expect(nextPepeState("long-idle", moving, LONG_IDLE_DELAY)).toBe("walk");
  });

  test("returns to idle when walking stops", () => {
    expect(nextPepeState("walk", standing, LONG_IDLE_DELAY)).toBe("idle");
  });

  test("jumps from any state when leaving the ground", () => {
    const airborne = { ...standing, onGround: false };
    for (const state of ["idle", "long-idle", "walk", "land"] as const) {
      expect(nextPepeState(state, airborne, LONG_IDLE_DELAY)).toBe("jump");
    }
  });

  test("lands when touching the ground after a jump", () => {
    const moving = { ...standing, moving: true };
    expect(nextPepeState("jump", standing, LONG_IDLE_DELAY)).toBe("land");
    expect(nextPepeState("jump", moving, LONG_IDLE_DELAY)).toBe("land");
  });

  test("keeps landing until the landing animation has finished", () => {
    const moving = { ...standing, moving: true };
    expect(nextPepeState("land", moving, LONG_IDLE_DELAY)).toBe("land");
    const finished = { ...moving, landingFinished: true };
    expect(nextPepeState("land", finished, LONG_IDLE_DELAY)).toBe("walk");
  });
});
