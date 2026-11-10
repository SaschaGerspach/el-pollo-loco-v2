import { describe, expect, it } from "vitest";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/display";
import { HUD, TOUCH_ZONES } from "../config/ui";
import { touchZoneAt, trailThumb, walkDirection } from "./touch";

describe("touchZoneAt", () => {
  const y = 900;

  it("puts the stick and the symbols into their zones", () => {
    const { ring, radius, symbols } = TOUCH_ZONES;
    // The stick waits smaller, fully on the canvas.
    const reach = (ring.radius + radius) * ring.restScale;
    expect(ring.x - reach).toBeGreaterThanOrEqual(0);
    expect(touchZoneAt(ring.x + reach, ring.y)).toBe("walk");
    expect(touchZoneAt(symbols.throw.x, symbols.throw.y)).toBe("throw");
    expect(touchZoneAt(symbols.jump.x, symbols.jump.y)).toBe("jump");
  });

  it("walks on the left half and throws further in than it jumps", () => {
    const half = GAME_WIDTH / 2;
    const threeQuarters = (GAME_WIDTH * 3) / 4;
    expect(touchZoneAt(0, y)).toBe("walk");
    expect(touchZoneAt(half - 1, y)).toBe("walk");
    expect(touchZoneAt(half, y)).toBe("throw");
    expect(touchZoneAt(threeQuarters - 1, y)).toBe("throw");
    expect(touchZoneAt(threeQuarters, y)).toBe("jump");
    expect(touchZoneAt(GAME_WIDTH, y)).toBe("jump");
  });

  it("continues the outer zones over the bars beside the canvas", () => {
    expect(touchZoneAt(-300, y)).toBe("walk");
    expect(touchZoneAt(GAME_WIDTH + 300, y)).toBe("jump");
  });

  it("covers the full height below the pause button but not the button", () => {
    const { x, y: buttonY, radius } = HUD.pauseButton;
    expect(touchZoneAt(x, buttonY + radius)).toBeUndefined();
    expect(touchZoneAt(x, TOUCH_ZONES.top)).toBe("throw");
    expect(touchZoneAt(0, GAME_HEIGHT)).toBe("walk");
  });
});

describe("the walking thumb", () => {
  const { deadZone, trail } = TOUCH_ZONES.steering;

  // Lands on the first x, slides through the others and tells where Pepe walks.
  function slide(...path: number[]) {
    let anchor = path[0];
    for (const x of path) anchor = trailThumb(anchor, x);
    return walkDirection(anchor, path.at(-1)!);
  }

  it("does not walk while it only presses down", () => {
    expect(slide(0)).toBeUndefined();
    expect(slide(0, deadZone - 1)).toBeUndefined();
    expect(slide(0, 1 - deadZone)).toBeUndefined();
  });

  it("walks the way it is pushed", () => {
    expect(slide(0, deadZone)).toBe("right");
    expect(slide(0, -deadZone)).toBe("left");
  });

  it("turns with a rock back of the trail and the dead zone, however far it pushed", () => {
    const rock = trail + deadZone;
    for (const far of [deadZone, trail, 100, 1000]) {
      expect(slide(0, far, far - rock)).toBe("left");
      expect(slide(0, -far, rock - far)).toBe("right");
    }
    expect(slide(0, 1000, 1000 - rock + 1)).toBeUndefined();
  });

  it("trails a thumb that slides in small steps like one that jumps", () => {
    const steps = Array.from({ length: 101 }, (_, index) => index * 3);
    for (const back of [270, 271]) {
      expect(slide(...steps, back)).toBe(slide(0, 300, back));
    }
  });
});
