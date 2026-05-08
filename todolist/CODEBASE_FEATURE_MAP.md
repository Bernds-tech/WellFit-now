# CODEBASE FEATURE MAP - WELLFIT

Stand: 2026-05-08
Status: Bestandskarte gegen Doppelarbeit

## Zweck

Diese Datei zeigt, was im Code bereits vorhanden ist, was nur vorbereitet ist und was noch fehlt.

Ziel:
- nicht doppelt bauen
- vorhandene Module erweitern statt neue Parallelstrukturen anlegen
- offene Aufgaben gezielt an echte Dateien koppeln
- grosse Codebloecke schneller planen und umsetzen

## Fuehrende Regeln

- Interne Punkte zuerst.
- Kein echter Token, kein WFT, kein NFT, kein Trading, kein Staking, kein Presale in der Beta.
- Name, Token-Name und Blockchain-Branding erst ganz am Schluss.
- App-Store-Pfad zuerst sichern.
- Punkte, XP, Rewards, Mission Completion und Anti-Cheat duerfen langfristig nicht clientseitig autorisiert werden.
- Vor jedem grossen Codeblock vorhandene Dateien in dieser Map pruefen.

## Aktuelle Code-Inventur

Letzter lokaler Lauf:

- Scanned files: 378
- App routes: 30
- API routes: 1
- Economy code files: 6

Output-Datei:

- `scripts/wellfit-dev-agent/output/code-inventory-report.md`

## Aktuelle Bestandsbewertung

| Bereich | Status | Bereits vorhanden | Noch offen |
|---|---|---|---|
| 25-Mrd.-Punkte-Logik | vorhanden / statisch | `config/economy.ts` mit `totalSupply`, `reserve`, `circulating`, `burned`, `locked` | dynamisch aus Ledger/Reserve berechnen |
| Reward-Faktor nach Reserve | vorhanden / statisch | `getRewardRate(reserve, totalSupply)` | in RewardPreview und Tagesmissionen integrieren |
| Preis-Faktor nach Reserve | vorhanden / statisch | `getPriceRate(reserve, totalSupply)` | Punkte-Shop, Futter, Goodies, Items daran anbinden |
| Token/NFT-Schalter | vorhanden / deaktiviert | `tokenEnabled: false`, `nftEnabled: false`, `activeCurrency: points` | deaktiviert lassen bis nach stabiler Beta |
| Interne Caps | vorbereitet | `lib/economy/caps.ts` | reale Tages-/User-/Missionstyp-Nutzung anbinden |
| Ledger-Typen | vorbereitet | `lib/economy/ledger.ts` | echte serverseitige Persistenz / Firestore / Functions |
| Ledger-Projektion | vorbereitet | `lib/economy/projection.ts` | echte Ledger-Events statt Demo-/Client-Daten nutzen |
| RewardPreview | vorbereitet | `lib/economy/rewardPreview.ts` | Tagesmissionen, Punkte-Shop, Buddy-Sinks anbinden |
| Dashboard Economy | eingebaut | `DashboardEconomyPanel`, `dashboardSnapshot.ts` | Live-Ledger-Summary, Review-/Correction-Status anzeigen |
| Dashboard Mission Preview | eingebaut | `missionRewardPreview.ts`, `DashboardMissionPanel`, `useDashboardActions` | Server-Preview statt Client-Preview vorbereiten |
| Tagesmissionen | vorhanden | `app/missionen/tagesmissionen/page.tsx`, `rewardEngine.ts`, `useDailyMissionFirebase.ts` | auf internes Ledger / serverseitige Completion umstellen |
| Mission-Buddy-Bridge | vorhanden / clientnah | `app/missionen/lib/missionBuddyBridge.ts` nutzt Firestore Transaction und verhindert doppelte Anwendung | Servervalidierung / Cloud Function / Ledger-Event statt Client-Autoritaet |
| Buddy-KI API | vorhanden / sicherer Fallback | `app/api/buddy-ki/route.ts`, Rules Provider, optional OpenAI-Provider | echte Modelltests nur mit Server-Env; Buddy darf keine Rewards autorisieren |
| Punkte-Shop | Placeholder vorhanden | `app/punkte-shop/page.tsx` | echte interne Punkte-Sinks, Preise, Item-Datenmodell, Audit |
| Marktplatz | Placeholder vorhanden | `app/marktplatz/page.tsx` | kein NFT-/Trading-Markt; nur sichere interne Struktur |
| Firestore Rules | vorhanden / teilweise hart | `firestore.rules` blockiert viele serverseitige Collections fuer Client Writes | `users.points/xp` und Tagesmissionsstate weiter haerten |
| Health/Watch/Location | Architektur vorhanden | `HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md` | Consent-Texte, Fallbacks, Datenmodell |
| AR/Unity | vorhanden / vorbereitet | Unity-Scripts und Mobile/AR-Routen | Samstag testen, ARCore-Kette pruefen |
| Agent/Memory | vorhanden | Dev-Agent, Watch-Agent, Memory-Sync, Quality-Gate, Code-Inventur | Code-Inventur regelmaessig in Entscheidungen einbeziehen |

