const STORAGE_KEY = "el-pollo-loco:muted";

// Storage can be unavailable, for example in private windows; the setting then only lasts for
// the current visit.
export function loadMuted() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function saveMuted(muted: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(muted));
  } catch {
    // See loadMuted.
  }
}
