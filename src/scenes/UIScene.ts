import { Core, type GameObjects, Input, Scene, Scenes } from "phaser";
import { PAUSE_KEYS, type Action } from "../config/controls";
import { GAME_HEIGHT, GAME_WIDTH, PORTRAIT_QUERY } from "../config/display";
import { RULES } from "../config/rules";
import {
  END_SCREEN,
  HUD,
  PAUSE_MENU,
  TEXT_STYLE,
  TOUCH_ZONES,
} from "../config/ui";
import { controlsText, hasTouchZones } from "../input/touch";
import { GAME_EVENT, type GameEvent } from "../logic/events";
import type { Round } from "../logic/round";
import { RoundButton, drawPauseSymbol } from "../objects/RoundButton";
import { StatusBar } from "../objects/StatusBar";
import { TextButton } from "../objects/TextButton";
import { TouchStick } from "../objects/TouchStick";
import { TouchSymbol } from "../objects/TouchSymbol";
import { createFullscreenToggle } from "../objects/fullscreenToggle";
import { createSoundToggle } from "../objects/soundToggle";
import type { GameScene } from "./GameScene";

// Runs above the game scene: status bars, touch controls, pause and the end of a round. It keeps
// running while the game scene is paused, so it is the one that reads the pause keys.
export class UIScene extends Scene {
  private gameScene!: GameScene;
  private bars!: Record<"health" | "bottles" | "coins" | "boss", StatusBar>;
  private touchSymbols!: Map<Action, TouchSymbol>;
  private touchStick?: TouchStick;
  private pauseMenu?: GameObjects.Container;
  private roundOver!: boolean;

  constructor() {
    super("ui");
  }

  create() {
    this.pauseMenu = undefined;
    this.roundOver = false;
    const game = this.scene.get("game") as GameScene;
    this.gameScene = game;
    this.bars = this.createBars();
    this.updateBars(game.currentRound);
    this.touchSymbols = new Map();
    if (hasTouchZones(this)) this.createTouchControls();
    const { pauseButton } = HUD;
    new RoundButton(
      this,
      pauseButton.x,
      pauseButton.y,
      pauseButton.radius,
      drawPauseSymbol,
      () => this.togglePause(),
    );

    const keys = PAUSE_KEYS.map((code) => this.input.keyboard!.addKey(code));
    const togglePause = () => this.togglePause();
    for (const key of keys) key.on(Input.Keyboard.Events.DOWN, togglePause);
    // The rotate hint covers the game, so a round must not go on behind it.
    const portrait = window.matchMedia(PORTRAIT_QUERY);
    const pauseInPortrait = () => {
      if (portrait.matches) this.pause();
    };
    portrait.addEventListener("change", pauseInPortrait);
    game.events.on(GAME_EVENT, this.onGameEvent, this);
    this.game.events.on(Core.Events.HIDDEN, this.pause, this);
    this.events.once(Scenes.Events.SHUTDOWN, () => {
      for (const key of keys) key.off(Input.Keyboard.Events.DOWN, togglePause);
      portrait.removeEventListener("change", pauseInPortrait);
      game.events.off(GAME_EVENT, this.onGameEvent, this);
      this.game.events.off(Core.Events.HIDDEN, this.pause, this);
    });
  }

  update() {
    if (!this.touchStick) return;
    const state = this.gameScene.touchState();
    this.touchStick.show(state);
    for (const [action, symbol] of this.touchSymbols) {
      symbol.setPressed(state.held.has(action));
    }
  }

  private createTouchControls() {
    this.touchStick = new TouchStick(this);
    for (const action of ["throw", "jump"] as const) {
      const { x, y, angle } = TOUCH_ZONES.symbols[action];
      this.touchSymbols.set(
        action,
        new TouchSymbol(this, x, y, angle, TOUCH_ZONES.radius),
      );
    }
  }

  private createBars() {
    const row = (index: number) => HUD.y + index * HUD.rowHeight;
    const boss = new StatusBar(this, 0, row(0), "icon/endboss");
    boss.x = GAME_WIDTH - HUD.x - boss.getBounds().width;
    return {
      health: new StatusBar(this, HUD.x, row(0), "icon/health"),
      bottles: new StatusBar(this, HUD.x, row(1), "icon/bottle"),
      coins: new StatusBar(this, HUD.x, row(2), "icon/coin"),
      boss,
    };
  }

  private updateBars(round: Round) {
    this.bars.health.setFraction(round.health / RULES.maxHealth);
    this.bars.bottles.setFraction(round.bottles / RULES.maxBottles);
    this.bars.coins.setFraction(round.coins / round.totalCoins);
    this.bars.boss.setFraction(round.bossHealth / RULES.bossMaxHealth);
  }

  private onGameEvent(event: GameEvent, round: Round) {
    this.updateBars(round);
    if (event === "round-won") this.endRound(true, 0);
    if (event === "pepe-died") this.endRound(false, END_SCREEN.loseDelay);
  }

  private endRound(won: boolean, delay: number) {
    this.roundOver = true;
    this.time.delayedCall(delay, () => {
      this.scene.pause("game");
      this.scene.launch("end", { won });
    });
  }

  private togglePause() {
    if (this.pauseMenu) this.resume();
    else this.pause();
  }

  private pause() {
    if (this.pauseMenu || this.roundOver) return;
    this.scene.pause("game");
    this.pauseMenu = this.createPauseMenu();
  }

  private resume() {
    this.pauseMenu?.destroy();
    this.pauseMenu = undefined;
    this.scene.resume("game");
  }

  private createPauseMenu() {
    const { titleY, firstButtonY, buttonGap, titleSize, fontSize } = PAUSE_MENU;
    const x = GAME_WIDTH / 2;
    const y = (index: number) => firstButtonY + index * buttonGap;
    const textStyle = { ...TEXT_STYLE, fontSize: `${fontSize}px` };
    // Interactive, so clicks do not reach the pause button behind it.
    const shade = this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, PAUSE_MENU.dim)
      .setOrigin(0)
      .setInteractive();
    const title = this.add
      .text(x, titleY, "Paused", { ...TEXT_STYLE, fontSize: `${titleSize}px` })
      .setOrigin(0.5);
    const controls = this.add
      .text(x, PAUSE_MENU.controlsY, controlsText(), textStyle)
      .setOrigin(0.5)
      .setVisible(false);
    const buttons = [
      new TextButton(this, x, 0, "Resume", fontSize, () => this.resume()),
      new TextButton(this, x, 0, "Restart", fontSize, () =>
        this.scene.start("game"),
      ),
      createSoundToggle(this, x, 0, fontSize),
      createFullscreenToggle(this, x, 0, fontSize),
      new TextButton(this, x, 0, "Controls", fontSize, () =>
        controls.setVisible(!controls.visible),
      ),
    ].filter((button) => button !== undefined);
    buttons.forEach((button, index) => button.setY(y(index)));
    return this.add.container(0, 0, [shade, title, ...buttons, controls]);
  }
}
