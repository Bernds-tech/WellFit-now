# CODEBASE FEATURE MAP - WELLFIT

Stand: 2026-05-12
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

## Konsolidierungsstand 2026-05-12

Die hochgeladene Datei `WELLFIT – MASTER ROADMAP & DEVELOPE.txt` wurde gegen den aktuellen Repository-Stand abgeglichen.

Ergebnis:
- Avatar-Inventar, Avatar-Items, Item-Raritaeten, Wettkaempfe, interne Einsaetze, Punkte-Shop, Items/NFC/Buddy-Faehigkeiten und serverseitige Economy-Autoritaet waren bereits in der alten Roadmap vorhanden.
- Neue Dateien `CHECKPOINT_LOCATION_SAFETY_AND_PLACEMENT.md`, `COMPETITION_INTERNAL_STAKES_GUARDRAILS.md` und `AVATAR_COMPETITION_AND_RARE_ITEMS_GUARDRAILS.md` sind Detail-Guardrails zu vorhandenen Roadmap-Punkten, keine Parallelmodule.
- Punkte-Shop-Items duerfen nicht neu parallel modelliert werden; vorhandener Einstieg ist `lib/economy/shopItems.ts` plus `app/punkte-shop/**`.
- Avatar-Items / Rare Items duerfen spaeter nur ueber vorhandene Inventory-/Item-Roadmap und die neuen Guardrails weitergefuehrt werden.

## Aktuelle Code-Inventur

Letzter bekannter lokaler Lauf:

- Scanned files: 419
- App routes: 30
- API routes: 9
- Economy code files: 18

Output-Datei:

- `scripts/wellfit-dev-agent/output/code-inventory-report.md`

## Aktuelle Bestandsbewertung

