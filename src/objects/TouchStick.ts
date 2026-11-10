import { GameObjects, Math as PhaserMath, type Scene } from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/display";
import { TOUCH_ZONES } from "../config/ui";
import type { TouchState } from "../input/Controls";
import { TouchSymbol } from "./TouchSymbol";

// A ring around the walking thumb with an arrow on each side, lit for the way Pepe walks.
export class TouchStick extends GameObjects.Container {
  private readonly ring: GameObjects.Graphics;
  private readonly left: TouchSymbol;
  private readonly right: TouchSymbol;

  constructor(scene: Scene) {
    const { ring, outlineColor, circleColor, circleAlpha } = TOUCH_ZONES;
    super(scene, ring.x, ring.y);
    scene.add.existing(this);
    this.ring = scene.add
      .graphics()
      .fillStyle(circleColor, circleAlpha)
      .fillCircle(0, 0, ring.radius)
      .lineStyle(ring.lineWidth, outlineColor)
      .strokeCircle(0, 0, ring.radius);
    this.left = new TouchSymbol(scene, -ring.radius, 0, 180);
    this.right = new TouchSymbol(scene, ring.radius, 0, 0);
    this.add([this.ring, this.left, this.right]);
    this.show({ held: new Set() });
  }

  show({ held, stick }: TouchState) {
    const { ring, radius, alpha, pressedAlpha } = TOUCH_ZONES;
    this.ring.setAlpha(stick ? pressedAlpha : alpha);
    this.left.setPressed(held.has("left"));
    this.right.setPressed(held.has("right"));
    if (!stick) {
      this.setPosition(ring.x, ring.y).setScale(ring.restScale);
      return;
    }
    // A thumb on the bar beside the canvas or at its edge still sees the whole stick.
    const reach = ring.radius + radius;
    this.setScale(1).setPosition(
      PhaserMath.Clamp(stick.x, reach, GAME_WIDTH - reach),
      PhaserMath.Clamp(stick.y, ring.radius, GAME_HEIGHT - ring.radius),
    );
  }
}
