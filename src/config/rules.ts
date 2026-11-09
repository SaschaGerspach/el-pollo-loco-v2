export const RULES = {
  maxHealth: 100,
  hitDamage: 20,
  // Milliseconds of round time after a hit in which Pepe takes no damage.
  invulnerability: 1000,
  maxBottles: 5,
  coinBonus: 20,
  // How far Pepe's feet may already be below an enemy's top and still count as stomping.
  stompTolerance: 20,
} as const;