| Bereich | Status | Bereits vorhanden | Noch offen |
|---|---|---|---|
| 25-Mrd.-Punkte-Logik | vorhanden / statisch + Health-Draft | `config/economy.ts`, `lib/economy/reserve.ts`, `/api/economy/health-preview`, Dashboard-Anzeige | dynamisch aus echtem Ledger/Reserve/Sinks berechnen |
| EconomyHealth / Reserve / Sink | vorbereitet / API sichtbar | `calculateInternalEconomyHealth`, `/api/economy/health-preview`, `DashboardEconomyPanel` | echte Tages-/Nutzerhistorie, echte Sink-Rueckfluesse, echte Ledger-Daten |
| Reward-Faktor nach Reserve | vorhanden | `getRewardRate`, `lib/economy/reserve.ts`, `rewardPreview.ts` | echte Tages-/User-Historie anbinden |
| Preis-Faktor nach Reserve | vorhanden | `getPriceRate`, `shopItems.ts`, `spend.ts` | echte Spend-Transaktion und Audit anbinden |
| Token/NFT-Schalter | vorhanden / deaktiviert | `tokenEnabled: false`, `nftEnabled: false`, `activeCurrency: points` | deaktiviert lassen bis nach stabiler Beta |
| Interne Caps | vorbereitet | `lib/economy/caps.ts` | reale Tages-/User-/Missionstyp-Nutzung anbinden |
| Ledger-Typen | vorbereitet | `lib/economy/ledger.ts` | echte serverseitige Persistenz / Firestore / Functions |
| Server Ledger Drafts | vorbereitet / ohne Write | `lib/economy/serverLedgerDraft.ts`, API-Antworten mit `serverDraft`/`serverDrafts` | echte Firestore/Admin-Persistenz spaeter server-only aktivieren |
| Server Persistence Guardrail | vorbereitet / dry-run | `lib/economy/serverPersistence.ts`, APIs geben `persistenceRequest(s)` dry-run zurueck | echte Persistenz erst nach Admin/Auth/Emulator/Rules-Haertung aktivieren |
| Ledger-Projektion | vorbereitet | `lib/economy/projection.ts`, `/api/economy/user-projection`, `clientBetaProjection.ts` | echte Ledger-Events statt Demo-/Client-Daten nutzen |
| RewardPreview | vorbereitet / API-nah | `lib/economy/rewardPreview.ts`, `app/api/economy/reward-preview/route.ts` | Auth, Rate Limit, Persistenz, Audit |
| SpendPreview | vorbereitet / API-nah | `lib/economy/spend.ts`, `app/api/economy/spend-preview/route.ts` | echte Spend-Completion und Audit |
| Server Completion Plan | vorbereitet | `lib/economy/serverCompletionPlan.ts`, `docs/architecture/ECONOMY_SERVER_COMPLETION_AND_FIRESTORE_HARDENING.md`, `app/api/economy/security-plan/route.ts` | UI schrittweise auf Server-Completion umstellen |
| Mission Completion API | vorbereitet / nicht final autoritativ | `lib/economy/completion.ts`, `app/api/economy/complete-mission/route.ts` | Auth, Persistenz, Ledger-Write, Client-Umstellung |
| Dashboard Economy | eingebaut | `DashboardEconomyPanel`, `dashboardSnapshot.ts`, Health-Preview-Anzeige | Live-Ledger-Historie, echte Review-/Correction-Daten anzeigen |
| Dashboard Mission Preview | eingebaut | `serverPreviewApi.ts`, `DashboardMissionPanel`, `useDashboardActions` | Completion-API statt direktem `users.points`-Patch weiter haerten |
| Tagesmissionen | vorhanden | `app/missionen/tagesmissionen/page.tsx`, `rewardEngine.ts`, `useDailyMissionFirebase.ts` | auf echtes internes Ledger / serverseitige Completion umstellen |
| Wochenmissionen | angebunden / Beta | `app/missionen/wochenmissionen/page.tsx` nutzt Economy-/Projection-/Buddy-Sync-Pfad | Historie, echte Completion, Refactor |
| Abenteuer | angebunden / Beta | `app/missionen/abenteuer/page.tsx`, `serverAdventureEconomyApi.ts`, automatische Standortlogik | Historie, sichere Checkpoint-/20m-Server-Evidence, Refactor |
| Challenge | Standort-Beta vorbereitet | `app/missionen/challenge/page.tsx`, gemeinsame `GoogleMissionMap` | Economy-Pfad/Completion/History spaeter anbinden |
| Wettkaempfe | Standort-/Safety-Beta vorbereitet | `app/missionen/wettkaempfe/page.tsx`, `GoogleCompetitionMap.tsx`, `COMPETITION_INTERNAL_STAKES_GUARDRAILS.md` | Duell-Einsatz-Draft, Matchmaking, Evidence, keine echten Wetten/Auszahlungen |
| Checkpoint Safety | Architektur vorhanden | `CHECKPOINT_LOCATION_SAFETY_AND_PLACEMENT.md`, `GoogleMissionMap` Standortlogik | serverseitige Checkpoint-Pruefung, sichere Ortsdaten, 20m-Zielradius |
| Avatar-Duelle / Rare Items | Architektur vorhanden | `AVATAR_COMPETITION_AND_RARE_ITEMS_GUARDRAILS.md`, alte Roadmap Phase 3/G4/G7 | Inventory-/Item-Datenmodell, Fairness-Score, Item-Lock-Draft |
| Mission-Buddy-Bridge | vorhanden / clientnah | `app/missionen/lib/missionBuddyBridge.ts` nutzt Firestore Transaction und verhindert doppelte Anwendung | Servervalidierung / Cloud Function / Ledger-Event statt Client-Autoritaet |
| Buddy-KI API | vorhanden / sicherer Fallback | `app/api/buddy-ki/route.ts`, Rules Provider, optional OpenAI-Provider | echte Modelltests nur mit Server-Env; Buddy darf keine Rewards autorisieren |
| Punkte-Shop | interne Items + SpendPreview sichtbar | `app/punkte-shop/page.tsx`, `ShopSpendPreviewPanel`, `lib/economy/shopItems.ts`, `spend.ts` | echte interne Spend-Completion, Audit, Inventory/Item-Locks, keine echten Kaeufe |
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
- `lib/economy/reserve.ts` - Reserve-Snapshot, Reserve-basierte Reward-/Preislogik und EconomyHealth-/Emission-/Sink-Draft.
- `lib/economy/rewardPreview.ts` - sichere RewardPreview-Entscheidung.
- `lib/economy/spend.ts` - interne SpendPreview fuer Punkte-Sinks.
- `lib/economy/shopItems.ts` - interne Shop-Items, dynamische Preise, keine echten Kaeufe.
- `lib/economy/serverCompletionPlan.ts` - Risiko-Felder, server-only Collections und Completion-Stufen.
- `lib/economy/serverPersistence.ts` - Persistenz-Guardrails und Dry-Run-Persistenz-Requests, aktuell `draft_only` und `writeEnabled: false`.
- `lib/economy/completion.ts` - servernahe Mission-Completion-Entscheidung ohne finale Client-Autoritaet.
- `lib/economy/serverLedgerDraft.ts` - Firestore-/Ledger-Draft-Records fuer spaetere server-only Persistenz, aktuell `writeNow: false`.
- `lib/economy/dashboardSnapshot.ts` - Dashboard-Snapshot aus interner Economy inklusive EconomyHealth.
- `lib/economy/clientBetaProjection.ts` - lokale Beta-Projektion als Anzeige-/MVP-Bruecke, keine finale Wahrheit.
- `lib/economy/index.ts` - zentrale Economy-Exports.

