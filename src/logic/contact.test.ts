import { describe, expect, test } from "vitest";
import { isStomp } from "./contact";

const TOLERANCE = 20;

describe("isStomp", () => {
  test("falling onto the enemy from above stomps it", () => {
    expect(
      isStomp(
        { pepePreviousBottom: 795, pepeVelocityY: 600, enemyTop: 800 },
        TOLERANCE,
      ),
    ).toBe(true);
  });

  test("feet slightly below the top still count", () => {
    expect(
      isStomp(
        { pepePreviousBottom: 815, pepeVelocityY: 600, enemyTop: 800 },
        TOLERANCE,
      ),
    ).toBe(true);
  });

  test("walking into the enemy is no stomp", () => {
    expect(
      isStomp(
        { pepePreviousBottom: 996, pepeVelocityY: 0, enemyTop: 800 },
        TOLERANCE,
      ),
    ).toBe(false);
  });

  test("falling against its side is no stomp", () => {
    expect(
      isStomp(
        { pepePreviousBottom: 900, pepeVelocityY: 600, enemyTop: 800 },
        TOLERANCE,
      ),
    ).toBe(false);
  });

  test("jumping up into the enemy is no stomp", () => {
    expect(
      isStomp(
        { pepePreviousBottom: 790, pepeVelocityY: -600, enemyTop: 800 },
        TOLERANCE,
      ),
    ).toBe(false);
  });
});
