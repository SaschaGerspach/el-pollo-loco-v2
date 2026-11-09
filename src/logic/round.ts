import type { GameEvent } from "./events";

export interface RoundRules {
  maxHealth: number;
  hitDamage: number;
  invulnerability: number;
  maxBottles: number;
  coinBonus: number;
}

// State and rules of one round. Times are round time in milliseconds.
export class Round {
  readonly totalCoins: number;
  private readonly rules: RoundRules;
  private healthValue: number;
  private bottlesValue = 0;
  private coinsValue = 0;
  private invulnerableUntil = -Infinity;

  constructor(rules: RoundRules, totalCoins: number) {
    this.rules = rules;
    this.totalCoins = totalCoins;
    this.healthValue = rules.maxHealth;
  }

  get health() {
    return this.healthValue;
  }

  get bottles() {
    return this.bottlesValue;
  }

  get coins() {
    return this.coinsValue;
  }

  get lost() {
    return this.healthValue === 0;
  }

  canCollectBottle() {
    return !this.lost && this.bottlesValue < this.rules.maxBottles;
  }

  hitPepe(now: number): GameEvent[] {
    if (this.lost || now < this.invulnerableUntil) return [];
    this.healthValue = Math.max(0, this.healthValue - this.rules.hitDamage);
    this.invulnerableUntil = now + this.rules.invulnerability;
    return this.lost ? ["pepe-hit", "pepe-died"] : ["pepe-hit"];
  }

  collectCoin(): GameEvent[] {
    if (this.lost) return [];
    this.coinsValue += 1;
    if (this.coinsValue < this.totalCoins) return ["coin-collected"];
    this.healthValue = Math.min(
      this.rules.maxHealth,
      this.healthValue + this.rules.coinBonus,
    );
    return ["coin-collected", "coins-complete"];
  }

  collectBottle(): GameEvent[] {
    if (!this.canCollectBottle()) return [];
    this.bottlesValue += 1;
    return ["bottle-collected"];
  }

  throwBottle(): GameEvent[] {
    if (this.lost || this.bottlesValue === 0) return [];
    this.bottlesValue -= 1;
    return ["bottle-thrown"];
  }
}
