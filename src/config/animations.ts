import { CHICKENS } from "./chickens";
import { ENDBOSS_ANIMATIONS } from "./endboss";
import { BOTTLE_ANIMATIONS } from "./items";
import { PEPE_ANIMATIONS } from "./pepe";

export interface AnimationConfig {
  prefix: string;
  frames: readonly number[];
  frameRate: number;
  repeat: number;
}

export const animationKey = (atlas: string, name: string) => `${atlas}-${name}`;

// Animations per atlas, registered once in the preload scene.
export const ANIMATIONS: Record<string, Record<string, AnimationConfig>> = {
  pepe: PEPE_ANIMATIONS,
  "chicken-normal": CHICKENS["chicken-normal"].animations,
  "chicken-small": CHICKENS["chicken-small"].animations,
  endboss: ENDBOSS_ANIMATIONS,
  bottle: BOTTLE_ANIMATIONS,
};
