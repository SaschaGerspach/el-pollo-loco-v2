import { Animations, Physics, type Scene } from "phaser";
import { animationKey } from "../config/animations";
import { PEPE_BLINK } from "../config/effects";
import { PEPE, type PEPE_ANIMATIONS } from "../config/pepe";
import type { PlayerInput } from "../input/Controls";
import { nextPepeState, type PepeState } from "../logic/pepeState";

const key = (name: keyof typeof PEPE_ANIMATIONS) => animationKey("pepe", name);

export class Pepe extends Physics.Arcade.Sprite {
  declare body: Physics.Arcade.Body;
  private pepeState: PepeState = "idle";
  private idleTime = 0;
  private landingFinished = false;
  private hurtActive = false;
  private dead = false;
  // Milliseconds left in which Pepe blinks after a hit.
  private blinkTime = 0;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, "pepe", "idle/1");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const { width, height, offsetX, offsetY } = PEPE.body;
    this.setOrigin(0.5, 1);
    this.body.setSize(width, height, false).setOffset(offsetX, offsetY);
    this.setCollideWorldBounds(true);

    const completed = Animations.Events.ANIMATION_COMPLETE_KEY;
    this.on(`${completed}${key("land")}`, () => {
      this.landingFinished = true;
    });
    this.on(`${completed}${key("hurt")}`, () => {
      this.hurtActive = false;
    });
    this.on(`${completed}${key("takeoff")}`, () => {
      if (this.pepeState === "jump" && this.body.velocity.y < 0) {
        this.play(key("rise"));
      }
    });
    this.play(key("idle"));
  }

  get currentState(): PepeState {
    return this.pepeState;
  }

  get facing(): 1 | -1 {
    return this.flipX ? -1 : 1;
  }

  get throwOrigin() {
    return {
      x: this.x + this.facing * PEPE.throwOrigin.x,
      y: this.y + PEPE.throwOrigin.y,
    };
  }

  // Blinks as long as the hit keeps him from being hurt again.
  hurt(invulnerability: number) {
    this.hurtActive = true;
    this.blinkTime = invulnerability;
  }

  die() {
    this.dead = true;
    this.blinkTime = 0;
  }

  // Returns true when Pepe jumps off in this frame.
  control(input: PlayerInput, delta: number) {
    // touching.down is also set by overlaps such as coins; only solid ground sets blocked.down.
    const onGround = this.body.onFloor();
    const direction = this.dead ? 0 : Number(input.right) - Number(input.left);
    const jumps = !this.dead && input.jump && onGround;

    this.setVelocityX(direction * PEPE.walkSpeed);
    if (direction !== 0) this.setFlipX(direction < 0);
    if (jumps) this.setVelocityY(-PEPE.jumpVelocity);

    this.idleTime = direction !== 0 || input.jump ? 0 : this.idleTime + delta;
    const next = nextPepeState(
      this.pepeState,
      {
        onGround,
        moving: direction !== 0,
        idleTime: this.idleTime,
        landingFinished: this.landingFinished,
        hurt: this.hurtActive,
        dead: this.dead,
      },
      PEPE.longIdleDelay,
    );

    if (next !== this.pepeState) {
      this.enter(next);
    } else if (next === "jump" && this.body.velocity.y >= 0) {
      this.play(key("fall"), true);
    }

    this.blinkTime = Math.max(0, this.blinkTime - delta);
    const faded = Math.floor(this.blinkTime / PEPE_BLINK.interval) % 2 === 1;
    this.setAlpha(faded ? PEPE_BLINK.alpha : 1);
    return jumps;
  }

  private enter(state: PepeState) {
    this.pepeState = state;
    switch (state) {
      case "idle":
        this.play(key("idle"));
        break;
      case "long-idle":
        this.play(key("longIdle"));
        break;
      case "walk":
        this.play(key("walk"));
        break;
      case "jump":
        this.play(key(this.body.velocity.y < 0 ? "takeoff" : "fall"));
        break;
      case "land":
        this.landingFinished = false;
        this.play(key("land"));
        break;
      case "hurt":
        this.play(key("hurt"));
        break;
      case "dead":
        this.play(key("dead"));
        break;
    }
  }
}
