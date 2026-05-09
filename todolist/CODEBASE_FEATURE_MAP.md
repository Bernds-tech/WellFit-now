# CODEBASE FEATURE MAP - WELLFIT

Stand: 2026-05-09
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

Letzter bekannter lokaler Lauf:

- Scanned files: 393
- App routes: 30
- API routes: 5
- Economy code files: 12

Output-Datei:

- `scripts/wellfit-dev-agent/output/code-inventory-report.md`

## Aktuelle Bestandsbewertung

| Bereich | Status | Bereits vorhanden | Noch offen |
|---|---|---|---|
| 25-Mrd.-Punkte-Logik | vorhanden / statisch | `config/economy.ts` mit `totalSupply`, `reserve`, `circulating`, `burned`, `locked` | dynamisch aus Ledger/Reserve berechnen |
| Reward-Faktor nach Reserve | vorhanden | `getRewardRate`, `lib/economy/reserve.ts`, `rewardPreview.ts` | echte Tages-/User-Historie anbinden |
| Preis-Faktor nach Reserve | vorhanden | `getPriceRate`, `shopItems.ts`, `spend.ts` | echte Spend-Transaktion und Audit anbinden |
| Token/NFT-Schalter | vorhanden / deaktiviert | `tokenEnabled: false`, `nftEnabled: false`, `activeCurrency: points` | deaktiviert lassen bis nach stabiler Beta |
| Interne Caps | vorbereitet | `lib/economy/caps.ts` | reale Tages-/User-/Missionstyp-Nutzung anbinden |
| Ledger-Typen | vorbereitet | `lib/economy/ledger.ts` | echte serverseitige Persistenz / Firestore / Functions |
| Server Ledger Drafts | vorbereitet / ohne Write | `lib/economy/serverLedgerDraft.ts`, API-Antworten mit `serverDraft`/`serverDrafts` | echte Firestore/Admin-Persistenz spaeter server-only aktivieren |
| Server Persistence Guardrail | vorbereitet / draft-only | `lib/economy/serverPersistence.ts`, `app/api/economy/persistence-status/route.ts`, `security-plan` gibt Persistence-Status mit aus | echte Persistenz erst nach Admin/Auth/Emulator/Rules-Haertung aktivieren |
| Ledger-Projektion | vorbereitet | `lib/economy/projection.ts` | echte Ledger-Events statt Demo-/Client-Daten nutzen |
| RewardPreview | vorbereitet / API-nah | `lib/economy/rewardPreview.ts`, `app/api/economy/reward-preview/route.ts` | Auth, Rate Limit, Persistenz, Audit |
| SpendPreview | vorbereitet / API-nah | `lib/economy/spend.ts`, `app/api/economy/spend-preview/route.ts` | echte Spend-Completion und Audit |
| Server Completion Plan | vorbereitet | `lib/economy/serverCompletionPlan.ts`, `docs/architecture/ECONOMY_SERVER_COMPLETION_AND_FIRESTORE_HARDENING.md`, `app/api/economy/security-plan/route.ts` | UI schrittweise auf Server-Completion umstellen |
| Mission Completion API | vorbereitet / nicht final autoritativ | `lib/economy/completion.ts`, `app/api/economy/complete-mission/route.ts` | Auth, Persistenz, Ledger-Write, Client-Umstellung |
| Dashboard Economy | eingebaut | `DashboardEconomyPanel`, `dashboardSnapshot.ts` | Live-Ledger-Summary, Review-/Correction-Status anzeigen |
| Dashboard Mission Preview | eingebaut | `serverPreviewApi.ts`, `DashboardMissionPanel`, `useDashboardActions` | Completion-API statt direktem `users.points`-Patch nutzen |
| Tagesmissionen | vorhanden | `app/missionen/tagesmissionen/page.tsx`, `rewardEngine.ts`, `useDailyMissionFirebase.ts` | auf internes Ledger / serverseitige Completion umstellen |
| Mission-Buddy-Bridge | vorhanden / clientnah | `app/missionen/lib/missionBuddyBridge.ts` nutzt Firestore Transaction und verhindert doppelte Anwendung | Servervalidierung / Cloud Function / Ledger-Event statt Client-Autoritaet |
| Buddy-KI API | vorhanden / sicherer Fallback | `app/api/buddy-ki/route.ts`, Rules Provider, optional OpenAI-Provider | echte Modelltests nur mit Server-Env; Buddy darf keine Rewards autorisieren |
| Punkte-Shop | Placeholder vorhanden | `app/punkte-shop/page.tsx` | echte interne Punkte-Sinks, Preise, Item-Datenmodell, Audit |
| Marktplatz | Placeholder vorhanden | `app/marktplatz/page.tsx` | kein NFT-/Trading-Markt; nur sichere interne Struktur |
| Firestore Rules | vorbereitet / markiert | `firestore.rules` trennt Safe-Profile-Felder und temporäre Economy-Brueckenfelder | harte Sperre erst nach Server-Persistenz/Emulator-Tests |
| Health/Watch/Location | Architektur vorhanden | `HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md` | Consent-Texte, Fallbacks, Datenmodell |
| AR/Unity | separater Arbeitsbereich | `native/unity/WellFitBuddyAR/**` | in diesem Hauptchat nicht bearbeiten |
| Agent/Memory | vorhanden | Dev-Agent, Watch-Agent, Memory-Sync, Quality-Gate, Code-Inventur | Code-Inventur regelmaessig in Entscheidungen einbeziehen |

