import type { ChickenKind } from "./chickens";

// Positions from the old level, converted with x_new = (x_old + 719) × 2.67 because the old
// level started at x = -719. The old chickens were placed at random; here they are spread
// over the same range. Phase 10 replaces this with a Tiled map.
export const LEVEL = {
  chickens: [
    { kind: "chicken-normal", x: 3100 },
    { kind: "chicken-normal", x: 3900 },
    { kind: "chicken-small", x: 4300 },
    { kind: "chicken-normal", x: 4700 },
    { kind: "chicken-normal", x: 5500 },
    { kind: "chicken-small", x: 5900 },
    { kind: "chicken-normal", x: 6300 },
    { kind: "chicken-normal", x: 7100 },
    { kind: "chicken-small", x: 7500 },
    { kind: "chicken-normal", x: 7800 },
  ] satisfies { kind: ChickenKind; x: number }[],
  // Coins float at jump height (old y 200–300 × 2.25).
  coinY: 562,
  coins: [2451, 3251, 4317, 5117, 5917, 6984],
  // The five old bottles plus four more, since the plan asks for 8 to 10.
  bottles: [2451, 2838, 3500, 4410, 5300, 6045, 7077, 7600, 8200],
} as const;
