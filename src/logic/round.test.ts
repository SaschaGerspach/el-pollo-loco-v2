import { describe, expect, test } from "vitest";
import { Round, type RoundRules } from "./round";

const RULES: RoundRules = {
  maxHealth: 100,
  hitDamage: 20,
  invulnerability: 1000,
  maxBottles: 5,
  coinBonus: 20,
};

describe("health", () => {
  test("starts full and loses 20 per hit", () => {
    const round = new Round(RULES, 6);
    expect(round.health).toBe(100);
    expect(round.hitPepe(0)).toEqual(["pepe-hit"]);
    expect(round.health).toBe(80);
  });

  test("ignores hits during the invulnerability time", () => {
    const round = new Round(RULES, 6);
    round.hitPepe(0);
    expect(round.hitPepe(999)).toEqual([]);
    expect(round.health).toBe(80);
    expect(round.hitPepe(1000)).toEqual(["pepe-hit"]);
    expect(round.health).toBe(60);
  });

  test("is lost at 0 health, without lives", () => {
    const round = new Round(RULES, 6);
    for (let hit = 0; hit < 4; hit++) round.hitPepe(hit * 1000);
    expect(round.hitPepe(4000)).toEqual(["pepe-hit", "pepe-died"]);
    expect(round.health).toBe(0);
    expect(round.lost).toBe(true);
    expect(round.hitPepe(5000)).toEqual([]);
  });
});

describe("coins", () => {
  test("count each collected coin", () => {
    const round = new Round(RULES, 6);
    expect(round.collectCoin()).toEqual(["coin-collected"]);
    expect(round.coins).toBe(1);
  });

  test("give 20 health when all are collected", () => {
    const round = new Round(RULES, 2);
    round.hitPepe(0);
    round.hitPepe(1000);
    round.collectCoin();
    expect(round.collectCoin()).toEqual(["coin-collected", "coins-complete"]);
    expect(round.health).toBe(80);
  });

  test("never raise health above the maximum", () => {
    const round = new Round(RULES, 1);
    round.collectCoin();
    expect(round.health).toBe(100);
  });
});

describe("bottles", () => {
  test("can carry at most five", () => {
    const round = new Round(RULES, 6);
    for (let i = 0; i < 5; i++) {
      expect(round.collectBottle()).toEqual(["bottle-collected"]);
    }
    expect(round.canCollectBottle()).toBe(false);
    expect(round.collectBottle()).toEqual([]);
    expect(round.bottles).toBe(5);
  });

  test("are used up by throwing", () => {
    const round = new Round(RULES, 6);
    round.collectBottle();
    expect(round.throwBottle()).toEqual(["bottle-thrown"]);
    expect(round.bottles).toBe(0);
    expect(round.throwBottle()).toEqual([]);
  });
});

describe("after losing", () => {
  test("nothing can be collected or thrown", () => {
    const round = new Round({ ...RULES, maxHealth: 20 }, 6);
    round.collectBottle();
    round.hitPepe(0);
    expect(round.collectCoin()).toEqual([]);
    expect(round.collectBottle()).toEqual([]);
    expect(round.throwBottle()).toEqual([]);
  });
});