## Gefundene zentrale Code-Dateien

### Economy / Abrechnung

- `config/economy.ts` - 25-Mrd.-Supply, Reserve, RewardRate, PriceRate, Token/NFT deaktiviert.
- `lib/economy/ledger.ts` - Ledger-Events, Status, Reason Codes, serverseitige Autoritaetspruefung.
- `lib/economy/caps.ts` - DailyEmissionCap, UserDailyCap, MissionTypeCaps, EconomyHealthScore.
- `lib/economy/projection.ts` - Projektion von Ledger-Events auf Punkte, XP, Streak.
- `lib/economy/rewardPreview.ts` - sichere RewardPreview-Entscheidung.
- `lib/economy/dashboardSnapshot.ts` - Dashboard-Snapshot aus interner Economy.
- `lib/economy/index.ts` - zentrale Economy-Exports.

### Dashboard

- `app/dashboard/page.tsx` - Dashboard-Hauptseite.
- `app/dashboard/components/DashboardEconomyPanel.tsx` - interne Economy-Anzeige.
- `app/dashboard/components/DashboardMissionPanel.tsx` - Mission + RewardPreview.
- `app/dashboard/components/DashboardAvatarPanel.tsx` - Buddy-Status und Futteraktion.
- `app/dashboard/hooks/useDashboardActions.ts` - Mission starten und Buddy fuettern.
- `app/dashboard/lib/missionRewardPreview.ts` - RewardPreview fuer Dashboard-Mission.
- `app/dashboard/lib/personalMission.ts` - persoenliche Dashboard-Mission.
- `app/dashboard/lib/dashboardUser.ts` - lokale Nutzer-/Cache-Logik.

### Tagesmissionen

- `app/missionen/tagesmissionen/page.tsx` - Tagesmissionen, Slots, Start/Complete, Reward-Berechnung, Buddy-Bridge.
- `app/missionen/tagesmissionen/rewardEngine.ts` - Diversity-, Anti-Farming- und Streak-Multiplikatoren.
- `app/missionen/tagesmissionen/useDailyMissionFirebase.ts` - lokale/Firebase-Tagesmissionen, Streaks, XP, Level.
- `app/missionen/tagesmissionen/missions.ts` - Missionsdaten.
- `app/missionen/lib/missionBuddyBridge.ts` - Mission-Buddy-Bridge mit Firestore-Transaktion.

### Buddy / KI

- `app/api/buddy-ki/route.ts` - Buddy-KI API mit Fallback, Sanitizing, Safety Flags.
- `lib/buddyKi/buddyKiProviderRules.ts` - Rules Provider.
- `lib/buddyKi/buddyKiProviderOpenAi.ts` - optionaler serverseitiger OpenAI Provider.
- `lib/buddyKi/buddyKiTypes.ts` - Typen fuer Buddy-KI.

### Shop / Marktplatz

- `app/punkte-shop/page.tsx` - Placeholder fuer internen Punkte-Shop.
- `app/marktplatz/page.tsx` - Placeholder fuer Marktplatz, ohne echte NFT-/Token-Funktion.

### Security / Backend

- `firestore.rules` - Firestore-Regeln.
- Viele sensitive Collections sind fuer Client-Create/Update/Delete blockiert: `missionRewardEvents`, `missionRewardPreviews`, `missionEvidenceReviews`, `missionPatternReviews`, `missionCooldownReviews`, `systemReserveSnapshots`, `userInventory`, `buddyCapabilities`, `nfcScanEvents`.
- Achtung: `users` erlaubt aktuell noch Updates fuer `points`, `xp`, `level`, `stepsToday`, `avatar`. Das ist Beta/MVP-nah, muss spaeter fuer echte Abrechnung serverseitig gehaertet werden.
- Achtung: `userDailyMissionState`, `userDailyStreaks`, `userLevels` erlauben clientnahe Writes fuer Owner. Fuer echte Reward-Autoritaet spaeter haerten.

## Was bereits funktioniert / vorhanden ist

