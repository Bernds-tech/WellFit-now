# WellFit todolist

Dieser Ordner enthält die aufgeteilte, versionierte WellFit Master-Roadmap.

## Maßgebliche Struktur

Die verbindliche Struktur sind die Dateien `A` bis `J` plus `G1` als neue verbindliche Economy-Ergänzung:

```txt
A - MASTER-REGELN - STATUSSYSTEM
B - AKTUELLER SPRINT-STAND – LOGIN - REGISTRIERUNG - DEPLOYMENT
C - STRATEGISCHE GRUNDENTSCHEIDUNGEN
D - VERBINDLICHE REIHENFOLGE
E - AKTUELLER UMSETZUNGSSTAND - VORHANDEN
F - FIREBASE  - REALTIME - MISSIONEN
G - REWARD SYSTEM - SYSTEM HEALTH - NEXT-GEN MECHANICS
G1 - INTERNE PUNKTEOEKONOMIE VOR BLOCKCHAIN
H - MOBILE - AR - TRACKING - KI
I - BUSINESS - WEBSITE - PARTNER - LEGAL
J - NÄCHSTE EMPFOHLENE ARBEIT
```

## Zusatzdateien

```txt
ROADMAP_BUDDY_PHASES_ADDENDUM
CHAT_START_PROMPT.md
H1 - NATIVE AR - ARCORE - ARKIT - UNITY
H2 - BUDDY ALS REALER AR-BEGLEITER UND KI-GUIDE
docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md
docs/architecture/TRACKING_BUDDY_SERVER_EVENTS.md
docs/architecture/AI_DIMENSIONS_ITEMS_NFT_ECONOMY.md
functions/EMULATOR_TEST_PLAN.md
```

`G1 - INTERNE PUNKTEOEKONOMIE VOR BLOCKCHAIN` ist die verbindliche Detail-Roadmap für Punkte-/XP-/Reward-/Economy-System vor Blockchain. Sie ist bei allen Reward-, Economy-, Token-, NFT-, Shop-, Wettkampf-, Jackpot- und Burn-Fragen mitzulesen.

`H1 - NATIVE AR - ARCORE - ARKIT - UNITY` ist die verbindliche Detail-Roadmap für echtes Flammi-AR mit World Tracking, Plane Detection, ARCore, ARKit und Unity AR Foundation. Sie ergänzt `H - MOBILE - AR - TRACKING - KI` und wird bei allen AR-/Avatar-/Native-Mobile-Aufgaben mitgelesen.

`H2 - BUDDY ALS REALER AR-BEGLEITER UND KI-GUIDE` ist die verbindliche Produktvision für den Buddy als echten AR-Begleiter, KI-Guide, Missionsführer, Rätselrallye-Begleiter und natürliche Navigations-/Interaktionsschicht.

Historische/ergänzende Addenda bleiben sichtbar. Inhalte daraus wurden in die A–J-Struktur übernommen oder werden dort weitergeführt.

## Aktueller konsolidierter Stand

Stand: Version 7.2 aus `J - NÄCHSTE EMPFOHLENE ARBEIT` plus `CHAT_START_PROMPT.md` Version 1.3.

### Chat-Start-Prompt / Teil-13-Abgleich

```txt
[x] Rollenblock WellFit Core-Team & operative Taskforce integriert.
[x] Single Source of Truth: Repository + todolist/ integriert.
[x] Startablauf für neue Chats integriert.
[x] Pflichtprüfung README + J integriert.
[x] Themenabhängiges Mitlesen passender A–I-Dateien integriert.
[x] Erweiterte Zusatzdateien H1, H2 und Architekturdocs integriert.
[x] G1 als Pflichtdatei für Economy/Reward/Token/NFT/Shop/Wettkampf/Jackpot integriert.
[x] Nicht aus Chat-Erinnerung ableiten integriert.
[x] Nicht behaupten, GitHub/todolist sei geprüft, wenn es nicht geprüft wurde, integriert.
[x] Konfliktcheck Roadmap vs. Code, Nutzerwunsch vs. Master-Regeln, Client vs. Backend-Autorität integriert.
[x] Konfliktcheck Mobile-App vs. Token/Krypto/Trading integriert.
[x] Konfliktcheck Solana/SPL vs. SUI/Dynamic-Objects integriert.
[x] Punkteökonomie zuerst vs. zu frühe Blockchain-/NFT-/WFT-Umsetzung integriert.
[x] Server-/Build-/PM2-/Emulator-Prüfrahmen integriert.
[ ] Bei künftigen Änderungen CHAT_START_PROMPT.md weiter versionieren und hier konsolidierten Stand aktualisieren.
```

