import { AUTO, Game, Scale } from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./config/display";
import { GRAVITY, PHYSICS_FPS } from "./config/world";
import { DEBUG, DEBUG_TARGET_FPS } from "./debug";
import { EndScene } from "./scenes/EndScene";
import { GameScene } from "./scenes/GameScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { StartScene } from "./scenes/StartScene";
import { UIScene } from "./scenes/UIScene";

new Game({
  type: AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  fps: {
    // By default Phaser caps the frame delta at the 60 FPS target for 120 frames after start
    // and refocus, which slows the game down on devices running below 60 FPS.
    panicMax: 0,
    ...(DEBUG_TARGET_FPS
      ? { target: DEBUG_TARGET_FPS, forceSetTimeOut: true }
      : {}),
  },
  physics: {
    default: "arcade",
    arcade: { gravity: { x: 0, y: GRAVITY }, fps: PHYSICS_FPS, debug: DEBUG },
  },
  // Later scenes render above earlier ones.
  scene: [PreloadScene, StartScene, GameScene, UIScene, EndScene],
});