- Dashboard baut erfolgreich.
- Dashboard zeigt interne Punkte und Economy-Status.
- Mission RewardPreview ist im Dashboard sichtbar.
- Mission Start nutzt Preview-Entscheidung.
- Tagesmissionen haben eigene Reward-Berechnung mit Diversity-, Anti-Farming- und Streak-Multiplikator.
- Tagesmissionen koennen gestartet und abgeschlossen werden.
- Mission-Buddy-Bridge verhindert doppelte Anwendung pro Nutzer/Tag/Mission.
- Buddy-KI API hat Fallback und Safety Flags.
- Punkte-Shop und Marktplatz sind sichere Placeholder ohne echte Token-/NFT-Funktion.
- Firestore Rules blockieren viele serverseitige Reward-/Proof-/NFC-/Capability-Collections fuer Client Writes.

## Was nur vorbereitet ist

- Internes Ledger existiert als TypeScript-Logik, aber noch nicht als echte serverseitige Datenhaltung.
- RewardPreview existiert als interne Entscheidung, aber noch nicht als serverseitige API/Cloud Function.
- Economy Caps nutzen aktuell Demo-/Snapshot-Werte, noch keine echte Tages-/Nutzerhistorie.
- Reserve-/Umlauf-/Burn-/Locked-Werte existieren statisch, aber noch nicht dynamisch aus Ledger und Sinks.
- Punkte-Shop ist noch kein echter Shop mit internen Spend-Events.
- Marktplatz ist noch kein echter, sicherer Content-/Item-Katalog.

## Was noch fehlt / naechste grosse Codebloecke

### Block A - Economy verbinden

- `config/economy.ts` mit `lib/economy/caps.ts` und `rewardPreview.ts` verbinden.
- RewardRate aus Reserve in RewardPreview einrechnen.
- PriceRate aus Reserve in Punkte-Shop / Futterpreise / Goodiepreise einrechnen.
- Reserve-/Circulating-/Burned-/Locked-Werte als Snapshot-Typ vorbereiten.

### Block B - Missionen auf Ledger vorbereiten

- Tagesmissionen von reinem `rewardEngine.ts` auf `createInternalRewardPreviewDecision` erweitern.
- `completeMission` soll Ledger-kompatible Events vorbereiten.
- Mission-Buddy-Bridge soll Ledger-/RewardEvent-Payload vorbereiten.
- Doppelte Punktevergabe weiterhin verhindern.

### Block C - Punkte-Shop als interner Sink

- Shop-Item-Datenmodell anlegen.
- Preise mit `getPriceRate` dynamisch machen.
- Futter / Kleidung / Schilder / Buddy-Upgrades als interne Punkte-Sinks vorbereiten.
- Noch keine NFT-/Token-/Wallet-Funktion.

### Block D - Firestore/Backend-Sicherheit

- `users.points`, `users.xp`, `userDailyMissionState`, `userLevels` als MVP-Risiko markieren und schrittweise serverseitig umbauen.
- Cloud Function oder API-Route fuer RewardPreview/Completion vorbereiten.
- `missionRewardEvents` als serverseitige Audit-Events planen.

### Block E - Dashboard/UX

- Ledger-/Review-/Correction-Summary anzeigen.
- Dem Nutzer klar zeigen: interne Punkte, keine Token.
- Bei Review/Blocked gute Hinweise anzeigen.
- Punkte-Shop und Marktplatz klar als interne Beta-Struktur kennzeichnen.

## Nicht nochmal neu bauen

Diese Dinge existieren bereits und sollen erweitert werden:

- Kein neues Economy-Config-Modul parallel zu `config/economy.ts` bauen.
- Kein zweites Ledger neben `lib/economy/ledger.ts` bauen.
- Kein zweites RewardPreview-System neben `lib/economy/rewardPreview.ts` bauen.
- Kein zweiter DailyMission RewardEngine ohne Abgleich mit `rewardEngine.ts` bauen.
- Kein paralleler Buddy-KI-Endpunkt neben `app/api/buddy-ki/route.ts` bauen.
- Kein echter Token-/NFT-Marktplatz in Mobile bauen.

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/MASTER_OPEN_DONE_LIST.md`, `todolist/TODO_INDEX.md`, `todolist/PROJECT_STRUCTURE.md` und diese Datei. Bevor du neue Funktionen baust, pruefe die passende Datei in dieser Codebase Map. Erweitere vorhandene Module statt neue Parallelmodule zu bauen. Wenn du feststellst, dass eine Logik bereits existiert, verlinke sie hier und arbeite darauf weiter. Keine echten Token-/NFT-/Trading-/Presale-Funktionen vor stabiler interner Punkte- und Abrechnungslogik.
