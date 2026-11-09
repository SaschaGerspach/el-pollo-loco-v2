import type { AnimationConfig } from "./animations";

export const PEPE = {
  startX: 2240,
  walkSpeed: 800,
  jumpVelocity: 1688,
  longIdleDelay: 7000,
  // Relative to the 287×564 frame, whose top 220 px are empty space.
  body: { width: 120, height: 330, offsetX: 84, offsetY: 234 },
  // Where a thrown bottle starts, relative to Pepe's feet, in the direction he faces.
  throwOrigin: { x: 110, y: -320 },
} as const;

export const PEPE_ANIMATIONS = {
  idle: {
    prefix: "idle/",
    frames: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    frameRate: 10,
    repeat: -1,
  },
  longIdle: {
    prefix: "long-idle/",
    frames: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    frameRate: 5,
    repeat: -1,
  },
  walk: {
    prefix: "walk/",
    frames: [1, 2, 3, 4, 5, 6],
    frameRate: 10,
    repeat: -1,
  },
  takeoff: { prefix: "jump/", frames: [1, 2, 3, 4], frameRate: 20, repeat: 0 },
  rise: { prefix: "jump/", frames: [5], frameRate: 10, repeat: 0 },
  fall: { prefix: "jump/", frames: [7, 6], frameRate: 5, repeat: -1 },
  land: { prefix: "jump/", frames: [8, 9], frameRate: 10, repeat: 0 },
  hurt: { prefix: "hurt/", frames: [1, 2, 3], frameRate: 6, repeat: 0 },
  dead: {
    prefix: "dead/",
    frames: [1, 2, 3, 4, 5, 6, 7],
    frameRate: 7,
    repeat: 0,
  },
} as const satisfies Record<string, AnimationConfig>;