### Interne Punkteökonomie vor Blockchain

```txt
[x] WellFit wird zuerst als internes Punkte-, XP-, Reward- und Economy-System aufgebaut.
[x] Blockchain, echte NFTs und echter WFT-Token erst nach stabiler Alpha-/Beta-/Testphase.
[x] 25-Mrd.-WFT-Logik wird vorerst als interne Punkte-/Economy-Simulation behandelt.
[x] Mission Rewards, Einsätze, Jackpot, Gebühren, Sinks, Burn-Äquivalente, Reserve und Systemgesundheit werden zuerst intern simuliert.
[x] Keine Blockchain-Abhängigkeit im MVP, in Alpha oder früher Beta.
[x] Mobile bleibt ohne Token-, Presale-, Trading-, Staking- und NFT-Marktplatz-Funktionen.
[!] Erst nach belastbaren Testdaten entscheiden, ob Punkte 1:1, anteilig, gar nicht oder nur regelbasiert in WFT überführbar sind.
[ ] Serverseitiges Punkte-Ledger planen.
[ ] Auditierbare Reward-/Spend-/Sink-Events planen.
[ ] DailyEmissionCap, UserDailyCap, MissionTypeCap und EconomyHealthScore definieren.
```

### Mobile / AR / Buddy

```txt
[x] Handy / AR / Avatar / Buddy hat Priorität vor Desktop-Marktplatz, Leaderboard, Shop und weiteren Modulen.
[x] PC/Web-App dient primär als Steuerzentrale, Einstellung, Verwaltung und später Business-/Web3-Bereich.
[x] Browser/WebGL bleibt Demo und Fallback.
[x] Echtes Buddy-AR braucht World Tracking, Plane Detection, Hit Test/Raycast und Anchor-System.
[x] Android-Ziel: ARCore.
[x] iOS-Ziel: ARKit.
[x] Unity AR Foundation ist verbindlicher Hauptpfad.
[x] Direkte ARCore/ARKit-Implementierung bleibt Plan B.
[x] Buddy-KI, Missionsempfehlungen, Rätselgenerierung und Reward-Bewertung bleiben außerhalb von Unity in Backend/App-Logik.
[x] Unity rendert und steuert die AR-Welt; finale Rewards, Completion und Anti-Cheat bleiben serverseitig.
```

### Firebase / Functions / Emulator-Tests

```txt
[x] Firestore Rules, Indexes, Functions und Emulator-Grundlage angelegt.
[x] validateNfcScan, auditItemUse und seedDemoItemsAndNfc angelegt/getestet.
[x] createTrackingSession, recordTrackingProof und createMissionBuddyEvent angelegt/getestet.
[x] evaluateMissionContext und evaluateMissionCompletion angelegt/getestet.
[x] Demo Items und NFC-Tags angelegt: rope_001, magnifier_001, small_backpack_001.
[x] Java 17 installiert und Firebase Emulator erfolgreich gestartet.
[x] Erweiterter Gesamt-Emulator-Test umfasst smoke:nfc + rules:firestore + callable:emulator + mission:emulator.
[x] Direkte Client-Writes auf Item-/NFC-/Capability-/Tracking-/Buddy-/Evaluation-Collections werden blockiert.
[x] Echte Callable Functions im Emulator erfolgreich getestet.
[!] Nach aktuellem Stand muss der erweiterte Server-Test erneut ausgeführt werden.
```

### NFC / Items / Buddy-Fähigkeiten

```txt
[x] NFC-Tags = reale physische Trigger, keine NFTs.
[x] Items/Gadgets = Ausrüstung/Fähigkeiten für Buddy/Avatar/KI-Body.
[x] NFTs = spätere digitale Besitzobjekte/Sammlerobjekte/besondere Ausrüstung.
[x] Kletterseil-Demo: WF-DEMO-ROPE-TREE-001 -> rope_001 -> climbUp.
[x] Lupe-Demo: WF-DEMO-MAGNIFIER-LEAF-001 -> magnifier_001 -> scanObject.
[x] Duplicate-Scan-Schutz pro Nutzer/Tag/Mission ergänzt.
[!] NFC-Scan darf niemals direkt Reward/Item final freischalten; Backend bleibt Autorität.
```