### Economy APIs

- `app/api/economy/reward-preview/route.ts` - RewardPreview-API, keine finale Punktegutschrift, gibt `serverDraft` und `persistenceRequest` zurueck.
- `app/api/economy/spend-preview/route.ts` - SpendPreview-API, kein echter Kauf, gibt `serverDraft` und `persistenceRequest` zurueck.
- `app/api/economy/security-plan/route.ts` - Security-/Completion-Plan fuer Firestore-Haertung, gibt Persistence-Status mit aus.
- `app/api/economy/persistence-status/route.ts` - zeigt explizit, dass Economy-Persistenz aktuell draft-only und ohne finalen Write bleibt.
- `app/api/economy/complete-mission/route.ts` - Mission-Completion-Entscheidung, noch ohne finale Persistenz/Gutschrift, gibt `serverDrafts` und `persistenceRequests` zurueck.
- `app/api/economy/user-projection/route.ts` - User-Projection-Vorstufe fuer Dashboard/Buddy/Missionsseiten.
- `app/api/economy/buddy-sync-preview/route.ts` - Buddy-Sync-Preview fuer Mission-Buddy-Zustand.
- `app/api/economy/health-preview/route.ts` - EconomyHealth-/25-Mrd.-Reserve-/Emission-/Sink-Preview, keine finale Punktevergabe.

### Dashboard

- `app/dashboard/page.tsx` - Dashboard-Hauptseite, laedt Projection und EconomyHealth Preview.
- `app/dashboard/components/DashboardEconomyPanel.tsx` - Anzeige der internen Beta-Economy, Caps, RewardPreview, Ledger-/Review-/Correction-Summary und EconomyHealth.
- `app/dashboard/components/DashboardMissionPanel.tsx` - Mission + RewardPreview und Preview-Quelle.
- `app/dashboard/components/DashboardAvatarPanel.tsx` - Buddy-Status und Futteraktion.
- `app/dashboard/hooks/useDashboardActions.ts` - Mission starten und Buddy fuettern; nutzt Server-Completion/Spend-Preview vor lokalen MVP-Bruecken.
- `app/dashboard/lib/serverPreviewApi.ts` - Dashboard ruft Server-Preview-, Health-Preview- und Completion-APIs zuerst.
- `app/dashboard/lib/serverProjectionApi.ts` - Dashboard liest Projection API mit lokalem Fallback.
- `app/dashboard/lib/missionRewardPreview.ts` - lokaler Fallback fuer Dashboard-Mission.
- `app/dashboard/lib/personalMission.ts` - persoenliche Dashboard-Mission.
- `app/dashboard/lib/dashboardUser.ts` - lokale Nutzer-/Cache-Logik.

### Missionen

