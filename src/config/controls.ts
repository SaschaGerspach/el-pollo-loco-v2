// Keys per action, as in the old game. Several keys per action are possible.
export const CONTROLS = {
  left: ["A"],
  right: ["D"],
  jump: ["SPACE"],
  throw: ["E"],
} as const satisfies Record<string, readonly string[]>;

export type Action = keyof typeof CONTROLS;
