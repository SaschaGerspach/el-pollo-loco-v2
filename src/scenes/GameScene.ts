import { Cameras, type Physics, Scene } from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/display";
import { ENDBOSS } from "../config/endboss";
import { COIN, GROUND_BOTTLE } from "../config/items";
import { LEVEL } from "../config/level";
import { PEPE } from "../config/pepe";
import { RULES } from "../config/rules";
import {
  CAMERA_PEPE_SCREEN_X,
  CAMERA_SIDE_SWITCH_TIME,
  GROUND_THICKNESS,
  GROUND_Y,
  LEVEL_WIDTH,
} from "../config/world";
import { DEBUG, DEBUG_BOSS, DEBUG_BOSS_DISTANCE, DEBUG_DEMO } from "../debug";
import { Controls, type PlayerInput } from "../input/Controls";
import { isStomp } from "../logic/contact";
import { GAME_EVENT, type GameEvent } from "../logic/events";
import { Round } from "../logic/round";
import { Chicken } from "../objects/Chicken";
import { Endboss } from "../objects/Endboss";
import { ParallaxBackground } from "../objects/ParallaxBackground";
import { Pepe } from "../objects/Pepe";
import { ThrownBottle } from "../objects/ThrownBottle";

export class GameScene extends Scene {
  private background!: ParallaxBackground;
  private pepe!: Pepe;
  private boss!: Endboss;
  private controls!: Controls;
  private round!: Round;
  private chickens!: Physics.Arcade.Group;
  private thrownBottles!: Physics.Arcade.Group;
  private debugOverlay?: HTMLElement;
  // Sum of frame deltas; unlike this.time.now it stands still while the scene is paused.
  // Set in create() because a restart reuses this scene instance.
  private elapsed!: number;

  constructor() {
    super("game");
  }

  get currentRound(): Round {
    return this.round;
  }

  create() {
    this.elapsed = 0;
    this.round = new Round(
      RULES,
      LEVEL.coins.length,
      DEBUG_BOSS ? RULES.maxBottles : 0,
    );
    this.background = new ParallaxBackground(this);
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, GAME_HEIGHT);

    const ground = this.add
      .rectangle(
        LEVEL_WIDTH / 2,
        GROUND_Y + GROUND_THICKNESS / 2,
        LEVEL_WIDTH,
        GROUND_THICKNESS,
      )
      .setVisible(false);
    this.physics.add.existing(ground, true);

    const coins = this.createCoins();
    const groundBottles = this.createGroundBottles();
    this.chickens = this.createChickens();
    this.thrownBottles = this.physics.add.group();
    this.boss = new Endboss(
      this,
      ENDBOSS.x,
      GROUND_Y + ENDBOSS.feetOffset,
      (event) => this.emitEvents([event]),
    );
    const startX = DEBUG_BOSS ? ENDBOSS.x - DEBUG_BOSS_DISTANCE : PEPE.startX;
    this.pepe = new Pepe(this, startX, GROUND_Y);

    this.physics.add.collider(this.pepe, ground);
    this.physics.add.overlap(this.pepe, coins, (_pepe, coin) =>
      this.collectCoin(coin as Physics.Arcade.Sprite),
    );
    this.physics.add.overlap(
      this.pepe,
      groundBottles,
      (_pepe, bottle) => this.collectBottle(bottle as Physics.Arcade.Sprite),
      () => this.round.canCollectBottle(),
    );
    this.physics.add.overlap(this.pepe, this.chickens, (_pepe, chicken) =>
      this.touchChicken(chicken as Chicken),
    );
    // With a group and a single object, Phaser passes the single object first, so it is
    // also listed first here.
    this.physics.add.collider(ground, this.thrownBottles, (_ground, bottle) =>
      this.splash(bottle as ThrownBottle),
    );
    this.physics.add.overlap(
      this.thrownBottles,
      this.chickens,
      (bottle, chicken) =>
        this.hitChicken(bottle as ThrownBottle, chicken as Chicken),
    );
    // Any contact with the boss hurts; stomping does not defeat him.
    this.physics.add.overlap(this.pepe, this.boss, () => this.hurtPepe());
    this.physics.add.overlap(this.boss, this.thrownBottles, (_boss, bottle) =>
      this.hitBoss(bottle as ThrownBottle),
    );

    this.cameras.main
      .setBounds(0, 0, LEVEL_WIDTH, GAME_HEIGHT)
      .startFollow(this.pepe, true)
      .setFollowOffset(CAMERA_PEPE_SCREEN_X - GAME_WIDTH / 2, 0);
    // The camera scrolls in preRender; updating the layers in update() would lag one frame.
    this.cameras.main.on(
      Cameras.Scene2D.Events.FOLLOW_UPDATE,
      (camera: Cameras.Scene2D.Camera) =>
        this.background.update(camera, this.elapsed),
    );

    this.controls = new Controls(this);
    this.scene.launch("ui");