- `app/missionen/components/GoogleMissionMap.tsx` - gemeinsame Google-Maps-Komponente mit automatischer Standortlogik und eigenem Standortmarker.
- `app/missionen/tagesmissionen/page.tsx` - Tagesmissionen, Slots, Start/Complete, Reward-Berechnung, Buddy-Bridge.
- `app/missionen/tagesmissionen/rewardEngine.ts` - Diversity-, Anti-Farming- und Streak-Multiplikatoren.
- `app/missionen/tagesmissionen/serverCompletionApi.ts` - Tagesmissionen rufen Server-Completion vor lokaler/Firebase-Beta-Persistenz.
- `app/missionen/tagesmissionen/useDailyMissionFirebase.ts` - lokale/Firebase-Tagesmissionen, Streaks, XP, Level; noch clientnah.
- `app/missionen/tagesmissionen/missions.ts` - Missionsdaten.
- `app/missionen/wochenmissionen/page.tsx` - Wochenmissionen mit Economy-/Projection-/Buddy-Sync-Pfad.
- `app/missionen/abenteuer/page.tsx` - Abenteuer mit Spend-/Reward-/Completion-/Projection-/Buddy-Sync-Pfad und Standortlogik.
- `app/missionen/abenteuer/serverAdventureEconomyApi.ts` - Abenteuer-API-Client.
- `app/missionen/challenge/page.tsx` - Challenge mit automatischer Standortlogik.
- `app/missionen/wettkaempfe/page.tsx` - Wettkaempfe mit sicheren Checkpoints und Duell-Vorschau.
- `app/missionen/wettkaempfe/GoogleCompetitionMap.tsx` - Wettkampfkarte auf Basis der gemeinsamen Map.
- `app/missionen/lib/missionBuddyBridge.ts` - Mission-Buddy-Bridge mit Firestore-Transaktion; noch clientnah.

### Buddy / KI

- `app/api/buddy-ki/route.ts` - Buddy-KI API mit Fallback, Sanitizing, Safety Flags.
- `lib/buddyKi/buddyKiProviderRules.ts` - Rules Provider.
- `lib/buddyKi/buddyKiProviderOpenAi.ts` - optionaler serverseitiger OpenAI Provider.
- `lib/buddyKi/buddyKiTypes.ts` - Typen fuer Buddy-KI.

### Shop / Marktplatz / Items

- `app/punkte-shop/page.tsx` - interner Punkte-Shop mit sicheren Beta-Hinweisen.
- `app/punkte-shop/ShopSpendPreviewPanel.tsx` - SpendPreview fuer Shop-Items.
- `lib/economy/shopItems.ts` - zentrale interne Shop-Item-Liste.
- `app/marktplatz/page.tsx` - Placeholder fuer Marktplatz, ohne echte NFT-/Token-Funktion.
- `docs/architecture/AVATAR_COMPETITION_AND_RARE_ITEMS_GUARDRAILS.md` - Rare-Item-/Avatar-Duell-Guardrails; keine Parallel-Shop-Struktur.

### Security / Backend

- `firestore.rules` - Firestore-Regeln.
- Safe-Profile-Felder und temporäre Economy-Brueckenfelder sind getrennt markiert.
- Viele sensitive Collections sind fuer Client-Create/Update/Delete blockiert: `missionRewardEvents`, `missionRewardPreviews`, `missionEvidenceReviews`, `missionPatternReviews`, `missionCooldownReviews`, `systemReserveSnapshots`, `userInventory`, `buddyCapabilities`, `nfcScanEvents`.
- Achtung: `users` erlaubt aktuell noch Updates fuer `points`, `xp`, `level`, `stepsToday`, `avatar`, `energy`, `deviceLocation`. Das ist Beta/MVP-nah, muss nach Server-Completion serverseitig gehaertet werden.
- Achtung: `userDailyMissionState`, `userDailyStreaks`, `userLevels` erlauben clientnahe Writes fuer Owner. Fuer echte Reward-Autoritaet spaeter haerten.

## Was bereits funktioniert / vorhanden ist

