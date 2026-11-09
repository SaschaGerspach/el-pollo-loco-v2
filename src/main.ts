import { AUTO, Game, Scale } from "phaser";
import { DEBUG, DEBUG_TARGET_FPS } from "./config/debug";
import { GAME_HEIGHT, GAME_WIDTH } from "./config/display";
import { GRAVITY, PHYSICS_FPS } from "./config/world";
import { GameScene } from "./scenes/GameScene";
import { PreloadScene } from "./scenes/PreloadScene";

new Game({
  type: AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  fps: DEBUG_TARGET_FPS
    ? { target: DEBUG_TARGET_FPS, forceSetTimeOut: true }
    : undefined,
  physics: {
    default: "arcade",
    arcade: { gravity: { x: 0, y: GRAVITY }, fps: PHYSICS_FPS, debug: DEBUG },
  },
  scene: [PreloadScene, GameScene],
});
