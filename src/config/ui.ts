import type { Action } from "./controls";
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
  fullscreen: { x: 40, y: 60, fontSize: 44 },
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

// Shown on touch devices: walking bottom left, jumping and throwing bottom right, in the order
// of the old game. The angle turns an arrow pointing right.
export const TOUCH_BUTTONS = {
  radius: 90,
  // Half the distance between neighbouring buttons, so a thumb between them still hits one.
  hitRadius: 105,
  buttons: {
    left: { x: 130, y: 950, angle: 180 },
    right: { x: 340, y: 950, angle: 0 },
    jump: { x: 1580, y: 950, angle: -90 },
    throw: { x: 1790, y: 950, angle: 135 },
  } satisfies Record<Action, { x: number; y: number; angle: number }>,
  // The colors of the old arrows; the circle keeps them visible on the bright desert.
  arrowColor: 0xfcd354,
  outlineColor: 0x2c2d30,
  circleColor: 0x000000,
  circleAlpha: 0.3,
  alpha: 0.6,
  pressedAlpha: 1,
};

export const PAUSE_MENU = {
  titleY: 230,
  firstButtonY: 380,
  buttonGap: 105,
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