- Dashboard zeigt interne Punkte und Economy-Status.
- Dashboard zeigt EconomyHealth-/25-Mrd.-Reserve-/Emission-/Sink-Draft.
- Dashboard zeigt Ledger-/Review-/Correction-Summary.
- Dashboard ruft Reward-/Spend-/Health-Preview-APIs zuerst und nutzt lokale Fallbacks.
- Mission RewardPreview ist im Dashboard sichtbar.
- Mission Start nutzt Preview-Entscheidung.
- Tagesmissionen haben eigene Reward-Berechnung mit Diversity-, Anti-Farming- und Streak-Multiplikator.
- Wochenmissionen und Abenteuer sind an Economy-/Projection-/Buddy-Sync-Pfade angebunden.
- Abenteuer, Challenge und Wettkaempfe nutzen automatische Standortlogik ueber die gemeinsame Google-Map.
- Mission-Buddy-Bridge verhindert doppelte Anwendung pro Nutzer/Tag/Mission.
- Buddy-KI API hat Fallback und Safety Flags.
- Punkte-Shop hat interne Items, dynamische Preise und SpendPreview, aber keine echten Kaeufe.
- Marktplatz ist sichere Placeholder-Struktur ohne echte Token-/NFT-Funktion.
- Checkpoint-, Wettkampf-Einsatz- und Avatar-Rare-Item-Guardrails sind dokumentiert.
- Firestore Rules blockieren viele serverseitige Reward-/Proof-/NFC-/Capability-Collections fuer Client Writes.
- Server-Completion-Plan und Mission-Completion-API sind als sichere Vorstufe vorbereitet.
- Economy-APIs liefern serverseitige Draft-Records und Dry-Run-Persistenz-Requests fuer spaetere Persistenz, schreiben aber noch nicht final.
- Persistence-Status-API zeigt explizit, dass echte Serverwrites aktuell deaktiviert bleiben.

## Was nur vorbereitet ist

- Internes Ledger existiert als TypeScript-Logik, aber noch nicht als echte serverseitige Datenhaltung.
- RewardPreview existiert servernah, aber noch ohne harte Auth, Rate Limits und Persistenz.
- Mission Completion existiert servernah als Entscheidung, aber noch ohne finalen Ledger-Write.
- ServerLedgerDrafts existieren als Records, aber `writeNow` ist bewusst `false`.
- Economy-Persistenzstatus ist `draft_only`; echte Firestore/Admin-Persistenz ist noch nicht aktiv.
- PersistenceRequests sind Dry-Run-Objekte und blockieren mit `blocked_persistence_disabled`.
- Economy Caps nutzen aktuell Demo-/Snapshot-Werte, noch keine echte Tages-/Nutzerhistorie.
- Reserve-/Umlauf-/Burn-/Locked-Werte existieren statisch und Health-Draft-berechnet, aber noch nicht dynamisch aus echtem Ledger und Sinks.
- Punkte-Shop ist noch kein echter serverseitiger Shop mit finalen Spend-Events.
- Avatar-Inventar, Equipment Slots, Item-Raritaeten und Item-Locks sind Roadmap/Guardrail, noch keine produktive Logik.
- Wettkampf-Duell-Einsaetze sind Roadmap/Guardrail, noch keine produktive Logik.
- Marktplatz ist noch kein echter, sicherer Content-/Item-Katalog.

## Was noch fehlt / naechste grosse Codebloecke

### Block A - Economy verbinden

- `config/economy.ts` mit `lib/economy/caps.ts` und `rewardPreview.ts` verbinden. Erledigt.
- RewardRate aus Reserve in RewardPreview einrechnen. Erledigt.
- PriceRate aus Reserve in Punkte-Shop / Futterpreise / Goodiepreise einrechnen. Erledigt.
- EconomyHealth-/Emission-/Sink-Draft in Dashboard anzeigen. Erledigt.
- Reserve-/Circulating-/Burned-/Locked-Werte aus echtem Ledger berechnen. Offen.

### Block B - Missionen auf Ledger vorbereiten

- Tagesmissionen von reinem `rewardEngine.ts` auf `createInternalRewardPreviewDecision` erweitern. Erledigt.
- `completeMission` soll Ledger-kompatible Events vorbereiten. Teilweise erledigt ueber `lib/economy/completion.ts` und API.
- Wochenmissionen an Economy-/Projection-/Buddy-Sync-Pfad anbinden. Erledigt.
- Abenteuer an Spend-/Reward-/Completion-/Projection-/Buddy-Sync-Pfad anbinden. Erledigt.
- Mission-Buddy-Bridge soll Ledger-/RewardEvent-Payload vorbereiten. Erledigt als Summary, aber noch clientnah.
- Doppelte Punktevergabe weiterhin verhindern. Besteht in Mission-Buddy-Bridge.
- Challenge und Wettkaempfe spaeter an Completion/History/Evidence-Pfade anbinden. Offen.

