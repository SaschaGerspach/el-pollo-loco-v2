import { Input, Scenes, type Scene } from "phaser";
import { CONTROLS, type Action } from "../config/controls";

export interface PlayerInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  throw: boolean;
}

// Turns keys into actions once per frame. A press is remembered from the key's down event,
// because a tap that starts and ends between two frames never shows up in isDown, and
// Phaser clears JustDown on key up.
export class Controls {
  private readonly keys = new Map<Action, Input.Keyboard.Key[]>();
  private readonly pressed = new Set<Action>();

  constructor(scene: Scene) {
    const keyboard = scene.input.keyboard!;
    for (const action of Object.keys(CONTROLS) as Action[]) {
      const keys = CONTROLS[action].map((code) => keyboard.addKey(code));
      const markPressed = () => this.pressed.add(action);
      for (const key of keys) key.on(Input.Keyboard.Events.DOWN, markPressed);
      scene.events.once(Scenes.Events.SHUTDOWN, () => {
        for (const key of keys)
          key.off(Input.Keyboard.Events.DOWN, markPressed);
      });
      this.keys.set(action, keys);
    }
  }

  read(): PlayerInput {
    const held = (action: Action) =>
      this.keys.get(action)!.some((key) => key.isDown);
    const pressed = (action: Action) => this.pressed.has(action);
    const input = {
      left: held("left"),
      right: held("right"),
      // Holding the jump key jumps again on landing, as in the old game.
      jump: held("jump") || pressed("jump"),
      throw: pressed("throw"),
    };
    this.pressed.clear();
    return input;
  }
}
