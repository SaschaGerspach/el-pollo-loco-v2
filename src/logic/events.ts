// Everything that happens in a round and that the UI or sound may react to.
export type GameEvent =
  | "pepe-hit"
  | "pepe-died"
  | "coin-collected"
  | "coins-complete"
  | "bottle-collected"
  | "bottle-thrown"
  | "bottle-splashed"
  | "chicken-defeated";

// Name under which the game scene emits these events.
export const GAME_EVENT = "game-event";