### Block C - Punkte-Shop als interner Sink

- Shop-Item-Datenmodell anlegen. Erledigt.
- Preise mit `getPriceRate` dynamisch machen. Erledigt.
- Futter / Kleidung / Schilder / Buddy-Upgrades als interne Punkte-Sinks vorbereiten. Teilweise erledigt.
- SpendPreview sichtbar im Punkte-Shop. Erledigt.
- Avatar-Equipment / Rare Items nicht parallel bauen; spaeter bestehende `shopItems.ts` und Inventory-/Item-Roadmap erweitern. Offen.
- Noch keine NFT-/Token-/Wallet-Funktion. Weiterhin Regel.

### Block D - Firestore/Backend-Sicherheit

- `users.points`, `users.xp`, `userDailyMissionState`, `userLevels` als MVP-Risiko markieren und schrittweise serverseitig umbauen. Erledigt / dokumentiert.
- Cloud Function oder API-Route fuer RewardPreview/Completion vorbereiten. Erledigt als API-Vorstufe.
- `missionRewardEvents` als serverseitige Audit-Events planen. Erledigt als Draft; echte Persistenz noch offen.
- Dashboard/Tagesmissionen auf `complete-mission` API umstellen. Erledigt als Vorstufe.
- Persistenz-Status-API vorbereiten. Erledigt.
- Dry-Run-Persistenz-Requests vorbereiten. Erledigt.
- Firestore Rules erst nach stabiler Server-Completion haerten. Offen.

### Block E - Dashboard/UX

- Ledger-/Review-/Correction-Summary anzeigen. Erledigt.
- EconomyHealth-/25-Mrd.-Punkte-Draft anzeigen. Erledigt.
- Dem Nutzer klar zeigen: interne Punkte, keine Token. Erledigt.
- Bei Review/Blocked gute Hinweise anzeigen. Teilweise erledigt.
- Punkte-Shop und Marktplatz klar als interne Beta-Struktur kennzeichnen. Erledigt.

### Block F - Checkpoints / Wettkaempfe / Avatar-Duelle

- Checkpoint-Safety-Guardrails dokumentieren. Erledigt.
- Zielradius ca. 20 Meter als Produktregel dokumentieren. Erledigt.
- Wettkampf-Duell-Einsatz-Guardrails dokumentieren. Erledigt.
- Avatar-Duell-/Rare-Item-Guardrails dokumentieren. Erledigt.
- Sichere Checkpoint-Ortspruefung serverseitig vorbereiten. Offen.
- Interner Duell-Einsatz-Draft fuer Punkte/Items ohne echte Wetten/Auszahlungen planen. Offen.
- Avatar-Fairness-Score und Item-Loadout-Draft planen. Offen.
- Zuschauer-Einsaetze bleiben Backlog nach Beta. Offen / Backlog.

## Nicht nochmal neu bauen

Diese Dinge existieren bereits und sollen erweitert werden:

