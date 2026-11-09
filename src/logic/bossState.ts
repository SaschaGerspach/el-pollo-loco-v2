export type BossState =
  | "waiting"
  | "alert"
  | "chase"
  | "windup"
  | "charge"
  | "pause"
  | "stagger"
  | "dead";

export interface BossConditions {
  // Horizontal gap between the bodies of the boss and Pepe; 0 when they overlap.
  gap: number;
  // Milliseconds since the current state began.
  stateTime: number;
  alertFinished: boolean;
  // A bottle hit the boss this frame.
  hit: boolean;
  dead: boolean;
}

export interface BossRules {
  alertDistance: number;
  attackRange: number;
  windupTime: number;
  chargeTime: number;
  pauseTime: number;
  staggerTime: number;
}

export function nextBossState(
  state: BossState,
  conditions: BossConditions,
  rules: BossRules,
): BossState {
  if (conditions.dead) return "dead";
  if (state === "waiting") {
    return conditions.gap <= rules.alertDistance ? "alert" : "waiting";
  }
  if (conditions.hit) return "stagger";

  const { stateTime } = conditions;
  switch (state) {
    case "alert":
      return conditions.alertFinished ? "chase" : "alert";
    case "chase":
      return conditions.gap <= rules.attackRange ? "windup" : "chase";
    case "windup":
      return stateTime >= rules.windupTime ? "charge" : "windup";
    case "charge":
      return stateTime >= rules.chargeTime ? "pause" : "charge";
    case "pause":
      return stateTime >= rules.pauseTime ? "chase" : "pause";
    case "stagger":
      return stateTime >= rules.staggerTime ? "chase" : "stagger";
    case "dead":
      return "dead";
  }
}

export function horizontalGap(
  centerA: number,
  widthA: number,
  centerB: number,
  widthB: number,
) {
  return Math.max(0, Math.abs(centerA - centerB) - (widthA + widthB) / 2);
}