### Serverautorisierte Proof-/Audit-/Evaluation-Pfade

```txt
[x] trackingSessions: Owner-Read, keine Client-Writes.
[x] trackingProofEvents: Owner-Read, keine Client-Writes.
[x] missionBuddyEvents: Owner-Read, keine Client-Writes.
[x] missionContextEvaluations: Owner-Read, keine Client-Writes.
[x] missionCompletionEvaluations: Owner-Read, keine Client-Writes.
[x] createTrackingSession schreibt serverseitige Tracking-Session ohne Reward-Autorität.
[x] recordTrackingProof schreibt serverseitige Proof-Events ohne Reward-Autorität.
[x] createMissionBuddyEvent schreibt serverseitige Buddy-/Mission-Events ohne Reward-Autorität.
[x] evaluateMissionContext bewertet Alter, Parent-Mode, Tageszeit, Radius/GPS, Dauer und Proof-Qualität.
[x] evaluateMissionCompletion sammelt Evidence-Referenzen und erstellt Review-Evaluation.
[!] Alle Evaluation-Flows setzen rewardAuthorized=false und missionCompletionAuthorized=false.
```

### KI-Dimensionen / Quest Chains / Item-Detours

```txt
[x] KI-/Leitsystem soll später Dimensionen, Missionen, Rätsel, Item-Bedarfe und optionale Item-/NFT-Angebote erzeugen/vorschlagen können.
[x] KI erzeugt Vorschläge; Backend entscheidet Preise, Rewards, Freischaltungen, Token-/WFT-Bezüge und Missbrauchsschutz.
[x] Fehlende oder zu teure Items dürfen nicht automatisch Kaufdruck erzeugen.
[x] Zuerst faire spielerische Alternative anbieten: Nebenrätsel, AR-Hinweis, Bewegung, NFC-/Partnerstation oder Tagesmission.
[x] Tagesdimensionen müssen tagesfähig bleiben.
[x] Maximal 1 bis 2 Nebenmissions-Ebenen pro Tagesmission.
[x] Keine endlosen Item-Ketten, keine Paywall-Ketten, keine Frustrationsspirale.
```

### Mission Reward / Context / Payout

```txt
[x] Tagesmissionsdateien analysiert: missions.ts, rewardEngine.ts, MissionDetails.tsx, useDailyMissionFirebase.ts, page.tsx.
[x] Bestehende MVP-Formel erkannt: baseReward × diversityMultiplier × antiFarmingMultiplier × streakMultiplier.
[x] Clientseitige Tagesmissions-Rewards sind MVP/UI-Logik, nicht langfristige Autorität.
[x] Mission Reward / Context / Payout Engine Architekturdatei angelegt und aktualisiert.
[x] Context Evaluation Stub angelegt: ageBand, parentMode, timeWindow, dayType, gpsSafetyStatus, proofQuality, radiusMeters, estimatedMinutes.
[x] Completion Evaluation Stub angelegt: Evidence-Referenzen, Ownership-Prüfung, Mission-Zugehörigkeit, Review-Ergebnis.
[x] Auszahlung muss später Alter, GPS-/Radius-Sicherheit, Elternmodus, Tageszeit, Schultag/Wochenende, Beweisqualität, Anti-Cheat und WellFit-Systemreserve berücksichtigen.
[x] Spätere Token-nahe Bewertung hängt an WellFit-Systemreserve / WellFit-Wallet / Emissions- und Burn-Rhythmus, nicht nur an Einzelmission.
[x] Mobile bleibt bei internen Punkten/XP; echte Token-/NFT-/Trading-/Presale-Funktionen bleiben Web-/PC-Dashboard und nach Testphase.
```

## Neue Architekturdateien

```txt
todolist/G1 - INTERNE PUNKTEOEKONOMIE VOR BLOCKCHAIN
docs/architecture/AI_DIMENSIONS_ITEMS_NFT_ECONOMY.md
docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md
docs/architecture/TRACKING_BUDDY_SERVER_EVENTS.md
functions/EMULATOR_TEST_PLAN.md
```

