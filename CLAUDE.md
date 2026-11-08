# El Pollo Loco v2

Neubau des Browser-Jump-'n'-Run „El Pollo Loco“ mit Phaser, TypeScript und Vite.

## Plan
- Der Neubau-Plan ist die verbindliche Grundlage: https://claude.ai/artifact/VdrtsV8fMU6ud4kgX8UDza
- Vor jeder Phase den aktuellen Stand der Phase im Plan lesen. Entscheidungen, die vom Plan
  abweichen, erst mit dem Nutzer klären und dann im Plan nachtragen.

## Altes Projekt
- Vanilla-JS-Version: `C:\Users\Anwender\OneDrive\Dokumente\Developer_Akademie\Spiele\EL_POLLO_LOCO`,
  GitHub `SaschaGerspach/EL-Pollo-Loco`.
- Nur lesend verwenden (Assets, Spielregeln). Dort nichts ändern.

## Feste Entscheidungen
- Interne Auflösung 1920×1080; Wechsel auf 1280×720 nur nach der Handy-Messung in Phase 4.
- Entwicklung über Docker Compose (Vite mit Polling, `node_modules` als eigenes Volume), npm.
- Alle Spielwerte zentral in `src/config/`.
- Kein Leben-System: Gesundheit 0 bedeutet verloren.
- Hosting bei ALL-INKL; Deployment per `lftp` (FTPS) aus GitHub Actions, ohne Drittanbieter-Actions.
