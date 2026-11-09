import type { Scene } from "phaser";
import { TextButton } from "./TextButton";

const label = (scene: Scene) => `Sound ${scene.sound.mute ? "off" : "on"}`;

// Mutes all sound of the game; the setting is shared by all scenes.
export function createSoundToggle(
  scene: Scene,
  x: number,
  y: number,
  fontSize: number,
) {
  const button: TextButton = new TextButton(
    scene,
    x,
    y,
    label(scene),
    fontSize,
    () => {
      scene.sound.mute = !scene.sound.mute;
      button.setText(label(scene));
    },
  );
  return button;
}
