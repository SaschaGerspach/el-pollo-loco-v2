import type { Input, Scene } from "phaser";
import type { Action } from "../config/controls";
import { TOUCH_BUTTONS } from "../config/ui";

const ACTIONS = Object.keys(TOUCH_BUTTONS.buttons) as Action[];

// Touch buttons exist only on touch devices; the UI scene draws them, the controls read them.
export const hasTouchButtons = (scene: Scene) =>
  scene.sys.game.device.input.touch;

export function touchButtonAt(x: number, y: number) {
  return ACTIONS.find((action) => {
    const button = TOUCH_BUTTONS.buttons[action];
    return Math.hypot(x - button.x, y - button.y) <= TOUCH_BUTTONS.hitRadius;
  });
}

// Every finger counts, so buttons can be held together and a thumb can slide from one button
// to the next.
export function heldTouchButtons(pointers: readonly Input.Pointer[]) {
  const held = new Set<Action>();
  for (const pointer of pointers) {
    const action = pointer.isDown
      ? touchButtonAt(pointer.x, pointer.y)
      : undefined;
    if (action) held.add(action);
  }
  return held;
}
