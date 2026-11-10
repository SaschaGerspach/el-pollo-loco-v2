import { GameObjects, Math as PhaserMath, type Scene } from "phaser";
import { TOUCH_ZONES } from "../config/ui";

// An arrow pointing right, in units of half its length.
const ARROW = [
  [-1, -0.22],
  [0.1, -0.22],
  [0.1, -0.62],
  [1, 0],
  [0.1, 0.62],
  [0.1, 0.22],
  [-1, 0.22],
];

// The old touch arrows as vector art, so they stay sharp at any size.
export class TouchSymbol extends GameObjects.Graphics {
  constructor(scene: Scene, x: number, y: number, angle: number) {
    super(scene, { x, y });
    scene.add.existing(this);
    const { radius, arrowColor, outlineColor, circleColor, circleAlpha } =
      TOUCH_ZONES;
    this.fillStyle(circleColor, circleAlpha).fillCircle(0, 0, radius);
    const halfLength = radius * 0.6;
    const points = ARROW.map(
      ([x, y]) => new PhaserMath.Vector2(x * halfLength, y * halfLength),
    );
    this.fillStyle(arrowColor).fillPoints(points, true);
    this.lineStyle(radius * 0.07, outlineColor).strokePoints(points, true);
    this.setAngle(angle);
    this.setPressed(false);
  }

  setPressed(pressed: boolean) {
    this.setAlpha(pressed ? TOUCH_ZONES.pressedAlpha : TOUCH_ZONES.alpha);
  }
}
