import { GameObjects, Geom, Input, type Scene } from "phaser";

// The old play button as vector art, so it stays sharp at any size: a black ring on white
// with a symbol drawn by the caller.
export class RoundButton extends GameObjects.Graphics {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    radius: number,
    drawSymbol: (graphics: GameObjects.Graphics, radius: number) => void,
    onClick: () => void,
  ) {
    super(scene, { x, y });
    scene.add.existing(this);
    this.fillStyle(0xffffff).fillCircle(0, 0, radius);
    this.lineStyle(radius / 10, 0x000000).strokeCircle(0, 0, radius);
    this.fillStyle(0x000000);
    drawSymbol(this, radius);
    this.setInteractive({
      hitArea: new Geom.Circle(0, 0, radius),
      hitAreaCallback: Geom.Circle.Contains,
      useHandCursor: true,
    });
    this.on(Input.Events.GAMEOBJECT_POINTER_UP, onClick);
  }
}

export function drawPlaySymbol(graphics: GameObjects.Graphics, radius: number) {
  const size = radius * 0.45;
  graphics.fillTriangle(-size * 0.7, -size, -size * 0.7, size, size, 0);
}

export function drawPauseSymbol(
  graphics: GameObjects.Graphics,
  radius: number,
) {
  const width = radius * 0.2;
  const height = radius * 0.9;
  graphics.fillRect(-width * 1.5, -height / 2, width, height);
  graphics.fillRect(width * 0.5, -height / 2, width, height);
}