## Gefundene zentrale Code-Dateien

### Economy / Abrechnung

- `config/economy.ts` - 25-Mrd.-Supply, Reserve, RewardRate, PriceRate, Token/NFT deaktiviert.
- `lib/economy/ledger.ts` - Ledger-Events, Status, Reason Codes, serverseitige Autoritaetspruefung.
- `lib/economy/caps.ts` - DailyEmissionCap, UserDailyCap, MissionTypeCaps, EconomyHealthScore.
- `lib/economy/projection.ts` - Projektion von Ledger-Events auf Punkte, XP, Streak.
- `lib/economy/reserve.ts` - Reserve-Snapshot und Reserve-basierte Reward-/Preislogik.
- `lib/economy/rewardPreview.ts` - sichere RewardPreview-Entscheidung.
- `lib/economy/spend.ts` - interne SpendPreview fuer Punkte-Sinks.
- `lib/economy/serverCompletionPlan.ts` - Risiko-Felder, server-only Collections und Completion-Stufen.
- `lib/economy/serverPersistence.ts` - Persistenz-Guardrails, aktuell `draft_only` und `writeEnabled: false`.
- `lib/economy/completion.ts` - servernahe Mission-Completion-Entscheidung ohne finale Client-Autoritaet.
- `lib/economy/serverLedgerDraft.ts` - Firestore-/Ledger-Draft-Records fuer spaetere server-only Persistenz, aktuell `writeNow: false`.
- `lib/economy/dashboardSnapshot.ts` - Dashboard-Snapshot aus interner Economy.
- `lib/economy/index.ts` - zentrale Economy-Exports.

### Economy APIs

- `app/api/economy/reward-preview/route.ts` - RewardPreview-API, keine finale Punktegutschrift, gibt `serverDraft` zurueck.
- `app/api/economy/spend-preview/route.ts` - SpendPreview-API, kein echter Kauf, gibt `serverDraft` zurueck.
- `app/api/economy/security-plan/route.ts` - Security-/Completion-Plan fuer Firestore-Haertung, gibt Persistence-Status mit aus.
- `app/api/economy/persistence-status/route.ts` - zeigt explizit, dass Economy-Persistenz aktuell draft-only und ohne finalen Write bleibt.
- `app/api/economy/complete-mission/route.ts` - Mission-Completion-Entscheidung, noch ohne finale Persistenz/Gutschrift, gibt `serverDrafts` zurueck.

### Dashboard

- `app/dashboard/page.tsx` - Dashboard-Hauptseite.
- `app/dashboard/components/DashboardEconomyPanel.tsx` - Anzeige der internen Beta-Economy, Caps, RewardPreview und Ledger-/Review-/Correction-Summary.
- `app/dashboard/components/DashboardMissionPanel.tsx` - Mission + RewardPreview und Preview-Quelle.
- `app/dashboard/components/DashboardAvatarPanel.tsx` - Buddy-Status und Futteraktion.
- `app/dashboard/hooks/useDashboardActions.ts` - Mission starten und Buddy fuettern; aktuell noch clientnaher Persist-Patch.
- `app/dashboard/lib/serverPreviewApi.ts` - Dashboard ruft Server-Preview- und Completion-APIs zuerst.
- `app/dashboard/lib/missionRewardPreview.ts` - lokaler Fallback fuer Dashboard-Mission.
- `app/dashboard/lib/personalMission.ts` - persoenliche Dashboard-Mission.
- `app/dashboard/lib/dashboardUser.ts` - lokale Nutzer-/Cache-Logik.

### Tagesmissionen

