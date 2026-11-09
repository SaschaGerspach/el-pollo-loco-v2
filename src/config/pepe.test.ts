import { describe, expect, test } from "vitest";
import atlas from "../../public/assets/atlases/pepe.json";
import { PEPE, PEPE_ANIMATIONS } from "./pepe";

const frames = atlas.textures.flatMap((texture) => texture.frames);
const frameNames = new Set(frames.map((frame) => frame.filename));

describe("Pepe config matches the generated atlas", () => {
  test("every animation frame exists", () => {
    const missing = Object.values(PEPE_ANIMATIONS).flatMap(
      ({ prefix, frames: numbers }) =>
        numbers
          .map((number) => `${prefix}${number}`)
          .filter((name) => !frameNames.has(name)),
    );
    expect(missing).toEqual([]);
  });

  test("all frames share one source size", () => {
    const sizes = new Set(
      frames.map(({ sourceSize }) => `${sourceSize.w}×${sourceSize.h}`),
    );
    expect(sizes.size).toBe(1);
  });

  test("the body fits the frame and rests on its bottom edge", () => {
    const { w, h } = frames[0].sourceSize;
    const { width, height, offsetX, offsetY } = PEPE.body;
    expect(offsetX + width).toBeLessThanOrEqual(w);
    expect(offsetY + height).toBe(h);
  });
});
