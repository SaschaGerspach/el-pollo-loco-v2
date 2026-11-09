import { Input, Scene } from "phaser";
import { CONTROLS } from "../config/controls";
import { DEBUG, DEBUG_DEMO } from "../config/debug";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/display";
import { PEPE } from "../config/pepe";
import {
  CAMERA_PEPE_SCREEN_X,
  GROUND_THICKNESS,
  GROUND_Y,
  LEVEL_WIDTH,
} from "../config/world";
import { ParallaxBackground } from "../objects/ParallaxBackground";
import { Pepe, type PepeInput } from "../objects/Pepe";

type Keys = Record<keyof typeof CONTROLS, Input.Keyboard.Key>;

export class GameScene extends Scene {
  private background!: ParallaxBackground;
  private pepe!: Pepe;
  private keys!: Keys;
  private debugOverlay?: HTMLElement;
  // Sum of frame deltas; unlike this.time.now it stands still while the scene is paused.
  private elapsed = 0;

  constructor() {
    super("game");
  }

  create() {
    this.background = new ParallaxBackground(this);
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, GAME_HEIGHT);

    const ground = this.add
      .rectangle(
        LEVEL_WIDTH / 2,
        GROUND_Y + GROUND_THICKNESS / 2,
        LEVEL_WIDTH,
        GROUND_THICKNESS,
      )
      .setVisible(false);
    this.physics.add.existing(ground, true);

    this.pepe = new Pepe(this, PEPE.startX, GROUND_Y);
    this.physics.add.collider(this.pepe, ground);

    this.cameras.main
      .setBounds(0, 0, LEVEL_WIDTH, GAME_HEIGHT)
      .startFollow(this.pepe, true)
      .setFollowOffset(CAMERA_PEPE_SCREEN_X - GAME_WIDTH / 2, 0);

    this.keys = this.input.keyboard!.addKeys(CONTROLS) as Keys;

    if (DEBUG) {
      const overlay = createDebugOverlay();
      this.debugOverlay = overlay;
      this.events.once("shutdown", () => overlay.remove());
    }
  }

  update(_time: number, delta: number) {
    this.elapsed += delta;
    const { jump } = this.keys;
    const input: PepeInput = DEBUG_DEMO
      ? demoInput(this.elapsed)
      : {
          left: this.keys.left.isDown,
          right: this.keys.right.isDown,
          // A tap shorter than one frame only shows up as JustDown.
          jump: Input.Keyboard.JustDown(jump) || jump.isDown,
        };
    this.pepe.control(input, delta);
    this.background.update(this.cameras.main, this.elapsed);

    if (this.debugOverlay) {
      const fps = Math.round(this.game.loop.actualFps);
      const { x, y, currentState } = this.pepe;
      const time = Math.round(this.elapsed);
      this.debugOverlay.textContent = `fps ${fps}  x ${Math.round(x)}  y ${Math.round(y)}  ${currentState}  t ${time}`;
    }
  }
}

function demoInput(elapsed: number): PepeInput {
  const walkingRight = elapsed % 8000 < 4000;
  return {
    left: !walkingRight,
    right: walkingRight,
    jump: elapsed % 2000 < 50,
  };
}

function createDebugOverlay() {
  const overlay = document.createElement("pre");
  overlay.id = "debug";
  overlay.style.cssText =
    "position:fixed;top:0;left:0;margin:0;padding:4px 8px;font:14px monospace;" +
    "color:#fff;background:rgba(0,0,0,0.6);pointer-events:none";
  document.body.append(overlay);
  return overlay;
}
