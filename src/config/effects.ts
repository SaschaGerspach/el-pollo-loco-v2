import type { ChickenKind } from "./chickens";

// Feedback that makes hits visible, in game pixels and milliseconds.

// Pepe blinks while a hit keeps him from being hurt again.
export const PEPE_BLINK = { interval: 100, alpha: 0.3 };

// The boss lights up in this color when a bottle hits him.
export const BOSS_FLASH = { color: 0xffffff, duration: 100 };

// A hit on Pepe shakes the screen. The intensity is a share of the screen size.
export const HIT_SHAKE = {
  chicken: { duration: 150, intensity: 0.004 },
  boss: { duration: 300, intensity: 0.012 },
};

// Feathers fly from a defeated chicken, and from the boss where a bottle hits him.
export const FEATHERS = {
  size: { width: 32, height: 12 },
  speed: { min: 200, max: 500 },
  // Upwards in a wide fan; 270 points straight up.
  angle: { min: 200, max: 340 },
  gravity: 700,
  // The air slows a falling feather.
  maxFallSpeed: 260,
  lifespan: 1100,
  // The colors of the birds' plumage.
  kinds: {
    "chicken-normal": { color: 0x7a4a28, count: 8, scale: 1 },
    "chicken-small": { color: 0xf5d000, count: 6, scale: 0.7 },
    boss: { color: 0x7a4e26, count: 10, scale: 1.6 },
  } satisfies Record<
    ChickenKind | "boss",
    { color: number; count: number; scale: number }
  >,
};
