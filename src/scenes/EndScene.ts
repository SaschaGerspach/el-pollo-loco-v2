import { Input, Scene, Scenes } from "phaser";
import { RESTART_KEY } from "../config/controls";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/display";
import { END_SCREEN, SCREEN_IMAGES } from "../config/ui";
import { TextButton } from "../objects/TextButton";

// Win or lose screen above the paused game.
export class EndScene extends Scene {
  constructor() {
    super("end");
  }

  create({ won }: { won: boolean }) {
    this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, END_SCREEN.dim)
      .setOrigin(0)
      .setInteractive();
    const images = (won ? SCREEN_IMAGES.won : SCREEN_IMAGES.lost).map(
      ({ key }) => (won ? this.addWonImage(key) : this.addLostImage(key)),
    );
    let shown = 0;
    images.forEach((image, index) => image.setVisible(index === shown));
    this.time.addEvent({
      delay: END_SCREEN.frameTime,
      loop: true,
      callback: () => {
        images[shown].setVisible(false);
        shown = (shown + 1) % images.length;
        images[shown].setVisible(true);
      },
    });

    const { buttonsY, buttonGap, fontSize } = END_SCREEN;
    const centerX = GAME_WIDTH / 2;
    new TextButton(
      this,
      centerX - buttonGap / 2,
      buttonsY,
      "Play again",
      fontSize,
      () => this.playAgain(),
    );
    new TextButton(
      this,
      centerX + buttonGap / 2,
      buttonsY,
      "Main menu",
      fontSize,
      () => this.toMenu(),
    );

    const restartKey = this.input.keyboard!.addKey(RESTART_KEY);
    const playAgain = () => this.playAgain();
    restartKey.on(Input.Keyboard.Events.DOWN, playAgain);
    this.events.once(Scenes.Events.SHUTDOWN, () =>
      restartKey.off(Input.Keyboard.Events.DOWN, playAgain),
    );
  }

  private addWonImage(key: string) {
    const box = END_SCREEN.wonImageBox;
    const image = this.add.image(box.x, box.y, key);
    return image.setScale(
      Math.min(1, box.width / image.width, box.height / image.height),
    );
  }

  // The lose images fill the whole screen.
  private addLostImage(key: string) {
    return this.add.image(0, 0, key).setOrigin(0);
  }

  private playAgain() {
    this.scene.stop("ui");
    this.scene.start("game");
  }

  private toMenu() {
    this.scene.stop("ui");
    this.scene.stop("game");
    this.scene.start("start");
  }
}
