import type { AnimationConfig } from "./animations";

const chargeDistance = 300;
const chargeSpeed = 900;

export const ENDBOSS = {
  // Old position x = 2600, converted like the level positions.
  x: 8851,
  // The frame extends 68 px below the feet.
  feetOffset: 68,
  // Relative to the 773×901 frame; centered, so mirroring the sprite keeps it in place.
  body: { width: 420, height: 560, offsetX: 176, offsetY: 260 },
  // Gaps between the bodies of the boss and Pepe. At 1200 px the boss comes into view,
  // like the old alert distance of 550 px.
  alertDistance: 1200,
  attackRange: 200,
  chaseSpeed: 200,
  windupTime: 700,
  chargeSpeed,
  // The charge ends after a fixed time, so a wall cannot stop it from ending.
  chargeTime: (chargeDistance / chargeSpeed) * 1000,
  pauseTime: 1500,
  staggerTime: 500,
} as const;

export const ENDBOSS_ANIMATIONS = {
  stand: { prefix: "walk/", frames: [1], frameRate: 1, repeat: 0 },
  walk: { prefix: "walk/", frames: [1, 2, 3, 4], frameRate: 6, repeat: -1 },
  alert: {
    prefix: "alert/",
    frames: [1, 2, 3, 4, 5, 6, 7, 8],
    frameRate: 8,
    repeat: 0,
  },
  windup: {
    prefix: "attack/",
    frames: [1, 2, 3, 4],
    frameRate: 6,
    repeat: 0,
  },
  charge: { prefix: "attack/", frames: [5, 6, 7], frameRate: 10, repeat: -1 },
  recover: { prefix: "attack/", frames: [8], frameRate: 1, repeat: 0 },
  hurt: { prefix: "hurt/", frames: [1, 2, 3], frameRate: 6, repeat: 0 },
  dead: { prefix: "dead/", frames: [1, 2, 3], frameRate: 4, repeat: 0 },
} as const satisfies Record<string, AnimationConfig>;
