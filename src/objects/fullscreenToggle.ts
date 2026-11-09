import { GameObjects, Scale, type Scene } from "phaser";
import { TextButton } from "./TextButton";

const label = (scene: Scene) =>
  `Fullscreen ${scene.scale.isFullscreen ? "on" : "off"}`;

// Only where the browser has the Fullscreen API; the iPhone lacks it and plays fullscreen as a
// home screen app instead. The player can also leave fullscreen with Esc or the back gesture,
// so the label follows the scale manager.
export function createFullscreenToggle(
  scene: Scene,
  x: number,
  y: number,
  fontSize: number,
) {
  if (!scene.scale.fullscreen.available) return undefined;
  const button = new TextButton(scene, x, y, label(scene), fontSize, () =>
    scene.scale.toggleFullscreen(),
  );
  const update = () => button.setText(label(scene));
  scene.scale.on(Scale.Events.ENTER_FULLSCREEN, update);
  scene.scale.on(Scale.Events.LEAVE_FULLSCREEN, update);
  button.once(GameObjects.Events.DESTROY, () => {
    scene.scale.off(Scale.Events.ENTER_FULLSCREEN, update);
    scene.scale.off(Scale.Events.LEAVE_FULLSCREEN, update);
  });
  return button;
}
