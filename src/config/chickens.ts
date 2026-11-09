import type { AnimationConfig } from "./animations";

export type ChickenKind = "chicken-normal" | "chicken-small";

// The old game moved chickens at about 26 px/s on a 720 px wide screen (× 2.67 → 70 px/s).
// Small chickens were just as fast there; the plan makes them faster.
export const CHICKENS = {
  "chicken-normal": {
    speed: 70,
    // Relative to the 226×221 frame.
    body: { width: 150, height: 150, offsetX: 38, offsetY: 55 },
    animations: {
      walk: { prefix: "walk/", frames: [1, 2, 3], frameRate: 5, repeat: -1 },
      dead: { prefix: "dead/", frames: [1], frameRate: 1, repeat: 0 },
    },
  },
  "chicken-small": {
    speed: 120,
    // Relative to the 182×162 frame.
    body: { width: 110, height: 110, offsetX: 36, offsetY: 38 },
    animations: {
      walk: { prefix: "walk/", frames: [1, 2, 3], frameRate: 8, repeat: -1 },
      dead: { prefix: "dead/", frames: [1], frameRate: 1, repeat: 0 },
    },
  },
} as const satisfies Record<
  ChickenKind,
  {
    speed: number;
    body: { width: number; height: number; offsetX: number; offsetY: number };
    animations: Record<string, AnimationConfig>;
  }
>;

// The old game removed defeated chickens after 5 s.
export const DEFEATED_CHICKEN_LIFETIME = 5000;