- `app/missionen/tagesmissionen/page.tsx` - Tagesmissionen, Slots, Start/Complete, Reward-Berechnung, Buddy-Bridge.
- `app/missionen/tagesmissionen/rewardEngine.ts` - Diversity-, Anti-Farming- und Streak-Multiplikatoren.
- `app/missionen/tagesmissionen/serverCompletionApi.ts` - Tagesmissionen rufen Server-Completion vor lokaler/Firebase-Beta-Persistenz.
- `app/missionen/tagesmissionen/useDailyMissionFirebase.ts` - lokale/Firebase-Tagesmissionen, Streaks, XP, Level; noch clientnah.
- `app/missionen/tagesmissionen/missions.ts` - Missionsdaten.
- `app/missionen/lib/missionBuddyBridge.ts` - Mission-Buddy-Bridge mit Firestore-Transaktion; noch clientnah.

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
- Safe-Profile-Felder und temporäre Economy-Brueckenfelder sind getrennt markiert.
- Viele sensitive Collections sind fuer Client-Create/Update/Delete blockiert: `missionRewardEvents`, `missionRewardPreviews`, `missionEvidenceReviews`, `missionPatternReviews`, `missionCooldownReviews`, `systemReserveSnapshots`, `userInventory`, `buddyCapabilities`, `nfcScanEvents`.
- Achtung: `users` erlaubt aktuell noch Updates fuer `points`, `xp`, `level`, `stepsToday`, `avatar`, `energy`, `deviceLocation`. Das ist Beta/MVP-nah, muss nach Server-Completion serverseitig gehaertet werden.
- Achtung: `userDailyMissionState`, `userDailyStreaks`, `userLevels` erlauben clientnahe Writes fuer Owner. Fuer echte Reward-Autoritaet spaeter haerten.

## Was bereits funktioniert / vorhanden ist

- Dashboard zeigt interne Punkte und Economy-Status.
- Dashboard zeigt Ledger-/Review-/Correction-Summary.
- Dashboard ruft Reward-/Spend-Preview-APIs zuerst und nutzt lokale Preview als Fallback.
- Mission RewardPreview ist im Dashboard sichtbar.
- Mission Start nutzt Preview-Entscheidung.
- Tagesmissionen haben eigene Reward-Berechnung mit Diversity-, Anti-Farming- und Streak-Multiplikator.
- Tagesmissionen koennen gestartet und abgeschlossen werden.
- Mission-Buddy-Bridge verhindert doppelte Anwendung pro Nutzer/Tag/Mission.
- Buddy-KI API hat Fallback und Safety Flags.
- Punkte-Shop und Marktplatz sind sichere Placeholder ohne echte Token-/NFT-Funktion.
- Firestore Rules blockieren viele serverseitige Reward-/Proof-/NFC-/Capability-Collections fuer Client Writes.
- Server-Completion-Plan und Mission-Completion-API sind als sichere Vorstufe vorbereitet.
- Economy-APIs liefern serverseitige Draft-Records fuer spaetere Persistenz, schreiben aber noch nicht final.
- Persistence-Status-API zeigt explizit, dass echte Serverwrites aktuell deaktiviert bleiben.

## Was nur vorbereitet ist

- Internes Ledger existiert als TypeScript-Logik, aber noch nicht als echte serverseitige Datenhaltung.
- RewardPreview existiert servernah, aber noch ohne Auth, Rate Limits und Persistenz.
- Mission Completion existiert servernah als Entscheidung, aber noch ohne finalen Ledger-Write.
- ServerLedgerDrafts existieren als Records, aber `writeNow` ist bewusst `false`.
- Economy-Persistenzstatus ist `draft_only`; echte Firestore/Admin-Persistenz ist noch nicht aktiv.
- Economy Caps nutzen aktuell Demo-/Snapshot-Werte, noch keine echte Tages-/Nutzerhistorie.
- Reserve-/Umlauf-/Burn-/Locked-Werte existieren statisch, aber noch nicht dynamisch aus Ledger und Sinks.
- Punkte-Shop ist noch kein echter Shop mit internen Spend-Events.
- Marktplatz ist noch kein echter, sicherer Content-/Item-Katalog.

## Was noch fehlt / naechste grosse Codebloecke

### Block A - Economy verbinden

- `config/economy.ts` mit `lib/economy/caps.ts` und `rewardPreview.ts` verbinden. Erledigt in Mega-Block 1.
- RewardRate aus Reserve in RewardPreview einrechnen. Erledigt.
- PriceRate aus Reserve in Punkte-Shop / Futterpreise / Goodiepreise einrechnen. Erledigt.
- Reserve-/Circulating-/Burned-/Locked-Werte als Snapshot-Typ vorbereitet, echte Dynamik spaeter aus Ledger.

### Block B - Missionen auf Ledger vorbereiten

- Tagesmissionen von reinem `rewardEngine.ts` auf `createInternalRewardPreviewDecision` erweitern. Erledigt.
- `completeMission` soll Ledger-kompatible Events vorbereiten. Teilweise erledigt ueber `lib/economy/completion.ts` und API.
- Mission-Buddy-Bridge soll Ledger-/RewardEvent-Payload vorbereiten. Erledigt als Summary, aber noch clientnah.
- Doppelte Punktevergabe weiterhin verhindern. Besteht in Mission-Buddy-Bridge.

