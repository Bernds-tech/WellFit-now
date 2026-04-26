# WellFit todolist

Dieser Ordner enthält die aufgeteilte, versionierte WellFit Master-Roadmap.

## Maßgebliche Struktur

Die verbindliche Struktur sind die Dateien `A` bis `J`:

```txt
A - MASTER-REGELN - STATUSSYSTEM
B - AKTUELLER SPRINT-STAND – LOGIN - REGISTRIERUNG - DEPLOYMENT
C - STRATEGISCHE GRUNDENTSCHEIDUNGEN
D - VERBINDLICHE REIHENFOLGE
E - AKTUELLER UMSETZUNGSSTAND - VORHANDEN
F - FIREBASE - REALTIME - MISSIONEN
G - REWARD SYSTEM - SYSTEM HEALTH - NEXT-GEN MECHANICS
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
```

`H1 - NATIVE AR - ARCORE - ARKIT - UNITY` ist die verbindliche Detail-Roadmap für echtes Flammi-AR mit World Tracking, Plane Detection, ARCore, ARKit und Unity AR Foundation. Sie ergänzt `H - MOBILE - AR - TRACKING - KI` und wird bei allen AR-/Avatar-/Native-Mobile-Aufgaben mitgelesen.

`H2 - BUDDY ALS REALER AR-BEGLEITER UND KI-GUIDE` ist die verbindliche Produktvision für den Buddy als echten AR-Begleiter, KI-Guide, Missionsführer, Rätselrallye-Begleiter und natürliche Navigations-/Interaktionsschicht.

Historische/ergänzende Addenda bleiben sichtbar. Inhalte daraus wurden in die A–J-Struktur übernommen oder werden dort weitergeführt.

## Aktueller konsolidierter Stand

Stand: Version 5.6 aus `J - NÄCHSTE EMPFOHLENE ARBEIT`.

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
[x] Demo Items und NFC-Tags angelegt: rope_001, magnifier_001, small_backpack_001.
[x] Java 17 installiert und Firebase Emulator erfolgreich gestartet.
[x] Gesamt-Emulator-Test erfolgreich: smoke:nfc + rules:firestore + callable:emulator.
[x] Direkte Client-Writes auf Item-/NFC-/Capability-/Audit-Collections werden blockiert.
[x] Echte Callable Functions im Emulator erfolgreich getestet.
```

### NFC / Items / Buddy-Fähigkeiten

```txt
[x] NFC-Tags = reale physische Trigger, keine NFTs.
[x] Items/Gadgets = Ausrüstung/Fähigkeiten für Buddy/Avatar/KI-Body.
[x] NFTs = spätere digitale Besitzobjekte/Sammlerobjekte/besondere Ausrüstung.
[x] Kletterseil-Demo: WF-DEMO-ROPE-TREE-001 -> rope_001 -> climbUp.
[x] Lupe-Demo vorbereitet: WF-DEMO-MAGNIFIER-LEAF-001 -> magnifier_001 -> scanObject.
[!] NFC-Scan darf niemals direkt Reward/Item final freischalten; Backend bleibt Autorität.
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
[x] Mission Reward / Context / Payout Engine Architekturdatei angelegt.
[x] Auszahlung muss später Alter, GPS-/Radius-Sicherheit, Elternmodus, Tageszeit, Schultag/Wochenende, Beweisqualität, Anti-Cheat und WellFit-Systemreserve berücksichtigen.
[x] Spätere Token-nahe Bewertung hängt an WellFit-Systemreserve / WellFit-Wallet / Emissions- und Burn-Rhythmus, nicht nur an Einzelmission.
[x] Mobile bleibt bei internen Punkten/XP; echte Token-/NFT-/Trading-/Presale-Funktionen bleiben Web-/PC-Dashboard und nach Testphase.
```

## Neue Architekturdateien

```txt
docs/architecture/AI_DIMENSIONS_ITEMS_NFT_ECONOMY.md
docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md
functions/EMULATOR_TEST_PLAN.md
```

## Aktuelle technische Prüfbefehle

Root:

```bash
cd /var/www/WellFit-now
git fetch origin
git reset --hard origin/main
npm install --no-audit --no-fund
NODE_OPTIONS="--max-old-space-size=768" npm run build
pm2 restart wellfit-now --update-env
pm2 status
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

## Arbeitsregel

- Bestehende Aufgaben werden nicht gelöscht.
- Erledigte Aufgaben bleiben sichtbar und werden auf `[x]` gesetzt.
- Verschobene Aufgaben bleiben sichtbar und werden auf `[>]` gesetzt.
- Blockierte oder kritische Aufgaben bleiben sichtbar und werden auf `[!]` gesetzt.
- Neue Erkenntnisse werden ergänzt, nicht ersetzt.
- Produktrelevante Punkte dürfen nicht nur im Chat stehen bleiben.
- Änderungen werden künftig in den passenden A–J-Dateien gepflegt.
- Echte AR-Entscheidungen müssen zusätzlich in `H1 - NATIVE AR - ARCORE - ARKIT - UNITY` gepflegt werden.
- Buddy-/KI-Guide-/Rätselrallye-Entscheidungen müssen zusätzlich in `H2 - BUDDY ALS REALER AR-BEGLEITER UND KI-GUIDE` gepflegt werden.
- Missions-/Reward-/Auszahlungsentscheidungen müssen zusätzlich in `F`, `G` und `docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md` gepflegt werden.
- KI-Dimensionen, Item-Detours, Item-Angebote und NFT-/Ownership-Abgrenzungen müssen zusätzlich in `G`, `J` und `docs/architecture/AI_DIMENSIONS_ITEMS_NFT_ECONOMY.md` gepflegt werden.

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

Bei Missionen, Rewards, Auszahlungen und KI-Quest-Chains zusätzlich prüfen:

```txt
F - FIREBASE - REALTIME - MISSIONEN
G - REWARD SYSTEM - SYSTEM HEALTH - NEXT-GEN MECHANICS
docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md
docs/architecture/AI_DIMENSIONS_ITEMS_NFT_ECONOMY.md
```
