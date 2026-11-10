import { Physics, type Scene } from "phaser";
import { animationKey } from "../config/animations";
import {
  CHICKENS,
  DEFEATED_CHICKEN_LIFETIME,
  type ChickenKind,
} from "../config/chickens";

export class Chicken extends Physics.Arcade.Sprite {
  declare body: Physics.Arcade.Body;
  readonly kind: ChickenKind;
  private defeated = false;

  constructor(scene: Scene, x: number, y: number, kind: ChickenKind) {
    super(scene, x, y, kind, "walk/1");
    this.kind = kind;
    scene.add.existing(this);
    this.setOrigin(0.5, 1);
  }

  // Call after adding the chicken to a physics group, because adding resets the velocity.
  spawn() {
    const { speed, body } = CHICKENS[this.kind];
    this.body
      .setSize(body.width, body.height, false)
      .setOffset(body.offsetX, body.offsetY);
    this.setVelocityX(-speed);
    this.play(animationKey(this.kind, "walk"));
  }

  // Returns false if the chicken was already defeated, since colliders run several times
  // per frame.
  defeat() {
    if (this.defeated) return false;
    this.defeated = true;
    this.disableBody(false, false);
    this.play(animationKey(this.kind, "dead"));
    this.scene.time.delayedCall(DEFEATED_CHICKEN_LIFETIME, () =>
      this.destroy(),
    );
    return true;
  }
}
