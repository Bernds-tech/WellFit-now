# WellFit – Buddy KI Integration

Stand: 2026-04-28

## Ziel

Der KI-Buddy soll intelligente Antworten liefern, ohne die bestehende Sicherheitsarchitektur zu brechen.

Wichtig: Der Buddy darf motivieren, erklären, vorschlagen und durch Missionen führen. Er darf aber keine Punkte, XP, Rewards, Token/WFT, NFTs, Jackpot, Burn, Leaderboards oder Mission Completion autorisieren.

## Aktuelle Architektur

```txt
/mobile/ar UI
  ↓
ArBuddyEventPanel
  ↓
buddyKiRemoteProvider
  ↓
/api/buddy-ki
  ↓
Backend Provider Router
  ├─ Rules Provider als sicherer Fallback
  └─ optionaler OpenAI Provider, nur serverseitig und nur per Env aktiviert
  ↓
BuddyKiResponse
  ↓
UI-Optionen / AR-Buddy-Events
```

## Wichtige Regeln

- Keine API Keys im Frontend.
- Keine direkte LLM-Anbindung im Mobile Client.
- KI-Anfragen gehen über `/api/buddy-ki`.
- Unity bleibt reine Rendering-/Event-Schicht.
- Backend/App entscheiden später über Gültigkeit, Evidence, Completion und interne Rewards.
- Mobile bleibt frei von Token-, Presale-, Trading-, Staking- und NFT-Marktplatz-Funktionen.
- Bei Fehlern oder fehlender Modellkonfiguration fällt der Endpoint automatisch auf Rules zurück.

## Modi

```txt
rules      → sicher, deterministisch, immer verfügbar
mock       → Testdaten / später möglich
remote-ai  → Server-Provider-Modus über /api/buddy-ki
openai     → optionaler Modellprovider hinter /api/buddy-ki, nur per Env
```

## Frontend-Anbindung

`app/mobile/ar/components/ArBuddyEventPanel.tsx` ruft jetzt den Remote Provider auf.

Ablauf:

```txt
NativeArBuddyEvent oder Kamerastatus
  ↓
Intent-Mapping
  ↓
BuddyKiContext bauen
  ↓
buddyKiRemoteProvider.generateResponse(...)
  ↓
/api/buddy-ki
  ↓
Anzeige von title/message/options im AR-Guide-Panel
```

Fallback:

```txt
Wenn /api/buddy-ki fehlschlägt
  → buddyKiRemoteProvider nutzt buddyKiRulesProvider
Wenn UI trotzdem keine Remote-Antwort hat
  → lokaler buddyGuideFlow bleibt sichtbar
```

## Backend Endpoint

`app/api/buddy-ki/route.ts`

GET:

- meldet Service-Status
- meldet Provider-Modus
- zeigt, ob Modellkonfiguration vorhanden ist
- gibt keine API Keys aus

POST:

- validiert Intent
- sanitisiert Kontext
- nutzt optionalen Modellprovider nur bei vollständiger Konfiguration
- erzwingt Safety-Flags
- fällt bei Fehlern auf Rules zurück

## Optionale Modellkonfiguration

Der echte Modellprovider ist standardmäßig deaktiviert.

Zum Aktivieren müssen serverseitig gesetzt sein:

```txt
BUDDY_KI_PROVIDER=openai
BUDDY_KI_MODEL=<explizit gewaehlt>
OPENAI_API_KEY=<serverseitiger key>
```

Wenn eine Variable fehlt:

```txt
/api/buddy-ki bleibt im Rules-Modus.
```

## OpenAI Provider

`lib/buddyKi/buddyKiProviderOpenAi.ts`

Aufgaben:

- serverseitige Anfrage an das Modell
- Safety-Systemprompt
- JSON-only Antwortformat
- Antwort-Sanitizing
- Begrenzung von Titel, Nachricht und Optionen
- erlaubte Intents begrenzen
- Safety-Flags immer auf false für produktkritische Autorität

Der Provider ist absichtlich austauschbar. Später kann er durch einen anderen Modellprovider ersetzt werden, solange der `BuddyKiProvider`-Vertrag erhalten bleibt.

## Safety Contract

Jede `BuddyKiResponse` enthält:

```txt
rewardAuthorized: false
missionCompletionAuthorized: false
medicalDiagnosis: false
mobileTokenTrading: false
```

Das ist verbindlich. KI-Antworten sind Empfehlung, Erklärung und UX. Sie sind keine Autorität.

## Aktueller Status

```txt
[x] Rules Provider vorhanden.
[x] Remote Provider vorhanden.
[x] /api/buddy-ki vorhanden.
[x] AR-Guide-Panel ist mit buddyKiRemoteProvider verbunden.
[x] Optionaler serverseitiger OpenAI Provider vorhanden.
[x] Automatischer Rules-Fallback vorhanden.
[x] Keine API Keys im Frontend.
[x] Keine direkte KI im Handy.
[x] Safety-Flags bleiben serverseitig erzwungen.
[ ] Server-Env setzen und echten Provider testen.
[ ] Produktionsbuild ausführen.
[ ] Handytest auf /mobile/ar durchführen.
```

## Testbefehle

Service-Status:

```bash
curl https://www.wellfit-now.io/api/buddy-ki
```

POST-Test:

```bash
curl -X POST https://www.wellfit-now.io/api/buddy-ki \
  -H "Content-Type: application/json" \
  -d '{"intent":"suggestMission","context":{"language":"de","currentRoute":"/mobile/ar","cameraActive":true}}'
```

Erwartung ohne Env-Konfiguration:

```txt
providerMode: rules
response.meta.fallbackReason: model-provider-disabled
```

Erwartung mit vollständiger Env-Konfiguration:

```txt
providerMode: remote-ai
```

Wenn Modellprovider fehlschlägt:

```txt
providerMode: rules
response.meta.fallbackReason: model-provider-error
```

## Nächster Schritt

1. Build prüfen.
2. Server-Env setzen, falls echter Modelltest gewünscht ist.
3. `/api/buddy-ki` per GET/POST testen.
4. `/mobile/ar` am Handy öffnen.
5. AR-Guide-Panel prüfen: Provider-Anzeige, Text, Optionen, Fallback.
