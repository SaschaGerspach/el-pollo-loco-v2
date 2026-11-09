import { GameObjects, type Scene } from "phaser";
import { HUD } from "../config/ui";

// A bar in the old blue style, drawn at any fill level: the yellow bar as background, the blue
// bar cut to the fill level on top, and the icon over the left end.
export class StatusBar extends GameObjects.Container {
  private readonly fill: GameObjects.Image;

  constructor(scene: Scene, x: number, y: number, icon: string) {
    super(scene, x, y);
    const background = scene.add
      .image(HUD.barOffsetX, 0, "hud", "bar/empty")
      .setOrigin(0);
    this.fill = scene.add
      .image(HUD.barOffsetX, 0, "hud", "bar/blue")
      .setOrigin(0);
    const iconImage = scene.add
      .image(0, background.height / 2, "hud", icon)
      .setOrigin(0, 0.5);
    this.add([background, this.fill, iconImage]);
    scene.add.existing(this);
  }

  setFraction(fraction: number) {
    // The bar frame is trimmed; only its visible part maps to the fill level.
    const { x, width } = this.fill.frame;
    const level = Math.min(1, Math.max(0, fraction));
    this.fill.setCrop(0, 0, x + width * level, this.fill.height);
  }
}
