export const ATLAS_PATH = "assets/atlases";

// Sprite scale per atlas: old display size × 2.25 (480 → 1080 px height) divided by the source
// size. Where the old game drew a sprite distorted, the larger of the width and height factor
// is used. scripts/build-atlases.js reads these values; rebuild the atlases after a change.
export const ATLAS_SCALES = {
  pepe: 0.47,
  "chicken-normal": 0.91,
  "chicken-small": 0.77,
  endboss: 0.74,
  bottle: 0.57,
  coin: 0.75,
  hud: 0.72,
  ui: 1,
} as const;

export const ATLASES = Object.keys(
  ATLAS_SCALES,
) as (keyof typeof ATLAS_SCALES)[];
