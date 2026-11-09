import type { Animations } from "phaser";
import { ANIMATIONS, animationKey } from "../config/animations";

export function registerAnimations(anims: Animations.AnimationManager) {
  for (const [atlas, animations] of Object.entries(ANIMATIONS)) {
    for (const [name, animation] of Object.entries(animations)) {
      anims.create({
        key: animationKey(atlas, name),
        frames: anims.generateFrameNames(atlas, {
          prefix: animation.prefix,
          frames: [...animation.frames],
        }),
        frameRate: animation.frameRate,
        repeat: animation.repeat,
      });
    }
  }
}
