export interface Contact {
  // Bottom edge of Pepe's body before the current physics step.
  pepePreviousBottom: number;
  pepeVelocityY: number;
  enemyTop: number;
}

// Pepe stomps an enemy when he falls onto it from above; any other contact hurts him.
export function isStomp(contact: Contact, tolerance: number) {
  return (
    contact.pepeVelocityY > 0 &&
    contact.pepePreviousBottom <= contact.enemyTop + tolerance
  );
}