### Block C - Punkte-Shop als interner Sink

- Shop-Item-Datenmodell anlegen. Erledigt.
- Preise mit `getPriceRate` dynamisch machen. Erledigt.
- Futter / Kleidung / Schilder / Buddy-Upgrades als interne Punkte-Sinks vorbereiten. Teilweise erledigt.
- Noch keine NFT-/Token-/Wallet-Funktion. Weiterhin Regel.

### Block D - Firestore/Backend-Sicherheit

- `users.points`, `users.xp`, `userDailyMissionState`, `userLevels` als MVP-Risiko markieren und schrittweise serverseitig umbauen. Erledigt / dokumentiert.
- Cloud Function oder API-Route fuer RewardPreview/Completion vorbereiten. Erledigt als API-Vorstufe.
- `missionRewardEvents` als serverseitige Audit-Events planen. Erledigt als Draft; echte Persistenz noch offen.
- Dashboard/Tagesmissionen auf `complete-mission` API umstellen. Erledigt als Vorstufe.
- Persistenz-Status-API vorbereiten. Erledigt.
- Firestore Rules erst nach stabiler Server-Completion haerten. Offen.

### Block E - Dashboard/UX

- Ledger-/Review-/Correction-Summary anzeigen. Erledigt.
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
- Kein zweiter Server-Completion-Plan neben `lib/economy/serverCompletionPlan.ts` bauen.
- Kein zweiter Server-Ledger-Draft-Pfad neben `lib/economy/serverLedgerDraft.ts` bauen.
- Kein zweiter Persistence-Status-Pfad neben `lib/economy/serverPersistence.ts` bauen.

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/MASTER_OPEN_DONE_LIST.md`, `todolist/TODO_INDEX.md`, `todolist/PROJECT_STRUCTURE.md` und diese Datei. Bevor du neue Funktionen baust, pruefe die passende Datei in dieser Codebase Map. Erweitere vorhandene Module statt neue Parallelmodule zu bauen. Wenn du feststellst, dass eine Logik bereits existiert, verlinke sie hier und arbeite darauf weiter. Keine echten Token-/NFT-/Trading-/Presale-Funktionen vor stabiler interner Punkte- und Abrechnungslogik.

## Server-Preview-, Completion-, Draft- und Persistence-APIs

| Datei | Status | Zweck | Noch offen |
|---|---|---|---|
| `app/api/economy/reward-preview/route.ts` | vorbereitet | servernahe interne RewardPreview ohne finale Punktegutschrift, gibt `serverDraft` zurueck | Auth, Rate Limits, echte Tages-/User-Historie, Audit-Persistenz |
| `app/api/economy/spend-preview/route.ts` | vorbereitet | servernahe interne SpendPreview ohne echten Kauf, gibt `serverDraft` zurueck | Auth, Spend-Transaktion, Shop-Audit, serverseitige Sink-Autoritaet |
| `app/api/economy/security-plan/route.ts` | vorbereitet | zeigt Client-Write-Risiken, Server-Completion-Plan und Persistence-Status | optional UI/Admin-Anzeige, Tests |
| `app/api/economy/persistence-status/route.ts` | vorbereitet | zeigt `draft_only`, `writeEnabled: false`, `firestoreWritesEnabled: false` | spaeter echte server-only Persistenz nach Guardrails |
| `app/api/economy/complete-mission/route.ts` | vorbereitet | servernahe Mission-Completion-Entscheidung ohne finale Gutschrift, gibt `serverDrafts` zurueck | Auth, Persistenz, Ledger-Write, Client-Umstellung |

Regel: Diese APIs duerfen keine echten Token, NFTs, Wallet-Funktionen, Käufe, Auszahlungen oder finale Reward-Autoritaet aktivieren, solange Ledger/Auth/Audit/Rules nicht stabil sind.

## Frontend Server-Preview Nutzung

| Datei | Status | Zweck | Fallback |
|---|---|---|---|
| `app/dashboard/lib/serverPreviewApi.ts` | aktiv / vorbereitet | Dashboard ruft Reward-/Spend-Preview- und Completion-APIs auf | lokale Economy-Preview/Completion |
| `app/dashboard/page.tsx` | erweitert | Mission Preview nutzt Server zuerst | lokale RewardPreview |
| `app/dashboard/hooks/useDashboardActions.ts` | erweitert | Mission Start nutzt Server-Completion zuerst; Buddy-Futter nutzt SpendPreview-API zuerst | lokale Fallbacks |

Regel: Frontend darf weiterhin keine finale Reward-/Spend-Autoritaet haben. Server-Preview, Completion-API, Drafts und Persistence-Status sind Vorstufen.
