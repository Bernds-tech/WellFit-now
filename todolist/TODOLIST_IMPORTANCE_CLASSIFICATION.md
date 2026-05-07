# WellFit – ToDo Importance Classification

Version: 1.0
Stand: 2026-05-01
Zweck: Wichtigkeit der ToDo-/Roadmap-Inhalte fuer Fertigstellung und Ausbau einordnen

---

## Grundsatz

Nichts wird geloescht.

Alle Ideen, Plaene und Visionen bleiben erhalten. Die Wichtigkeit wird nur eingeordnet, damit WellFit zielgerichtet fertiggestellt werden kann.

---

## Wichtigkeitsstufen

```txt
P0 = Muss fuer testbare Alpha / ohne das ist WellFit nicht stabil testbar
P1 = Wichtig fuer gute Beta / sollte nach Alpha folgen
P2 = Ausbau nach stabiler Beta / wertvoll, aber nicht blockierend
P3 = Vision / spaeter / nicht MVP-kritisch
ARCHIVE = historisch oder Status, nicht aktive Umsetzung
REFERENCE = Nachschlagewerk / Contract / Plan
```

---

## P0 – Muss fuer testbare Alpha

Diese Bereiche sind notwendig, damit WellFit als erste testbare Version funktioniert.

```txt
Login / Registrierung
Nutzerprofil
Mobile-Grundstruktur
AR-Buddy Basis
Unity ARCore/AR Foundation Compile + Android Build
Buddy platzieren
Buddy bewegen
Buddy rufen
Missionen / Challenges als einfacher Game Loop
interne Punkte / XP als Simulation
serverseitige Mission-/Reward-Grundlage
Firebase / Firestore Rules / Callable Functions
keine clientseitige Autoritaet fuer Rewards/Completion
Debug-/QA-Grundlage
Deployment / Build-Faehigkeit
```

Relevante Dateien:

```txt
todolist/J - NÄCHSTE EMPFOHLENE ARBEIT
todolist/K_AR-BUDDY_COMPANION_UND_AVATAR-GRUNDLOGIK.md
todolist/L - SKALIERBARKEIT - AR BUDDY UI UND ARCHITEKTUR.md
todolist/G1 - INTERNE PUNKTEOEKONOMIE VOR BLOCKCHAIN
todolist/F - FIREBASE  - REALTIME - MISSIONEN
native/unity/WellFitBuddyAR/docs/PC_RETEST_CHECKLIST_2026-05-01.md
native/unity/WellFitBuddyAR/docs/BUDDY_QA_TEST_MATRIX.md
```

---

## P1 – Wichtig fuer gute Beta

Diese Bereiche machen das Produkt deutlich besser, muessen aber die erste Alpha nicht blockieren.

```txt
Debug-Overlay sauber splitten
Product-UI getrennt vom Debug-Overlay
Tap-Zielmarker
Plane-Missing-Hinweise
Surface Quality
Re-Anchor nach Bewegung/Rueckruf
Companion Radius finalisieren
Buddy-KI-Guide stabilisieren
App-/Unity-Bridge fuer erste Commands
Event Envelope / Event Versioning
Backend Event Logging als logged-only
Avatar-Profilstruktur MVP
erste Avatar-Typen als Profile
```

Relevante Dateien:

```txt
native/unity/WellFitBuddyAR/docs/BUDDY_DEBUG_OVERLAY_SPLIT_SPEC.md
native/unity/WellFitBuddyAR/docs/BUDDY_PRODUCT_UI_CONTRACT.md
native/unity/WellFitBuddyAR/docs/BUDDY_PRODUCT_UI_MESSAGE_KEYS.md
native/unity/WellFitBuddyAR/docs/BUDDY_PRODUCT_UI_FLOW_PLAN.md
native/unity/WellFitBuddyAR/docs/BUDDY_EVENT_STATE_VERSIONING_PLAN.md
native/unity/WellFitBuddyAR/docs/BUDDY_COMMAND_CONTRACT.md
docs/architecture/BUDDY_MOBILE_UNITY_BRIDGE_PLAN.md
docs/architecture/BUDDY_EVENT_INGESTION_PLAN.md
```

---

## P2 – Ausbau nach stabiler Beta