    if (DEBUG) {
      const overlay = createDebugOverlay();
      this.debugOverlay = overlay;
      this.events.once("shutdown", () => overlay.remove());
    }
  }

  update(_time: number, delta: number) {
    this.elapsed += delta;
    const keyboardInput = this.controls.read();
    const input = DEBUG_DEMO ? demoInput(this.elapsed) : keyboardInput;
    this.pepe.control(input, delta);
    if (input.throw) this.throwBottle();
    this.boss.step(this.pepe, delta);
    this.frameCamera(delta);

    if (this.debugOverlay) {
      const fps = Math.round(this.game.loop.actualFps);
      const { x, y, currentState } = this.pepe;
      const time = Math.round(this.elapsed);
      const { health, bossHealth, bottles, coins, totalCoins } = this.round;
      const chickens = this.chickens
        .getChildren()
        .filter((chicken) => (chicken as Chicken).body.enable).length;
      const boss = `${this.boss.currentState} ${bossHealth} x ${Math.round(this.boss.x)}`;
      this.debugOverlay.textContent =
        `fps ${fps}  x ${Math.round(x)}  y ${Math.round(y)}  ${currentState}  t ${time}` +
        `  hp ${health}  bottles ${bottles}  coins ${coins}/${totalCoins}  chickens ${chickens}` +
        `  boss ${boss}`;
    }
  }

  // Keeps the boss in view: while he fights from the left, Pepe moves to the right side.
  private frameCamera(delta: number) {
    const bossOnLeft = this.boss.engaged && this.boss.x < this.pepe.x;
    const screenX = bossOnLeft
      ? GAME_WIDTH - CAMERA_PEPE_SCREEN_X
      : CAMERA_PEPE_SCREEN_X;
    const camera = this.cameras.main;
    const target = screenX - GAME_WIDTH / 2;
    const blend = 1 - Math.exp(-delta / CAMERA_SIDE_SWITCH_TIME);
    const offsetX = camera.followOffset.x;
    camera.setFollowOffset(offsetX + (target - offsetX) * blend, 0);
  }

  private createCoins() {
    const coins = this.physics.add.staticGroup();
    for (const x of LEVEL.coins) {
      const coin = coins.create(x, LEVEL.coinY, "coin", COIN.frame);
      (coin.body as Physics.Arcade.StaticBody).setSize(
        COIN.body.width,
        COIN.body.height,
      );
    }
    return coins;
  }

  private createGroundBottles() {
    const bottles = this.physics.add.staticGroup();
    LEVEL.bottles.forEach((x, index) => {
      const frame = GROUND_BOTTLE.frames[index % GROUND_BOTTLE.frames.length];
      const bottle = bottles.create(x, GROUND_Y, "bottle", frame);
      bottle.setOrigin(0.5, 1).refreshBody();
      (bottle.body as Physics.Arcade.StaticBody).setSize(
        GROUND_BOTTLE.body.width,
        GROUND_BOTTLE.body.height,
      );
    });
    return bottles;
  }

  private createChickens() {
    const chickens = this.physics.add.group({ allowGravity: false });
    for (const { kind, x } of LEVEL.chickens) {
      const chicken = new Chicken(this, x, GROUND_Y, kind);
      chickens.add(chicken);
      chicken.spawn();
    }
    return chickens;
  }

  private collectCoin(coin: Physics.Arcade.Sprite) {
    coin.disableBody(true, true);
    this.emitEvents(this.round.collectCoin());
  }

  private collectBottle(bottle: Physics.Arcade.Sprite) {
    const events = this.round.collectBottle();
    if (events.length > 0) bottle.disableBody(true, true);
    this.emitEvents(events);
  }

  private touchChicken(chicken: Chicken) {
    if (this.round.lost) return;
    const pepeBody = this.pepe.body;
    const stomp = isStomp(
      {
        pepePreviousBottom: pepeBody.prev.y + pepeBody.height,
        pepeVelocityY: pepeBody.velocity.y,
        enemyTop: chicken.body.top,
      },
      RULES.stompTolerance,
    );
    if (stomp) {
      if (chicken.defeat()) this.emitEvents(["chicken-defeated"]);
      return;
    }
    this.hurtPepe();
  }

  private hurtPepe() {
    const events = this.round.hitPepe(this.elapsed);
    if (events.includes("pepe-died")) this.pepe.die();
    else if (events.includes("pepe-hit")) this.pepe.hurt();
    this.emitEvents(events);
  }

  private hitBoss(bottle: ThrownBottle) {
    if (!bottle.splash()) return;
    const events: GameEvent[] = ["bottle-splashed", ...this.round.hitBoss()];
    if (events.includes("boss-died")) this.boss.die();
    else if (events.includes("boss-hit")) this.boss.stagger();
    this.emitEvents(events);
  }

  private throwBottle() {
    const events = this.round.throwBottle();
    if (events.length === 0) return;
    const { x, y } = this.pepe.throwOrigin;
    const bottle = new ThrownBottle(this, x, y);
    this.thrownBottles.add(bottle);
    bottle.launch(this.pepe.facing);
    this.emitEvents(events);
  }

  private splash(bottle: ThrownBottle) {
    if (bottle.splash()) this.emitEvents(["bottle-splashed"]);
  }

  private hitChicken(bottle: ThrownBottle, chicken: Chicken) {
    if (!bottle.splash()) return;
    const events: GameEvent[] = ["bottle-splashed"];
    if (chicken.defeat()) events.push("chicken-defeated");
    this.emitEvents(events);
  }

  // The round goes along, so listeners can show its current values.
  private emitEvents(events: readonly GameEvent[]) {
    for (const event of events) {
      this.events.emit(GAME_EVENT, event, this.round);
    }
  }
}

function demoInput(elapsed: number): PlayerInput {
  const walkingRight = elapsed % 8000 < 4000;
  return {
    left: !walkingRight,
    right: walkingRight,
    jump: elapsed % 2000 < 50,
    throw: false,
  };
}

function createDebugOverlay() {
  const overlay = document.createElement("pre");
  overlay.id = "debug";
  overlay.style.cssText =
    "position:fixed;top:0;left:0;margin:0;padding:4px 8px;font:14px monospace;" +
    "color:#fff;background:rgba(0,0,0,0.6);pointer-events:none";
  document.body.append(overlay);
  return overlay;
}
