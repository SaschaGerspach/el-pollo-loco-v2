import { Loader, Scenes, type Scene, type Sound } from "phaser";
import {
  AUDIO_PATH,
  EVENT_SOUNDS,
  MUSIC,
  RUNNING,
  SOUNDS,
  type SoundKey,
} from "../config/audio";
import type { GameEvent } from "../logic/events";

export const soundUrls = (key: SoundKey) => [
  `${AUDIO_PATH}/${key}.ogg`,
  `${AUDIO_PATH}/${key}.mp3`,
];

// Plays the sounds of one round. Phaser's sound manager is global, so the loops are paused
// with the scene and stopped when it shuts down.
export class GameAudio {
  private readonly scene: Scene;
  private readonly running?: Sound.BaseSound;
  private music?: Sound.BaseSound;

  constructor(scene: Scene) {
    this.scene = scene;
    this.running = this.addLoop(RUNNING);
    this.startMusic();

    const { events } = scene;
    const pause = () => this.loops().forEach((sound) => sound.pause());
    const resume = () => this.loops().forEach((sound) => sound.resume());
    events.on(Scenes.Events.PAUSE, pause);
    events.on(Scenes.Events.RESUME, resume);
    events.once(Scenes.Events.SHUTDOWN, () => {
      events.off(Scenes.Events.PAUSE, pause);
      events.off(Scenes.Events.RESUME, resume);
      this.loops().forEach((sound) => sound.destroy());
    });
  }

  play(event: GameEvent) {
    const key = EVENT_SOUNDS[event];
    if (key && this.scene.cache.audio.exists(key)) {
      this.scene.sound.play(key, { volume: SOUNDS[key].volume });
    }
  }

  setRunning(running: boolean) {
    if (!this.running) return;
    if (running && !this.running.isPlaying) this.running.play();
    if (!running && this.running.isPlaying) this.running.stop();
  }

  private startMusic() {
    if (this.scene.cache.audio.exists(MUSIC)) {
      this.music = this.addLoop(MUSIC);
      this.music?.play();
      return;
    }
    const { load } = this.scene;
    load.audio(MUSIC, soundUrls(MUSIC));
    load.once(Loader.Events.COMPLETE, () => {
      const { sys } = this.scene;
      // The round may already be over or paused when the download finishes.
      if (!sys.isActive() && !sys.isPaused()) return;
      this.music = this.addLoop(MUSIC);
      this.music?.play();
      if (sys.isPaused()) this.music?.pause();
    });
    load.start();
  }

  private addLoop(key: SoundKey) {
    if (!this.scene.cache.audio.exists(key)) return undefined;
    return this.scene.sound.add(key, {
      loop: true,
      volume: SOUNDS[key].volume,
    });
  }

  private loops() {
    return [this.running, this.music].filter(
      (sound): sound is Sound.BaseSound => sound !== undefined,
    );
  }
}
