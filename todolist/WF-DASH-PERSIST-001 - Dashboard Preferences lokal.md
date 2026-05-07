# WF-DASH-PERSIST-001 – Dashboard Preferences lokal

Status: [~] In Arbeit / lokale Speicherung und Dashboard-Einbindung umgesetzt, lokaler Build bestanden, UI-Test offen

## Ziel
Die Dashboard-Anpassungsseite soll nicht nur eine temporäre Vorschau sein. Auswahl und freie Kartengrößen sollen erhalten bleiben, wenn die Seite neu geladen wird. Die echte Dashboard-Startseite soll dieselbe gespeicherte Auswahl nutzen.

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
- Lade-Flackern auf `/dashboard/anpassen` verhindert.
- Karten-Optik auf kompaktere, professionellere Darstellung reduziert.
- `app/dashboard/components/DashboardSavedCardsPanel.tsx` angelegt.
- Testroute `app/dashboard/meine-karten/page.tsx` angelegt.
- Echte `/dashboard`-Seite nutzt jetzt `DashboardSavedCardsPanel` statt der alten statischen `DashboardCards`-Sektion.

## Build-Status
- Lokaler Build unter Windows/PowerShell bestanden.
- Befehl:

```powershell
$env:NODE_OPTIONS="--max-old-space-size=768"
npm run build
```

- Ergebnis:
  - Next.js Build erfolgreich kompiliert.
  - TypeScript erfolgreich abgeschlossen.
  - 36/36 statische Seiten generiert.
  - Routen `/dashboard`, `/dashboard/anpassen` und `/dashboard/meine-karten` sind im Build enthalten.

## Bewusst noch nicht umgesetzt
- Firestore-Sync ist bewusst noch nicht eingebaut.
- Keine Reward-, Token-, Shop-, Leaderboard- oder Economy-Autorität wurde clientseitig erweitert.
- GitHub-Workflow wurde angelegt, aber für die letzten Commits ist noch kein sichtbarer Workflow-Lauf im Connector verfügbar.

## Nächster Schritt
1. `/dashboard` im Browser testen.
2. `/dashboard/anpassen` testen.
3. `/dashboard/meine-karten` optional als Kontrollseite prüfen.
4. Wenn alles optisch und funktional passt: Testroute später entfernen oder als interne Vorschau behalten.
5. Danach Firestore-Sync vorbereiten.

## Testhinweise
- Karten ein-/ausblenden.
- Kartengröße unten rechts ziehen.
- `/dashboard/anpassen` neu laden.
- `/dashboard` öffnen und prüfen, ob dieselbe Auswahl erscheint.
- Zurücksetzen testen.
