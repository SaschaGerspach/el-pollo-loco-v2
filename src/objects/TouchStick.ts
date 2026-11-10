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
    const { ring, outlineColor } = TOUCH_ZONES;
    super(scene, ring.x, ring.y);
    scene.add.existing(this);
    // Only an outline: a filled disk stood out too much in the middle of the game.
    this.ring = scene.add
      .graphics()
      .lineStyle(ring.lineWidth, outlineColor)
      .strokeCircle(0, 0, ring.radius);
    this.left = new TouchSymbol(scene, -ring.radius, 0, 180, ring.arrowRadius);
    this.right = new TouchSymbol(scene, ring.radius, 0, 0, ring.arrowRadius);
    this.add([this.ring, this.left, this.right]);
    this.show({ held: new Set() });
  }

  show({ held, stick }: TouchState) {
    const { ring, alpha, pressedAlpha } = TOUCH_ZONES;
    const { x, y } = stick ?? ring;
    // A thumb on the bar beside the canvas or at its edge still sees the whole stick.
    const reach = ring.radius + ring.arrowRadius;
    this.setPosition(
      PhaserMath.Clamp(x, reach, GAME_WIDTH - reach),
      PhaserMath.Clamp(y, ring.radius, GAME_HEIGHT - ring.radius),
    );
    this.ring.setAlpha(stick ? pressedAlpha : alpha);
    this.left.setPressed(held.has("left"));
    this.right.setPressed(held.has("right"));
  }
}
