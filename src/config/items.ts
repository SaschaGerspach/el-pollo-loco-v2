import type { AnimationConfig } from "./animations";

// Bodies are centered on the 225×226 coin frame and the 228×228 bottle frames, whose
// visible parts are much smaller than the frames.
export const COIN = {
  frame: "1",
  body: { width: 70, height: 70 },
} as const;

export const GROUND_BOTTLE = {
  frames: ["ground/1", "ground/2"],
  body: { width: 130, height: 160 },
} as const;

// The old game threw with the jump speed upwards (750 px/s × 2.25) and 200 px/s sideways
// (× 2.67).
export const THROWN_BOTTLE = {
  velocityX: 534,
  velocityY: -1688,
  body: { width: 80, height: 80 },
} as const;

export const BOTTLE_ANIMATIONS = {
  rotation: {
    prefix: "rotation/",
    frames: [1, 2, 3, 4],
    frameRate: 8,
    repeat: -1,
  },
  splash: {
    prefix: "splash/",
    frames: [1, 2, 3, 4, 5, 6],
    frameRate: 10,
    repeat: 0,
  },
} as const satisfies Record<string, AnimationConfig>;
