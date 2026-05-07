# J Addendum – AR Buddy Large Planning Blocks

Datum: 2026-05-01
Branch: `wellfit/upload-local-unity-ar-buddy`
PR: #13

---

## Zweck

Dieses Addendum ergaenzt `J - NÄCHSTE EMPFOHLENE ARBEIT`, ohne die grosse `J`-Datei weiter aufzublaehen.

Grund: Die ToDo-Governance legt fest, dass `J` operativer Kurzanker bleibt und Detailbloecke in Addenda, Contracts, Plans oder Statusdateien ausgelagert werden.

---

## Aktueller Block

Da aktuell kein lokaler Unity Compile-/Android-Test moeglich ist, wurden grosse, sichere Planungsbloecke vorbereitet.

Keine Unity-Runtime-Scripts wurden geaendert.

---

## Neu vorbereitete Dokumente

### Backend / App / Event-Ingestion

```txt
docs/architecture/BUDDY_BACKEND_EVENT_API_CONTRACT.md
docs/architecture/BUDDY_EVENT_INGESTION_PLAN.md
docs/architecture/BUDDY_MOBILE_UNITY_BRIDGE_PLAN.md
```

Zweck:

- sichere Aufnahme von Unity-/AR-Buddy-Events planen
- Mobile-App-zu-Unity-Bridge planen
- keine Reward-/Completion-/Anti-Cheat-Autoritaet in Unity oder Mobile

### Unity Debug / QA

```txt
native/unity/WellFitBuddyAR/docs/BUDDY_DEBUG_OVERLAY_SPLIT_SPEC.md
native/unity/WellFitBuddyAR/docs/BUDDY_QA_TEST_MATRIX.md
native/unity/WellFitBuddyAR/docs/PC_RETEST_CHECKLIST_2026-05-01.md
```

Zweck:

- Debug-Overlay nach Retest in kleine Komponenten splitten
- QA-Testmatrix fuer Build, ARCore, Placement, Movement, Recall, Auto-Return, Visuals, Abilities, Guide und Security
- PC-Retest-Schritte klar halten

### Product UI

```txt
native/unity/WellFitBuddyAR/docs/BUDDY_PRODUCT_UI_CONTRACT.md
native/unity/WellFitBuddyAR/docs/BUDDY_PRODUCT_UI_MESSAGE_KEYS.md
native/unity/WellFitBuddyAR/docs/BUDDY_PRODUCT_UI_FLOW_PLAN.md
```

Zweck:

- Product-UI getrennt vom Debug-Overlay halten
- Nutzertexte ueber Message Keys skalierbar machen
- Product-UI-Flows fuer AR Start, Surface Missing, Placement, Movement, Recall, Ability Missing, Guide Suggestions und Safety-Hints planen

### ToDo-Governance / Skalierbarkeit

```txt
todolist/L - SKALIERBARKEIT - AR BUDDY UI UND ARCHITEKTUR.md
todolist/TODOLIST_GOVERNANCE_CONTRACT.md
todolist/README_SCALABILITY_ADDENDUM.md
todolist/CHAT_START_SCALABILITY_ADDENDUM.md
todolist/status/2026-05-01-todolist-governance-and-scalability-handoff.md
```

Zweck:

- Code/UI/Docs/ToDos skalierbar halten
- `J` als Kurzanker erhalten
- Detailthemen in Addenda/Contracts/Plans/Statusdateien auslagern

---

## Weiterhin nicht tun vor Unity-Retest

[!] Keine weiteren Unity-Runtime-Scripts stapeln.
[!] Keine Scene-/Prefab-YAML gross patchen.
[!] Keine Backend-Event-Ingestion implementieren.
[!] Keine Product-UI-Runtime implementieren.
[!] Keine Reward-/Completion-/Anti-Cheat-Kopplung an Unity-Events.

---

## Naechster technischer Schritt bleibt unveraendert

Am PC:

```powershell
cd C:\wellfit\WellFit-now
git checkout wellfit/upload-local-unity-ar-buddy
git pull --ff-only origin wellfit/upload-local-unity-ar-buddy
```

Unity oeffnen:

```txt
C:\wellfit\WellFit-now\native\unity\WellFitBuddyAR
```

Dann:

1. Unity Compile pruefen.
2. Compilefehler zuerst beheben.
3. Android Build/Run starten.
4. 4 Debug-Seiten testen.
5. Danach Runtime-Refactor starten.

---

## Naechste Arbeit nach erfolgreichem Retest

1. Debug Overlay splitten gemaess `BUDDY_DEBUG_OVERLAY_SPLIT_SPEC.md`.
2. Product UI separat planen/implementieren gemaess `BUDDY_PRODUCT_UI_FLOW_PLAN.md`.
3. Event Envelope vorbereiten gemaess `BUDDY_EVENT_STATE_VERSIONING_PLAN.md`.
4. Mobile-Unity Bridge priorisieren gemaess `BUDDY_MOBILE_UNITY_BRIDGE_PLAN.md`.
5. Backend Event API erst danach als Stub planen.

---

## Statusbewertung

[x] Grosse Planungsbloecke vorbereitet.
[x] ToDo-Governance beachtet.
[x] Runtime-Risiko vermieden.
[ ] Unity Compile-/Android-Retest offen.
