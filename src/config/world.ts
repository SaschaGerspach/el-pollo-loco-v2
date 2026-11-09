import { GAME_WIDTH } from "./display";

// The old game ran at 720×480 and drew everything squeezed horizontally: vertical values scale
// by 2.25 (480 → 1080), horizontal level positions and speeds by 2.67 (720 → 1920).
export const LEVEL_WIDTH = GAME_WIDTH * 6;
export const GROUND_Y = 996;
export const GROUND_THICKNESS = 100;
export const GRAVITY = 3516;
// Fixed steps keep movement identical on every display; 240 Hz keeps it smooth at 120 and 144 Hz.
export const PHYSICS_FPS = 240;
// Screen x of Pepe's center, as in the old game (150 of 720 px). While the boss attacks from
// the left, Pepe moves to the same distance from the right edge.
export const CAMERA_PEPE_SCREEN_X = 400;
// Time constant in milliseconds for that move.
export const CAMERA_SIDE_SWITCH_TIME = 400;
