import { Animations, Physics, type Scene } from "phaser";
import { animationKey } from "../config/animations";
import { THROWN_BOTTLE } from "../config/items";

export class ThrownBottle extends Physics.Arcade.Sprite {
  declare body: Physics.Arcade.Body;
  private splashed = false;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, "bottle", "rotation/1");
    scene.add.existing(this);
  }

  // Call after adding the bottle to a physics group, because adding resets the velocity.
  launch(direction: 1 | -1) {
    const { body, velocityX, velocityY } = THROWN_BOTTLE;
    this.body.setSize(body.width, body.height, true);
    this.setVelocity(direction * velocityX, velocityY);
    this.play(animationKey("bottle", "rotation"));
  }

  // Returns false if the bottle has already splashed, since colliders run several times
  // per frame.
  splash() {
    if (this.splashed) return false;
    this.splashed = true;
    this.disableBody(false, false);
    const splash = animationKey("bottle", "splash");
    this.once(`${Animations.Events.ANIMATION_COMPLETE_KEY}${splash}`, () =>
      this.destroy(),
    );
    this.play(splash);
    return true;
  }
}
