import { Animations, Physics, type Scene } from "phaser";
import { PEPE, PEPE_ANIMATIONS } from "../config/pepe";
import { nextPepeState, type PepeState } from "../logic/pepeState";

export interface PepeInput {
  left: boolean;
  right: boolean;
  jump: boolean;
}

type AnimationName = keyof typeof PEPE_ANIMATIONS;

const animationKey = (name: AnimationName) => `pepe-${name}`;

export class Pepe extends Physics.Arcade.Sprite {
  declare body: Physics.Arcade.Body;
  private pepeState: PepeState = "idle";
  private idleTime = 0;
  private landingFinished = false;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, "pepe", "idle/1");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    createAnimations(scene);

    const { width, height, offsetX, offsetY } = PEPE.body;
    this.setOrigin(0.5, 1);
    this.body.setSize(width, height, false).setOffset(offsetX, offsetY);
    this.setCollideWorldBounds(true);

    const completed = Animations.Events.ANIMATION_COMPLETE_KEY;
    this.on(`${completed}${animationKey("land")}`, () => {
      this.landingFinished = true;
    });
    this.on(`${completed}${animationKey("takeoff")}`, () => {
      if (this.pepeState === "jump" && this.body.velocity.y < 0) {
        this.play(animationKey("rise"));
      }
    });
    this.play(animationKey("idle"));
  }

  get currentState(): PepeState {
    return this.pepeState;
  }

  control(input: PepeInput, delta: number) {
    const direction = Number(input.right) - Number(input.left);
    // touching.down is also set by overlaps such as coins; only solid ground sets blocked.down.
    const onGround = this.body.onFloor();

    this.setVelocityX(direction * PEPE.walkSpeed);
    if (direction !== 0) this.setFlipX(direction < 0);
    if (input.jump && onGround) this.setVelocityY(-PEPE.jumpVelocity);

    this.idleTime = direction !== 0 || input.jump ? 0 : this.idleTime + delta;
    const next = nextPepeState(
      this.pepeState,
      {
        onGround,
        moving: direction !== 0,
        idleTime: this.idleTime,
        landingFinished: this.landingFinished,
      },
      PEPE.longIdleDelay,
    );

    if (next !== this.pepeState) {
      this.enter(next);
    } else if (next === "jump" && this.body.velocity.y >= 0) {
      this.play(animationKey("fall"), true);
    }
  }

  private enter(state: PepeState) {
    this.pepeState = state;
    switch (state) {
      case "idle":
        this.play(animationKey("idle"));
        break;
      case "long-idle":
        this.play(animationKey("longIdle"));
        break;
      case "walk":
        this.play(animationKey("walk"));
        break;
      case "jump":
        this.play(animationKey(this.body.velocity.y < 0 ? "takeoff" : "fall"));
        break;
      case "land":
        this.landingFinished = false;
        this.play(animationKey("land"));
        break;
    }
  }
}

function createAnimations(scene: Scene) {
  for (const [name, animation] of Object.entries(PEPE_ANIMATIONS)) {
    const key = animationKey(name as AnimationName);
    if (scene.anims.exists(key)) continue;
    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNames("pepe", {
        prefix: animation.prefix,
        frames: [...animation.frames],
      }),
      frameRate: animation.frameRate,
      repeat: animation.repeat,
    });
  }
}
