import { GAME_HEIGHT, GAME_WIDTH } from "./display";

const SCREENS = "assets/images/screens";

export const UI_FONT = {
  key: "Margarine",
  path: "assets/fonts/margarine.woff2",
};

// White text with a dark brown outline stays readable on the bright desert.
export const TEXT_STYLE = {
  fontFamily: UI_FONT.key,
  color: "#ffffff",
  stroke: "#5a2d0c",
  strokeThickness: 10,
} as const;
export const TEXT_HOVER_COLOR = "#ffd23f";

export const SCREEN_IMAGES = {
  start: { key: "screen-start", path: `${SCREENS}/start-1.png` },
  won: [
    { key: "screen-won-1", path: `${SCREENS}/win-1.png` },
    { key: "screen-won-2", path: `${SCREENS}/win-2.png` },
  ],
  lost: [
    { key: "screen-lost-1", path: `${SCREENS}/you-lost.png` },
    { key: "screen-lost-2", path: `${SCREENS}/oh-no-you-lost.png` },
  ],
} as const;

export const CONTROLS_TEXT =
  "A / D walk     Space jump     E throw     P / Esc pause";

export const START_SCREEN = {
  // Below the "LOCO" of the title painted into the start image.
  playButton: { x: 1200, y: 990, radius: 62 },
  controls: { x: GAME_WIDTH / 2, y: 60, fontSize: 44 },
  sound: { x: GAME_WIDTH - 40, y: 60, fontSize: 44 },
  legal: { x: 40, y: GAME_HEIGHT - 50, gap: 330, fontSize: 36 },
};

export const HUD = {
  x: 20,
  y: 10,
  rowHeight: 100,
  // The bar starts this far right of the icon, so the icon overlaps its left end.
  barOffsetX: 50,
  pauseButton: { x: GAME_WIDTH / 2, y: 70, radius: 44 },
};

export const PAUSE_MENU = {
  titleY: 280,
  firstButtonY: 450,
  buttonGap: 115,
  titleSize: 110,
  fontSize: 64,
  controlsY: 940,
  dim: 0.6,
};

export const END_SCREEN = {
  // The old game alternated between two images.
  frameTime: 600,
  // Pepe's dead animation plays before the screen appears.
  loseDelay: 1500,
  wonImageBox: { x: GAME_WIDTH / 2, y: 430, width: 1000, height: 700 },
  buttonsY: 960,
  buttonGap: 520,
  fontSize: 64,
  dim: 0.6,
};