Diese Themen sind wertvoll, aber nicht noetig, um WellFit zuerst testbar und produktfaehig zu machen.

```txt
Voice Push-to-Talk
TTS-Ausgabe fuer Buddy
Avatar Voice Profiles
mehr Avatar-Typen
umfangreiche Ability-/Item-Profile
fortgeschrittene KI-Missionsempfehlungen
Backend Event API produktionsnah
Product UI Lokalisierung
familien-/altersabhaengige Varianten
Partner-/Museum-/Stadt-Missionsmodule
B2B-/Schul-/Tourismus-Pfade
```

Relevante Dateien:

```txt
docs/architecture/BUDDY_VOICE_INTERACTION_ARCHITECTURE.md
docs/architecture/BUDDY_VOICE_COMMAND_CONTRACT.md
native/unity/WellFitBuddyAR/docs/BUDDY_AVATAR_VOICE_PERSONALITY_PROFILES.md
native/unity/WellFitBuddyAR/docs/BUDDY_AVATAR_PROFILE_ARCHITECTURE.md
native/unity/WellFitBuddyAR/docs/BUDDY_AVATAR_PROFILE_REGISTRY_DRAFT.md
native/unity/WellFitBuddyAR/docs/BUDDY_AVATAR_MOVEMENT_PROFILES.md
native/unity/WellFitBuddyAR/docs/BUDDY_AVATAR_ABILITY_PROFILES.md
native/unity/WellFitBuddyAR/docs/BUDDY_AVATAR_PERSONALITY_PROFILES.md
```

---

## P3 – Vision / spaeter

Diese Punkte gehoeren zur grossen WellFit-Vision, sollen aber die Alpha/Beta nicht blockieren.

```txt
echte NFTs
echter WFT-Token
Blockchain-Integration
Marketplace
Trading
Staking
DAO
Presale in produktnahen Bereichen
DePIN / Compute-as-a-Service
komplexe Avatar-Vererbung
lebenslanger Avatar
Wake Word / Always Listening
freier Voice Chat
komplexe B2B-Whitelabel-Plattform
voller Partner-Marktplatz
```

Regel:

```txt
P3 bleibt dokumentiert, aber nicht aktiv umsetzen, bevor P0 und P1 stabil sind.
```

---

## REFERENCE – Nachschlagewerk / Contracts / Plaene

Diese Dateien werden nicht taeglich abgearbeitet, sondern bei Bedarf gelesen.

```txt
BUDDY_*_CONTRACT.md
BUDDY_*_PLAN.md
BUDDY_*_CHECKLIST.md
docs/architecture/*.md
README_SCALABILITY_ADDENDUM.md
CHAT_START_SCALABILITY_ADDENDUM.md
TODOLIST_GOVERNANCE_CONTRACT.md
```

Regel:

```txt
Reference-Dateien bleiben erhalten, werden aber nicht als aktueller Sprint interpretiert.
```

---

## ARCHIVE – Historisch / Status

```txt
todolist/status/*.md
alte Handoff-Dateien
alte Testlogs
alte Micro-Task-Logs
```

Regel:

```txt
Archiv bleibt erhalten, aber bestimmt nicht automatisch den aktuellen Fokus.
```

---

## Entscheidungsregel fuer neue Aufgaben

Bei jeder neuen Aufgabe fragen:

```txt
Hilft es direkt P0?
Wenn ja: jetzt priorisieren.

Hilft es P1?
Wenn P0 nicht blockiert wird: vorbereiten oder direkt danach.

Ist es P2?
Dokumentieren, aber nicht Alpha blockieren.

Ist es P3?
Als Vision behalten, aber nicht jetzt bauen.
```

---

## Aktueller operativer Fokus

Aktuell bleibt P0 entscheidend:

```txt
Unity Branch pullen
Unity Compile pruefen
Android Build/Run testen
4 Debug-Seiten testen
Compile-/Runtime-Fehler beheben
AR-Buddy Basis stabilisieren
```

---

## Wichtig

Diese Klassifikation ersetzt keine ToDo-Dateien und loescht nichts.

Sie aendert nur die Bedeutung:

```txt
P0/P1 = fuer Fertigstellung relevant
P2/P3 = spaeterer Ausbau
REFERENCE/ARCHIVE = behalten, aber nicht als Sprint-Blocker behandeln
```
