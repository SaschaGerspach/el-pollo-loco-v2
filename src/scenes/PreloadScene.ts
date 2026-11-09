import { Scene } from "phaser";
import { soundUrls } from "../audio/GameAudio";
import { loadMuted } from "../audio/mute";
import { ATLAS_PATH, ATLASES } from "../config/assets";
import { MUSIC, SOUNDS, type SoundKey } from "../config/audio";
import { BACKGROUND_LAYERS, SKY } from "../config/background";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/display";
import { SCREEN_IMAGES, UI_FONT } from "../config/ui";
import { registerAnimations } from "../objects/animations";

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
    const { start, won, lost } = SCREEN_IMAGES;
    for (const { key, path } of [
      SKY,
      ...BACKGROUND_LAYERS,
      start,
      ...won,
      ...lost,
    ]) {
      this.load.image(key, path);
    }
    // The CSS declaration alone would let canvas text render once with a fallback font.
    this.load.font(UI_FONT.key, UI_FONT.path, "woff2");
    for (const key of Object.keys(SOUNDS) as SoundKey[]) {
      if (key !== MUSIC) this.load.audio(key, soundUrls(key));
    }
  }

  create() {
    registerAnimations(this.anims);
    this.sound.mute = loadMuted();
    this.scene.start("start");
  }
}