## Aktuelle technische Prüfbefehle

Root:

```bash
cd /var/www/WellFit-now
git fetch origin
git reset --hard origin/main
npm install --include=dev --no-audit --no-fund
NODE_OPTIONS="--max-old-space-size=768" npm run build
pm2 restart wellfit-now --update-env
pm2 status
pm2 logs wellfit-now --lines 30
```

Functions:

```bash
cd /var/www/WellFit-now/functions
npm install --no-audit --no-fund
npm run check
```

Emulator-Gesamttest:

Terminal 1:

```bash
cd /var/www/WellFit-now
npm run emulators
```

Terminal 2:

```bash
cd /var/www/WellFit-now/functions
npm run test:emulator
```

## Bekannte Server-Hinweise

```txt
[!] Wenn npm install mit ENOTEMPTY bei firebase-tools abbricht, Root-node_modules bereinigen und sauber neu installieren.
[!] Wenn Build `three` nicht findet, ist die Root-Installation unvollständig; `three` steht in package.json und muss installiert sein.
[!] Wenn `firebase: not found` erscheint, fehlt Root-devDependency firebase-tools wegen fehlgeschlagenem install.
[!] T2-Emulator-Tests brauchen laufenden Firestore/Auth/Functions Emulator in T1.
```

## Arbeitsregel

- Bestehende Aufgaben werden nicht gelöscht.
- Erledigte Aufgaben bleiben sichtbar und werden auf `[x]` gesetzt.
- Verschobene Aufgaben bleiben sichtbar und werden auf `[>]` gesetzt.
- Blockierte oder kritische Aufgaben bleiben sichtbar und werden auf `[!]` gesetzt.
- Neue Erkenntnisse werden ergänzt, nicht ersetzt.
- Produktrelevante Punkte dürfen nicht nur im Chat stehen bleiben.
- Änderungen werden künftig in den passenden A–J-Dateien gepflegt.
- Chat-Start-Prompt-Änderungen müssen zusätzlich in `CHAT_START_PROMPT.md` und `README.md` konsolidiert werden.
- Economy-/Reward-/Token-/NFT-/Shop-/Wettkampf-/Jackpot-Entscheidungen müssen zusätzlich in `G`, `G1`, `J` und den passenden Architekturdateien gepflegt werden.
- Echte AR-Entscheidungen müssen zusätzlich in `H1 - NATIVE AR - ARCORE - ARKIT - UNITY` gepflegt werden.
- Buddy-/KI-Guide-/Rätselrallye-Entscheidungen müssen zusätzlich in `H2 - BUDDY ALS REALER AR-BEGLEITER UND KI-GUIDE` gepflegt werden.
- Missions-/Reward-/Auszahlungsentscheidungen müssen zusätzlich in `F`, `G`, `G1` und `docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md` gepflegt werden.
- KI-Dimensionen, Item-Detours, Item-Angebote und NFT-/Ownership-Abgrenzungen müssen zusätzlich in `G`, `G1`, `J` und `docs/architecture/AI_DIMENSIONS_ITEMS_NFT_ECONOMY.md` gepflegt werden.

## Statussystem

```txt
[ ] Offen
[x] Fertig
[~] In Arbeit
[!] Blockiert / kritisch
[>] Später / Backlog
```

## Nächster Arbeitsanker

Für neue Entwicklungsarbeit zuerst prüfen:

```txt
J - NÄCHSTE EMPFOHLENE ARBEIT
```

Bei Mobile/AR/Avatar zusätzlich prüfen:

```txt
H - MOBILE - AR - TRACKING - KI
H1 - NATIVE AR - ARCORE - ARKIT - UNITY
H2 - BUDDY ALS REALER AR-BEGLEITER UND KI-GUIDE
```

Bei Missionen, Rewards, Auszahlungen, Economy, Token/NFT-Fragen, Shop, Jackpot und KI-Quest-Chains zusätzlich prüfen:

```txt
F - FIREBASE  - REALTIME - MISSIONEN
G - REWARD SYSTEM - SYSTEM HEALTH - NEXT-GEN MECHANICS
G1 - INTERNE PUNKTEOEKONOMIE VOR BLOCKCHAIN
docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md
docs/architecture/AI_DIMENSIONS_ITEMS_NFT_ECONOMY.md
```
