import type { Cameras, GameObjects, Scene } from "phaser";
import { BACKGROUND_LAYERS, SKY } from "../config/background";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/display";

interface Layer {
  sprite: GameObjects.TileSprite;
  parallax: number;
  drift: number;
}

export class ParallaxBackground {
  private readonly layers: Layer[];

  constructor(scene: Scene) {
    scene.add.image(0, 0, SKY.key).setOrigin(0).setScrollFactor(0);
    this.layers = BACKGROUND_LAYERS.map(({ key, parallax, drift }) => ({
      sprite: scene.add
        .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, key)
        .setOrigin(0)
        .setScrollFactor(0),
      parallax,
      drift,
    }));
  }

  update(camera: Cameras.Scene2D.Camera, time: number) {
    for (const { sprite, parallax, drift } of this.layers) {
      sprite.tilePositionX = camera.scrollX * parallax + (time / 1000) * drift;
    }
  }
}
