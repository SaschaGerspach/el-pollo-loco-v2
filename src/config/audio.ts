import type { GameEvent } from "../logic/events";

export const AUDIO_PATH = "assets/audio";

// One entry per file in public/assets/audio (each as .ogg and .mp3). The volume mixes the
// sounds; all files were normalized to the same loudness.
export const SOUNDS = {
  music: { volume: 0.3 },
  "el-pollo-loco": { volume: 0.8 },
  running: { volume: 0.5 },
  jump: { volume: 0.8 },
  bottle: { volume: 0.8 },
  throw: { volume: 0.8 },
  glass: { volume: 0.9 },
  chicken: { volume: 0.8 },
  win: { volume: 0.8 },
} as const;

export type SoundKey = keyof typeof SOUNDS;

// Loaded after the start, so the loading screen does not wait for it.
export const MUSIC: SoundKey = "music";
// Loops while Pepe walks.
export const RUNNING: SoundKey = "running";

// The sound for each event. Events without a sound yet stay silent; adding one only needs the
// file and an entry here.
export const EVENT_SOUNDS: Record<GameEvent, SoundKey | null> = {
  "pepe-jumped": "jump",
  "pepe-hit": null,
  "pepe-died": null,
  "coin-collected": null,
  "coins-complete": null,
  "bottle-collected": "bottle",
  "bottle-thrown": "throw",
  "bottle-splashed": "glass",
  "chicken-defeated": "chicken",
  "boss-alerted": "el-pollo-loco",
  "boss-attack": null,
  "boss-hit": "chicken",
  "boss-died": null,
  "round-won": "win",
};
