const STORAGE_KEY = "el-pollo-loco:muted";

// Phaser reads the mute state back from the gain of its master node, which takes a new value only
// once the audio has rendered it. Read right after a switch, it still had the old state, so the
// game keeps the setting itself.
let muted = false;

export const isMuted = () => muted;

// Applies the setting from an earlier visit. Storage can be unavailable, for example in private
// windows; the setting then only lasts for the current visit.
export function restoreMuted(sound: { mute: boolean }) {
  try {
    muted = localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    muted = false;
  }
  sound.mute = muted;
}

export function setMuted(sound: { mute: boolean }, value: boolean) {
  muted = value;
  sound.mute = value;
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // See restoreMuted.
  }
}
