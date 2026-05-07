# WF-DASH-PERSIST-001 – Dashboard Preferences lokal

Status: [~] In Arbeit / lokale Speicherung und Dashboard-Einbindung umgesetzt, Build/Test offen

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

## Bewusst noch nicht umgesetzt
- Firestore-Sync ist bewusst noch nicht eingebaut.
- Keine Reward-, Token-, Shop-, Leaderboard- oder Economy-Autorität wurde clientseitig erweitert.
- GitHub-Workflow wurde angelegt, aber für die letzten Commits ist noch kein sichtbarer Workflow-Lauf im Connector verfügbar.

## Nächster Schritt
1. Lokalen Build ausführen.
2. `/dashboard` testen.
3. `/dashboard/anpassen` testen.
4. `/dashboard/meine-karten` optional als Kontrollseite prüfen.
5. Wenn alles passt: Testroute später entfernen oder als interne Vorschau behalten.
6. Danach Firestore-Sync vorbereiten.

## Testhinweise
- Karten ein-/ausblenden.
- Kartengröße unten rechts ziehen.
- `/dashboard/anpassen` neu laden.
- `/dashboard` öffnen und prüfen, ob dieselbe Auswahl erscheint.
- Zurücksetzen testen.
- Build ausführen:

```bash
NODE_OPTIONS="--max-old-space-size=768" npm run build
```

PowerShell:

```powershell
$env:NODE_OPTIONS="--max-old-space-size=768"
npm run build
```
