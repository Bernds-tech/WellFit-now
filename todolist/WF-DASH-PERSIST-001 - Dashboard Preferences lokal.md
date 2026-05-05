# WF-DASH-PERSIST-001 – Dashboard Preferences lokal

Status: [~] In Arbeit / lokale Speicherung umgesetzt

## Ziel
Die Dashboard-Anpassungsseite soll nicht nur eine temporäre Vorschau sein. Auswahl und freie Kartengrößen sollen erhalten bleiben, wenn die Seite neu geladen wird.

## Umgesetzt
- `app/dashboard/hooks/useDashboardPreferences.ts` angelegt.
- Lokale Speicherung über `localStorage` mit Key `wellfit-dashboard-preferences-v1` vorbereitet.
- Gemeinsames Preference-Modell eingeführt:
  - `pinnedCardIds`
  - `cardSizes`
  - `cardDimensions`
- `app/dashboard/anpassen/page.tsx` auf den Preference-Hook umgestellt.
- Karten-Auswahl wird lokal gespeichert.
- Freie Kartengrößen werden lokal gespeichert.
- Reset-Button ergänzt.
- Boxen-/Karten-Optik wurde bewusst nicht weiter verändert.

## Bewusst noch nicht umgesetzt
- Die echte `/dashboard`-Seite wurde noch nicht überschrieben, weil der vollständige aktuelle Dateiinhalt im Connector nicht sicher als editierbarer Text verfügbar war.
- Firestore-Sync ist bewusst noch nicht eingebaut.
- Keine Reward-, Token-, Shop-, Leaderboard- oder Economy-Autorität wurde clientseitig erweitert.

## Nächster Schritt
1. Lokalen Build ausführen.
2. `/dashboard/anpassen` testen.
3. Danach die echte `/dashboard`-Seite kontrolliert an `useDashboardPreferences` anbinden.
4. Erst danach Firestore-Sync vorbereiten.

## Testhinweise
- Karten ein-/ausblenden.
- Kartengröße unten rechts ziehen.
- Seite neu laden.
- Prüfen, ob Auswahl und freie Größen erhalten bleiben.
- Zurücksetzen klicken.
- Build ausführen:

```bash
NODE_OPTIONS="--max-old-space-size=768" npm run build
```
