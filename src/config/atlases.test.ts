import { describe, expect, test } from "vitest";
import bottle from "../../public/assets/atlases/bottle.json";
import chickenNormal from "../../public/assets/atlases/chicken-normal.json";
import chickenSmall from "../../public/assets/atlases/chicken-small.json";
import coin from "../../public/assets/atlases/coin.json";
import pepe from "../../public/assets/atlases/pepe.json";
import { ANIMATIONS } from "./animations";
import { CHICKENS, type ChickenKind } from "./chickens";
import { COIN, GROUND_BOTTLE } from "./items";
import { PEPE } from "./pepe";

interface AtlasFrame {
  filename: string;
  sourceSize: { w: number; h: number };
}

const ATLASES: Record<string, { textures: { frames: AtlasFrame[] }[] }> = {
  pepe,
  "chicken-normal": chickenNormal,
  "chicken-small": chickenSmall,
  coin,
  bottle,
};

const frames = (atlas: string) =>
  new Map(
    ATLASES[atlas].textures
      .flatMap((texture) => texture.frames)
      .map((frame) => [frame.filename, frame]),
  );

describe("config matches the generated atlases", () => {
  test("every animation frame exists", () => {
    const missing = Object.entries(ANIMATIONS).flatMap(
      ([atlas, animations]) => {
        const names = frames(atlas);
        return Object.values(animations).flatMap(
          ({ prefix, frames: numbers }) =>
            numbers
              .map((number) => `${prefix}${number}`)
              .filter((name) => !names.has(name))
              .map((name) => `${atlas}: ${name}`),
        );
      },
    );
    expect(missing).toEqual([]);
  });

  test("every item frame exists", () => {
    expect(frames("coin").has(COIN.frame)).toBe(true);
    for (const frame of GROUND_BOTTLE.frames) {
      expect(frames("bottle").has(frame), frame).toBe(true);
    }
  });

  test("all Pepe frames share one source size", () => {
    const sizes = new Set(
      [...frames("pepe").values()].map(
        ({ sourceSize }) => `${sourceSize.w}×${sourceSize.h}`,
      ),
    );
    expect(sizes.size).toBe(1);
  });

  test("Pepe's body fits the frame and rests on its bottom edge", () => {
    const { w, h } = frames("pepe").get("idle/1")!.sourceSize;
    const { width, height, offsetX, offsetY } = PEPE.body;
    expect(offsetX + width).toBeLessThanOrEqual(w);
    expect(offsetY + height).toBe(h);
  });

  test("chicken bodies fit their frames", () => {
    for (const kind of Object.keys(CHICKENS) as ChickenKind[]) {
      const { w, h } = frames(kind).get("walk/1")!.sourceSize;
      const { width, height, offsetX, offsetY } = CHICKENS[kind].body;
      expect(offsetX + width, kind).toBeLessThanOrEqual(w);
      expect(offsetY + height, kind).toBeLessThanOrEqual(h);
    }
  });
});
