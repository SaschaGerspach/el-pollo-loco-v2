import type { Scene } from "phaser";
import { isMuted, setMuted } from "../audio/mute";
import { TextButton } from "./TextButton";

const label = () => `Sound ${isMuted() ? "off" : "on"}`;

// Mutes all sound of the game; the setting is shared by all scenes and kept across visits.
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
    label(),
    fontSize,
    () => {
      setMuted(scene.sound, !isMuted());
      button.setText(label());
    },
  );
  return button;
}
