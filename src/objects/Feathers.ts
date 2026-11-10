import type { GameObjects, Scene } from "phaser";
import { FEATHERS } from "../config/effects";

const TEXTURE = "feather";

type FeatherKind = keyof typeof FEATHERS.kinds;

// Feathers that burst from a bird and drift down.
export class Feathers {
  private readonly emitter: GameObjects.Particles.ParticleEmitter;

  constructor(scene: Scene) {
    if (!scene.textures.exists(TEXTURE)) drawFeather(scene);
    const { speed, angle, gravity, maxFallSpeed, lifespan } = FEATHERS;
    this.emitter = scene.add.particles(0, 0, TEXTURE, {
      speed,
      angle,
      gravityY: gravity,
      maxVelocityY: maxFallSpeed,
      lifespan,
      rotate: { min: 0, max: 360 },
      alpha: { start: 1, end: 0 },
      emitting: false,
    });
  }

  burst(kind: FeatherKind, x: number, y: number) {
    const { color, count, scale } = FEATHERS.kinds[kind];
    this.emitter.setParticleTint(color).setParticleScale(scale);
    this.emitter.explode(count, x, y);
  }
}

// White, so that the tint of each burst gives it the bird's color; the darker quill stays darker.
function drawFeather(scene: Scene) {
  const { width, height } = FEATHERS.size;
  const graphics = scene.make.graphics({}, false);
  graphics
    .fillStyle(0xffffff)
    .fillEllipse(width / 2, height / 2, width, height);
  graphics
    .lineStyle(2, 0xa0a0a0)
    .lineBetween(1, height / 2, width - 4, height / 2);
  graphics.generateTexture(TEXTURE, width, height);
  graphics.destroy();
}
