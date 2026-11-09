import { Scene } from "phaser";
import {
  CONTROLS_TEXT,
  SCREEN_IMAGES,
  START_SCREEN,
  TEXT_STYLE,
} from "../config/ui";
import { showLegalPage } from "../legal";
import { RoundButton, drawPlaySymbol } from "../objects/RoundButton";
import { TextButton } from "../objects/TextButton";
import { createSoundToggle } from "../objects/soundToggle";

export class StartScene extends Scene {
  constructor() {
    super("start");
  }

  create() {
    const { playButton, controls, sound, legal } = START_SCREEN;
    this.add.image(0, 0, SCREEN_IMAGES.start.key).setOrigin(0);
    new RoundButton(
      this,
      playButton.x,
      playButton.y,
      playButton.radius,
      drawPlaySymbol,
      () => this.scene.start("game"),
    );
    this.add
      .text(controls.x, controls.y, CONTROLS_TEXT, {
        ...TEXT_STYLE,
        fontSize: `${controls.fontSize}px`,
      })
      .setOrigin(0.5);
    createSoundToggle(this, sound.x, sound.y, sound.fontSize).setOrigin(1, 0.5);
    new TextButton(this, legal.x, legal.y, "Legal notice", legal.fontSize, () =>
      showLegalPage("legal"),
    ).setOrigin(0, 0.5);
    new TextButton(
      this,
      legal.x + legal.gap,
      legal.y,
      "Privacy policy",
      legal.fontSize,
      () => showLegalPage("privacy"),
    ).setOrigin(0, 0.5);
  }
}
