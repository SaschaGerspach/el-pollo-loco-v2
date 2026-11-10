import { Animations, Physics, TintModes, type Scene } from "phaser";
import { animationKey } from "../config/animations";
import { BOSS_FLASH } from "../config/effects";
import { ENDBOSS, type ENDBOSS_ANIMATIONS } from "../config/endboss";
import {
  horizontalGap,
  nextBossState,
  type BossState,
} from "../logic/bossState";
import type { GameEvent } from "../logic/events";
import type { Pepe } from "./Pepe";

const key = (name: keyof typeof ENDBOSS_ANIMATIONS) =>
  animationKey("endboss", name);

export class Endboss extends Physics.Arcade.Sprite {
  declare body: Physics.Arcade.Body;
  private readonly onEvent: (event: GameEvent) => void;
  private bossState: BossState = "waiting";
  private stateTime = 0;
  private alertFinished = false;
  private hitPending = false;
  private dead = false;
  // Milliseconds left in which the boss lights up after a hit.
  private flashTime = 0;
  // The art faces left.
  private direction: 1 | -1 = -1;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    onEvent: (event: GameEvent) => void,
  ) {
    super(scene, x, y, "endboss", "walk/1");
    this.onEvent = onEvent;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const { width, height, offsetX, offsetY } = ENDBOSS.body;
    this.setOrigin(0.5, 1);
    this.body.setSize(width, height, false).setOffset(offsetX, offsetY);
    this.body.setAllowGravity(false);
    this.setCollideWorldBounds(true);

    const completed = Animations.Events.ANIMATION_COMPLETE_KEY;
    this.on(`${completed}${key("alert")}`, () => {
      this.alertFinished = true;
    });
    this.on(`${completed}${key("dead")}`, () => onEvent("round-won"));
    this.play(key("stand"));
  }

  get currentState(): BossState {
    return this.bossState;
  }

  get engaged() {
    return this.bossState !== "waiting" && this.bossState !== "dead";
  }

  stagger() {
    this.hitPending = true;
  }

  flash() {
    this.setTint(BOSS_FLASH.color).setTintMode(TintModes.FILL);
    this.flashTime = BOSS_FLASH.duration;
  }

  die() {
    this.dead = true;
  }

  step(pepe: Pepe, delta: number) {
    this.stateTime += delta;
    if (this.flashTime > 0) {
      this.flashTime -= delta;
      if (this.flashTime <= 0) this.clearTint();
    }
    const gap = horizontalGap(
      this.body.center.x,
      this.body.width,
      pepe.body.center.x,
      pepe.body.width,
    );
    const next = nextBossState(
      this.bossState,
      {
        gap,
        stateTime: this.stateTime,
        alertFinished: this.alertFinished,
        hit: this.hitPending,
        dead: this.dead,
      },
      ENDBOSS,
    );
    // Another hit while staggering starts the stagger over.
    const restartStagger = this.hitPending && next === "stagger";
    this.hitPending = false;
    if (next !== this.bossState || restartStagger) this.enter(next, pepe);
    this.move(pepe);
  }

  private enter(state: BossState, pepe: Pepe) {
    this.bossState = state;
    this.stateTime = 0;
    switch (state) {
      case "waiting":
        break;
      case "alert":
        this.play(key("alert"));
        this.onEvent("boss-alerted");
        break;
      case "chase":
        this.play(key("walk"));
        break;
      case "windup":
        this.face(pepe);
        this.play(key("windup"));
        this.onEvent("boss-attack");
        break;
      case "charge":
        this.play(key("charge"));
        break;
      case "pause":
        this.play(key("recover"));
        break;
      case "stagger":
        this.play(key("hurt"));
        break;
      case "dead":
        this.disableBody(false, false);
        this.play(key("dead"));
        break;
    }
  }

  private move(pepe: Pepe) {
    if (this.bossState === "dead") return;
    let speed = 0;
    if (this.bossState === "chase") {
      this.face(pepe);
      speed = ENDBOSS.chaseSpeed;
    } else if (this.bossState === "charge") {
      speed = ENDBOSS.chargeSpeed;
    }
    this.setVelocityX(this.direction * speed);
  }

  private face(pepe: Pepe) {
    this.direction = pepe.x < this.x ? -1 : 1;
    this.setFlipX(this.direction > 0);
  }
}
