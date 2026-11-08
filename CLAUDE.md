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

## Freigegebene Abhängigkeiten
Diese dürfen ohne Rückfrage installiert werden, jeweils in der aktuellen stabilen Version.
Alles andere nur nach Rückfrage.
- Laufzeit: `phaser`
- Entwicklung: `vite`, `typescript`, `eslint`, `@eslint/js`, `typescript-eslint`,
  `eslint-config-prettier`, `prettier`, `vitest`, `@playwright/test` (inklusive Browser-Download)
- Außerhalb von npm: offizielles Docker-Image `node` (LTS), `actions/checkout`,
  `actions/setup-node`, `lftp` per `apt` auf dem CI-Runner, lokal installiertes `ffmpeg`

## Haltepunkte
Hier stoppt jeder automatische Lauf und wartet auf den Nutzer:
- Phase 4: Spielgefühl und Messung auf dem iPhone
- Phase 8: Zuordnung der Sounds per Gehör
- Phase 10: Rückmeldungen der Testspieler
- Phase 13: `main` aktualisieren und Livegang
