import { AUTO, Game, Scale } from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./config/display";
import { TOUCH_BUTTONS } from "./config/ui";
import { GRAVITY, PHYSICS_FPS } from "./config/world";
import { DEBUG, DEBUG_TARGET_FPS } from "./debug";
import { EndScene } from "./scenes/EndScene";
import { GameScene } from "./scenes/GameScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { StartScene } from "./scenes/StartScene";
import { UIScene } from "./scenes/UIScene";

const game = new Game({
  type: AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  // With the body as parent, Phaser measures the height on iOS as 100vh, which ignores Safari's
  // toolbars and cuts off the bottom of the game. A fixed element has the visible size.
  parent: "game",
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
    // The whole page, so the rotate hint stays visible in fullscreen.
    fullscreenTarget: document.documentElement,
  },
  input: {
    // Phaser tracks a single finger by default; this way all touch buttons can be held at once.
    activePointers: Object.keys(TOUCH_BUTTONS.buttons).length,
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

// Android can hold landscape while in fullscreen. Browsers that cannot lock the orientation
// reject the request, Safari lacks the method and older iPads the whole object.
game.scale.on(Scale.Events.ENTER_FULLSCREEN, () => {
  screen.orientation?.lock?.("landscape").catch(() => {});
});
