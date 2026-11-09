import { AUTO, Game, Scale } from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./config/display";

new Game({
  type: AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
});
