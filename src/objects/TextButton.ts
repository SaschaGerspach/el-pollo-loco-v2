import { GameObjects, Input, type Scene } from "phaser";
import { TEXT_HOVER_COLOR, TEXT_STYLE } from "../config/ui";

export class TextButton extends GameObjects.Text {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    label: string,
    fontSize: number,
    onClick: () => void,
  ) {
    super(scene, x, y, label, { ...TEXT_STYLE, fontSize: `${fontSize}px` });
    scene.add.existing(this);
    this.setOrigin(0.5).setPadding(16).setInteractive({ useHandCursor: true });
    this.on(Input.Events.GAMEOBJECT_POINTER_OVER, () =>
      this.setColor(TEXT_HOVER_COLOR),
    );
    this.on(Input.Events.GAMEOBJECT_POINTER_OUT, () =>
      this.setColor(TEXT_STYLE.color),
    );
    this.on(Input.Events.GAMEOBJECT_POINTER_UP, onClick);
  }
}
