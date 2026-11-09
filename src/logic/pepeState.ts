export type PepeState =
  "idle" | "long-idle" | "walk" | "jump" | "land" | "hurt" | "dead";

export interface PepeConditions {
  onGround: boolean;
  moving: boolean;
  idleTime: number;
  landingFinished: boolean;
  // True while the hurt animation after a hit is running.
  hurt: boolean;
  dead: boolean;
}

export function nextPepeState(
  state: PepeState,
  conditions: PepeConditions,
  longIdleDelay: number,
): PepeState {
  if (conditions.dead) return "dead";
  if (conditions.hurt) return "hurt";
  if (!conditions.onGround) return "jump";
  if (state === "jump") return "land";
  if (state === "land" && !conditions.landingFinished) return "land";
  if (conditions.moving) return "walk";
  if (conditions.idleTime >= longIdleDelay) return "long-idle";
  return "idle";
}
