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
// The touch zones without keys; the pause button explains itself.
export const TOUCH_CONTROLS_TEXT =
  "Left: slide to walk     Right: tap to jump or throw";

export const START_SCREEN = {
  // Below the "LOCO" of the title painted into the start image.
  playButton: { x: 1200, y: 1005, radius: 62 },
  controls: { x: GAME_WIDTH / 2, y: 50, fontSize: 44 },
  fullscreen: { x: 40, y: 50, fontSize: 44 },
  sound: { x: GAME_WIDTH - 40, y: 50, fontSize: 44 },
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

// On touch devices the screen below the pause button is split into zones over its full height:
// a thumb on the left half walks, one on the right half jumps on the outside, where the thumb
// rests, or throws further in. A finger keeps the job of the zone it landed in.
export const TOUCH_ZONES = {
  top: HUD.pauseButton.y + 2 * HUD.pauseButton.radius,
  // Each zone ends where the next begins. The outer zones continue over the bars beside the
  // canvas up to the screen edge.
  zones: [
    { zone: "walk", until: GAME_WIDTH / 2 },
    { zone: "throw", until: (GAME_WIDTH * 3) / 4 },
    { zone: "jump", until: Infinity },
  ] as const,
  // The walking thumb steers from where it landed, so it never has to find a border: pushed to
  // one side, Pepe walks that way until it lifts. In CSS pixels, which have about the same size
  // on every phone, unlike game pixels.
  steering: {
    // A thumb shifts a little while pressing down; Pepe walks once it moved this far.
    deadZone: 10,
    // The point the thumb steers from trails it at this distance, so however far it pushed, a
    // rock back of this plus the dead zone turns Pepe around.
    trail: 20,
  },
  // A ring with an arrow on each side shows the stick. It moves to the walking thumb; without
  // one it waits in the corner, where it leaves Pepe uncovered.
  ring: { x: 150, y: 950, radius: 105, arrowRadius: 42, lineWidth: 6 },
  // The symbols of the other zones. The angle turns an arrow pointing right.
  symbols: {
    throw: { x: (GAME_WIDTH * 5) / 8, y: 950, angle: 135 },
    jump: { x: (GAME_WIDTH * 7) / 8, y: 950, angle: -90 },
  },
  radius: 60,
  // The colors of the old arrows; the circle keeps them visible on the bright desert.
  arrowColor: 0xfcd354,
  outlineColor: 0x2c2d30,
  circleColor: 0x000000,
  circleAlpha: 0.3,
  alpha: 0.35,
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