- Kein neues Economy-Config-Modul parallel zu `config/economy.ts` bauen.
- Kein zweites Ledger neben `lib/economy/ledger.ts` bauen.
- Kein zweites RewardPreview-System neben `lib/economy/rewardPreview.ts` bauen.
- Kein zweiter DailyMission RewardEngine ohne Abgleich mit `rewardEngine.ts` bauen.
- Kein paralleler Buddy-KI-Endpunkt neben `app/api/buddy-ki/route.ts` bauen.
- Kein paralleles Shop-Item-System neben `lib/economy/shopItems.ts` bauen.
- Kein paralleles Avatar-/Rare-Item-System ohne Abgleich mit `AVATAR_COMPETITION_AND_RARE_ITEMS_GUARDRAILS.md` und alter Roadmap Phase 3/G7 bauen.
- Kein paralleles Wettkampf-Einsatz-System ohne Abgleich mit `COMPETITION_INTERNAL_STAKES_GUARDRAILS.md` und `WF-MISS-COMP-001` bauen.
- Kein echter Token-/NFT-Marktplatz in Mobile bauen.
- Kein zweiter Server-Completion-Plan neben `lib/economy/serverCompletionPlan.ts` bauen.
- Kein zweiter Server-Ledger-Draft-Pfad neben `lib/economy/serverLedgerDraft.ts` bauen.
- Kein zweiter Persistence-Status-Pfad neben `lib/economy/serverPersistence.ts` bauen.

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/MASTER_OPEN_DONE_LIST.md`, `todolist/TODO_INDEX.md`, `todolist/PROJECT_STRUCTURE.md` und diese Datei. Bevor du neue Funktionen baust, pruefe die passende Datei in dieser Codebase Map. Erweitere vorhandene Module statt neue Parallelmodule zu bauen. Wenn du feststellst, dass eine Logik bereits existiert, verlinke sie hier und arbeite darauf weiter. Keine echten Token-/NFT-/Trading-/Presale-Funktionen vor stabiler interner Punkte- und Abrechnungslogik.

## Server-Preview-, Completion-, Draft- und Persistence-APIs

| Datei | Status | Zweck | Noch offen |
|---|---|---|---|
| `app/api/economy/reward-preview/route.ts` | vorbereitet | servernahe interne RewardPreview ohne finale Punktegutschrift, gibt `serverDraft` und `persistenceRequest` zurueck | Auth, Rate Limits, echte Tages-/User-Historie, Audit-Persistenz |
| `app/api/economy/spend-preview/route.ts` | vorbereitet | servernahe interne SpendPreview ohne echten Kauf, gibt `serverDraft` und `persistenceRequest` zurueck | Auth, Spend-Transaktion, Shop-Audit, serverseitige Sink-Autoritaet |
| `app/api/economy/security-plan/route.ts` | vorbereitet | zeigt Client-Write-Risiken, Server-Completion-Plan und Persistence-Status | optional UI/Admin-Anzeige, Tests |
| `app/api/economy/persistence-status/route.ts` | vorbereitet | zeigt `draft_only`, `writeEnabled: false`, `firestoreWritesEnabled: false` | spaeter echte server-only Persistenz nach Guardrails |
| `app/api/economy/complete-mission/route.ts` | vorbereitet | servernahe Mission-Completion-Entscheidung ohne finale Gutschrift, gibt `serverDrafts` und `persistenceRequests` zurueck | Auth, Persistenz, Ledger-Write, Client-Umstellung |
| `app/api/economy/user-projection/route.ts` | vorbereitet | User-Projection-Vorstufe fuer Dashboard/Buddy/Missionen | echte Ledger-Projektion statt Beta-Fallback |
| `app/api/economy/buddy-sync-preview/route.ts` | vorbereitet | Buddy-Sync-Preview fuer Mission-Buddy-Zustand | echte Buddy-Events serverseitig persistieren |
| `app/api/economy/health-preview/route.ts` | vorbereitet | EconomyHealth-/25-Mrd.-Reserve-/Emission-/Sink-Draft | echte Ledger-/Sink-/Nutzungsdaten anbinden |

Regel: Diese APIs duerfen keine echten Token, NFTs, Wallet-Funktionen, Käufe, Auszahlungen oder finale Reward-Autoritaet aktivieren, solange Ledger/Auth/Audit/Rules nicht stabil sind.

## Frontend Server-Preview Nutzung

| Datei | Status | Zweck | Fallback |
|---|---|---|---|
| `app/dashboard/lib/serverPreviewApi.ts` | aktiv / vorbereitet | Dashboard ruft Reward-/Spend-/Health-Preview- und Completion-APIs auf | lokale Economy-Preview/Completion/Health |
| `app/dashboard/page.tsx` | erweitert | Mission Preview, Health Preview und Projection nutzen Server zuerst | lokale RewardPreview/Health/Projection |
| `app/dashboard/hooks/useDashboardActions.ts` | erweitert | Mission Start nutzt Server-Completion zuerst; Buddy-Futter nutzt SpendPreview-API zuerst | lokale Fallbacks |

Regel: Frontend darf weiterhin keine finale Reward-/Spend-Autoritaet haben. Server-Preview, Completion-API, Drafts und Persistence-Status sind Vorstufen.
