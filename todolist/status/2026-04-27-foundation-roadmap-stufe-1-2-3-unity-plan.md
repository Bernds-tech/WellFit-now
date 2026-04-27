# WellFit – Fundament-Roadmap Stufe 1–3 + Unity AR

Datum: 2026-04-27
Repository: Bernds-tech/WellFit-now

## Zweck

Diese Datei hält den Arbeitsplan für die nächsten Fundament-Bausteine fest. Sie ergänzt `F`, `G`, `J`, `H`, `H1` und die Architekturdateien.

Der Fokus bleibt: erst sichere Backend-/Reward-/Anti-Cheat-Grundlage, danach Unity AR Foundation.

---

## Stufe 1 – Mission Security / RewardPreview / Anti-Cheat Grundlage

Status: [~] In Arbeit / großer Teil umgesetzt

### Erledigt

[x] MissionRewardPolicy + RewardPreview Stub.
[x] RewardPreview bleibt reine Simulation.
[x] Keine Reward-/XP-/Punkte-/Token-/Completion-Autorisierung.
[x] Transaktionaler NFC-Duplicate-Schutz über `nfcScanClaims`.
[x] Mission Evidence Review v1.
[x] Proof-Quality-Drosselung in RewardPreview.
[x] SystemReserveSnapshot read-only in RewardPreview v3 begonnen.
[x] UserDailyCap als Preview-/Policy-Cap begonnen.
[x] MissionTypeCap als Preview-/Policy-Cap begonnen.
[x] Firestore Rules blockieren direkte Client-Writes auf kritische Collections.
[x] Emulator-Gesamttests bis Proof-Quality-Drosselung erfolgreich.

### Aktuell in Umsetzung

[~] RewardPreview v3 / System Safety Caps:
- `systemReserveSnapshotId` wird optional gelesen.
- `systemReserveMultiplier` wird berechnet.
- `caps.userDailyCap`, `caps.missionTypeCap`, `caps.appliedCap` werden ausgegeben.
- Test-Erweiterung für gesunde/blockierte SystemReserveSnapshots ist angelegt.

### Noch offen in Stufe 1

[ ] RewardPreview v3 Emulator-Gesamttest ausführen.
[ ] RewardPreview v3 Production Build + PM2 bestätigen.
[ ] Unplausible Sessions detaillierter markieren.
[ ] Wiederholtes Fake-/Pattern-Verhalten erkennen.
[ ] Device-/Session-Muster erkennen.
[ ] Cooldown-/Rate-Limit-Grundlage vorbereiten.
[ ] Roadmap nach erfolgreichem Test konsolidieren.

---

## Stufe 2 – Echte serverseitige Mission Completion / interne Rewards

Status: [ ] Offen / erst nach Stufe 1

Ziel: Server entscheidet erstmals produktiv über interne Mission Completion und interne XP/Punkte – aber weiterhin ohne Token/WFT-Auszahlung.

[ ] `validateMissionCompletionWithItem` produktionsreif implementieren.
[ ] `grantItemOrCapability` produktionsreif implementieren.
[ ] `missionRewardEvents` als echte Audit-Events schreiben.
[ ] Server-Transaktionen für interne XP/Punkte/Streaks vorbereiten.
[ ] UserDailyCap wirklich gegen Nutzerhistorie prüfen.
[ ] MissionTypeCap wirklich gegen Missionstyp und Kontext prüfen.
[ ] Completion nur bei ausreichender Evidence und niedrigerem Risiko erlauben.
[ ] Rejected/Manual-Review-Pfade sauber auditieren.
[ ] Firestore Rules für Nutzerpunkte/XP weiter härten.
[ ] Tagesmissionen schrittweise von MVP-Client-Reward auf Server-Preview/Server-Completion umstellen.

---

## Stufe 3 – Größere Anti-Cheat-, Wettbewerb- und Economy-Grundlage

Status: [ ] Offen / später

[ ] Langfristige Pattern-Erkennung über mehrere Tage/Wochen.
[ ] Wiederholtes Fake-Verhalten pro Nutzer/Gerät erkennen.
[ ] Leaderboard-Servervalidierung.
[ ] Wettkampf-Einsätze serverseitig absichern.
[ ] Jackpot-Settlement backendseitig absichern.
[ ] Burn-/Reserve-Logik nur Backend/Smart Contract.
[ ] Reward Balancing nach Alter, Missionstyp, Schwierigkeit, Kontext und Systemgesundheit.
[ ] Keine echte Token-Ausschüttung vor größerer Testphase.
[ ] MiCA/App-Store/Legal-Prüfung vor WFT-/Token-/NFT-Produktivfunktionen.

---

## Unity AR Foundation – nach Fundament-Stufe 1/2

Status: [ ] Offen

[ ] Unity Hub installieren/öffnen.
[ ] Unity 2022.3 LTS als Startversion verwenden, sofern keine harte Inkompatibilität auftritt.
[ ] Projekt `WellFitBuddyAR` unter `native/unity/WellFitBuddyAR` erzeugen.
[ ] AR Foundation installieren.
[ ] ARCore XR Plugin installieren.
[ ] ARKit XR Plugin installieren.
[ ] XR Plugin Management aktivieren.
[ ] Szene `WellFitBuddyAR` anlegen.
[ ] AR Session, XR Origin, AR Camera, AR Plane Manager, AR Raycast Manager, AR Anchor Manager anlegen.
[ ] Buddy Placeholder anlegen.
[ ] C#-Vorlagen aus `Scripts/*.txt` in `Assets/Scripts/*.cs` übernehmen.
[ ] Ersten Android ARCore Build testen.

## Reihenfolge-Empfehlung

1. Stufe 1 abschließen: RewardPreview v3 testen, builden, PM2 bestätigen.
2. Unplausible Sessions / Pattern Flags v1 bauen.
3. Stufe 2 beginnen: echte serverseitige Completion ohne Token.
4. Erst danach Unity AR-Projekt erzeugen und mit validierten Backend-Zuständen verbinden.

## Harte Sicherheitsregel

Bis zur ausdrücklich späteren Freigabe gilt überall:

```txt
rewardAuthorized=false
xpAuthorized=false
pointsAuthorized=false
tokenAuthorized=false
missionCompletionAuthorized=false
```

Ausnahme später nur nach separatem geprüften Backend-Reward-/Completion-Release.
