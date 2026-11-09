import { Input, Scenes, type Scene } from "phaser";
import { CONTROLS, type Action } from "../config/controls";
import { hasTouchButtons, heldTouchButtons, touchButtonAt } from "./touch";

export interface PlayerInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  throw: boolean;
}

// Turns keys and touch buttons into actions once per frame. A press is remembered from the
// key's or finger's down event, because a tap that starts and ends between two frames never
// shows up in isDown, and Phaser clears JustDown on key up.
export class Controls {
  private readonly scene: Scene;
  private readonly keys = new Map<Action, Input.Keyboard.Key[]>();
  private readonly pressed = new Set<Action>();
  private readonly touch: boolean;

  constructor(scene: Scene) {
    this.scene = scene;
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

    this.touch = hasTouchButtons(scene);
    if (this.touch) {
      // The input plugin removes its listeners itself when the scene shuts down.
      scene.input.on(Input.Events.POINTER_DOWN, (pointer: Input.Pointer) => {
        const action = touchButtonAt(pointer.x, pointer.y);
        if (action) this.pressed.add(action);
      });
    }
  }

  read(): PlayerInput {
    const touched = this.touch
      ? heldTouchButtons(this.scene.input.manager.pointers)
      : new Set<Action>();
    const held = (action: Action) =>
      touched.has(action) || this.keys.get(action)!.some((key) => key.isDown);
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
