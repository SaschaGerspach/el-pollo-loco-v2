import { Scene } from "phaser";
import { ATLAS_PATH, ATLASES } from "../config/assets";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/display";

const BAR_WIDTH = GAME_WIDTH / 2;
const BAR_HEIGHT = GAME_HEIGHT / 40;
const BAR_COLOR = 0xffa500;

export class PreloadScene extends Scene {
  constructor() {
    super("preload");
  }

  preload() {
    const x = (GAME_WIDTH - BAR_WIDTH) / 2;
    const y = GAME_HEIGHT / 2;
    this.add
      .rectangle(x, y, BAR_WIDTH, BAR_HEIGHT)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, BAR_COLOR);
    const bar = this.add
      .rectangle(x, y, BAR_WIDTH, BAR_HEIGHT, BAR_COLOR)
      .setOrigin(0, 0.5)
      .setScale(0, 1);
    this.load.on("progress", (progress: number) => bar.setScale(progress, 1));

    for (const key of ATLASES) {
      this.load.multiatlas(key, `${ATLAS_PATH}/${key}.json`, ATLAS_PATH);
    }
  }
}
