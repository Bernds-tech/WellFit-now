# WellFit – Buddy KI Model Provider Runbook

Stand: 2026-04-28

## Ziel

Der Buddy-KI-Endpoint `/api/buddy-ki` laeuft aktuell sicher im Rules-Modus.

Dieses Runbook beschreibt, wie spaeter ein echter serverseitiger Modellprovider aktiviert wird, ohne Schluessel ins Frontend oder in die Mobile-App zu bringen.

## Aktueller sicherer Stand

```txt
/mobile/ar
→ buddyKiRemoteProvider
→ /api/buddy-ki
→ Rules Provider
→ sichere Buddy-Antwort
```

Getestet:

```txt
GET /api/buddy-ki: ok=true, providerMode=rules
POST /api/buddy-ki suggestMission: ok=true, providerMode=rules
```

## Sicherheitsregeln

- Keine Provider-Schluessel im Frontend.
- Keine direkte Modellanbindung im Handy.
- Keine Reward-, Punkte-, Token-, Jackpot- oder Mission-Completion-Autoritaet durch KI.
- KI liefert nur Text, Optionen, Hinweise und Empfehlungen.
- Backend/App bleiben Autoritaet.

## Aktivierungslogik

Der echte Modellprovider wird nur genutzt, wenn serverseitig alle benoetigten Variablen vorhanden sind und der Provider explizit aktiviert ist.

Wenn etwas fehlt oder fehlschlaegt:

```txt
/api/buddy-ki faellt automatisch auf Rules zurueck.
```

## Testplan

1. Servervariablen setzen.
2. PM2 mit aktualisierter Umgebung neu starten.
3. GET pruefen.
4. POST pruefen.
5. /mobile/ar am Handy testen.
6. Logs pruefen.
7. Falls Fehler: Rules-Fallback muss weiter funktionieren.

## Erwartete Provider-Modi

```txt
rules     = sicherer Standardmodus
remote-ai = echter serverseitiger Modellprovider aktiv
```

## Erfolgskriterien

- [ ] GET meldet service ready.
- [ ] POST liefert ok=true.
- [ ] /mobile/ar zeigt Buddy-Antwort.
- [ ] Kein Schluessel im Client-Bundle.
- [ ] Safety-Flags bleiben false.
- [ ] Rules-Fallback bleibt aktiv.
