export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;

// A phone or tablet held upright. index.html shows the rotate hint with the same media query,
// and the UI scene pauses a running round.
export const PORTRAIT_QUERY = "(orientation: portrait) and (pointer: coarse)";

// Phones and tablets, whose main input is a finger. A laptop with a touch screen does not match.
export const TOUCH_SCREEN_QUERY = "(pointer: coarse)";
