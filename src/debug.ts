const params = new URLSearchParams(window.location.search);

// ?debug shows physics bodies and an overlay with frame rate and Pepe's position.
export const DEBUG = params.has("debug");
// ?fps=144 forces a frame rate, to compare movement across refresh rates.
export const DEBUG_TARGET_FPS = Number(params.get("fps")) || undefined;
// ?demo lets Pepe walk and jump on his own, to measure performance on phones without controls.
export const DEBUG_DEMO = params.has("demo");
