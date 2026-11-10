import type { Scene } from "phaser";
import { TOUCH_ZONES } from "../config/ui";

export type TouchZone = (typeof TOUCH_ZONES.zones)[number]["zone"];

// Only touch devices get zones; the UI scene draws them, the controls read them.
export const hasTouchZones = (scene: Scene) =>
  scene.sys.game.device.input.touch;

// Game coordinates continue beyond the canvas, so a finger on the bars beside it gets an x below
// 0 or above the game width and lands in an outer zone.
export function touchZoneAt(x: number, y: number): TouchZone | undefined {
  if (y < TOUCH_ZONES.top) return undefined;
  return TOUCH_ZONES.zones.find((zone) => x < zone.until)?.zone;
}

// The point a walking thumb at x steers from, after it was at anchor.
export function trailThumb(anchor: number, x: number) {
  const { trail } = TOUCH_ZONES.steering;
  return Math.min(Math.max(anchor, x - trail), x + trail);
}

export function walkDirection(
  anchor: number,
  x: number,
): "left" | "right" | undefined {
  const { deadZone } = TOUCH_ZONES.steering;
  if (x - anchor >= deadZone) return "right";
  if (anchor - x >= deadZone) return "left";
  return undefined;
}
