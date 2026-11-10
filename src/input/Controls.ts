import { Input, Scenes, type Scene } from "phaser";
import { CONTROLS, type Action } from "../config/controls";
import {
  hasTouchZones,
  touchZoneAt,
  trailThumb,
  walkDirection,
  type TouchZone,
} from "./touch";

export interface PlayerInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  throw: boolean;
}

export interface TouchState {
  held: Set<Action>;
  // Where the walking thumb steers from, in game coordinates.
  stick?: { x: number; y: number };
}

interface Finger {
  zone: TouchZone;
  // Page coordinates, which are CSS pixels.
  x: number;
  y: number;
  // The x a walking finger steers from.
  anchor: number;
}

// Turns keys and touch zones into actions once per frame. A press is remembered from the key's
// or finger's down event, because a tap that starts and ends between two frames is never seen
// as held, and Phaser clears JustDown on key up.
export class Controls {
  private readonly scene: Scene;
  private readonly keys = new Map<Action, Input.Keyboard.Key[]>();
  private readonly pressed = new Set<Action>();
  // The fingers on the zones by touch identifier, in the order they landed.
  private readonly fingers = new Map<number, Finger>();

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
    if (hasTouchZones()) this.followFingers();
  }

  // The thumb that landed last walks, so a second one on the walk zone takes over.
  touchState(): TouchState {
    const held = new Set<Action>();
    let walker: Finger | undefined;
    for (const finger of this.fingers.values()) {
      if (finger.zone === "walk") walker = finger;
      else held.add(finger.zone);
    }
    if (!walker) return { held };
    const direction = walkDirection(walker.anchor, walker.x);
    if (direction) held.add(direction);
    const { scale } = this.scene;
    const stick = {
      x: scale.transformX(walker.anchor),
      y: scale.transformY(walker.y),
    };
    return { held, stick };
  }

  read(): PlayerInput {
    const touched = this.touchState().held;
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

  // Reads the touches of the whole page: Phaser does not follow a finger that lands on the bars
  // beside the canvas, where the outer zones continue.
  private followFingers() {
    const start = (event: TouchEvent) => {
      // A finger that lands on a menu, such as Resume in the throw zone, must not act once the
      // round goes on.
      if (!this.scene.sys.isActive()) return;
      const { scale } = this.scene;
      for (const touch of event.changedTouches) {
        const { pageX: x, pageY: y } = touch;
        const zone = touchZoneAt(scale.transformX(x), scale.transformY(y));
        if (!zone) continue;
        this.fingers.set(touch.identifier, { zone, x, y, anchor: x });
        if (zone !== "walk") this.pressed.add(zone);
      }
    };
    const move = (event: TouchEvent) => {
      for (const touch of event.changedTouches) {
        const finger = this.fingers.get(touch.identifier);
        if (!finger) continue;
        finger.x = touch.pageX;
        finger.y = touch.pageY;
        finger.anchor = trailThumb(finger.anchor, finger.x);
      }
    };
    const end = (event: TouchEvent) => {
      for (const touch of event.changedTouches) {
        this.fingers.delete(touch.identifier);
      }
    };
    const listening = new AbortController();
    const options = { passive: true, signal: listening.signal };
    window.addEventListener("touchstart", start, options);
    window.addEventListener("touchmove", move, options);
    window.addEventListener("touchend", end, options);
    window.addEventListener("touchcancel", end, options);
    this.scene.events.once(Scenes.Events.SHUTDOWN, () => listening.abort());
  }
}
