# WellFit – Buddy Backend Stub Readiness Plan

Status: Draft fuer Backend-Vorbereitung nach Unity-Retest
Branch-Kontext: `wellfit/upload-local-unity-ar-buddy`
PR-Kontext: #13

---

## Zweck

Dieses Dokument beschreibt, wann und wie spaeter Backend-Stubs fuer AR-Buddy-Events vorbereitet werden koennen.

Es ist bewusst nur ein Plan. Die Implementierung erfolgt erst, wenn Unity Compile und Android-Retest die Eventnamen und Payloads bestaetigt haben.

---

## Startbedingung

Backend-Stubs erst beginnen, wenn:

[ ] Unity Compile gruen ist.
[ ] Android Build/Run funktioniert.
[ ] Eventnamen im Debug-Overlay oder Logcat bestaetigt sind.
[ ] Event-Payloads grob stabil sind.
[ ] Security-Grenze bestaetigt ist: Unity meldet nur Events.

---

## Geplante erste Stub-Funktion

Moeglicher Name:

```txt
recordBuddyArEvent
```

Ziel:

- Event entgegennehmen
- Auth pruefen
- Payload validieren
- Event mit serverseitigem Timestamp speichern
- keine Punkte/XP/Rewards/Completion autorisieren

---

## Minimaler Stub-Scope

Version 0 darf nur:

```txt
validate auth
validate eventName
validate contractVersion
limit payload size
write event log
return logged-only
```

Version 0 darf nicht:

```txt
Mission abschliessen
Punkte buchen
XP buchen
Reward buchen
Anti-Cheat entscheiden
Items freischalten
Faehigkeiten freischalten
```

---

## Collection Draft

```txt
buddyArEvents/{eventId}
```

Pflichtfelder:

```txt
userId
contractVersion
eventName
payloadType
debugOnly
createdAt
source
ingestionStatus
rewardAuthorized=false
missionCompletionAuthorized=false
```

---

## Rules Draft

```txt
Client direct write: blocked
Cloud Functions write: allowed via Admin SDK
User read own events: optional later
```

---

## Emulator-Test-Scope

Erste Tests:

[ ] Direct client write wird blockiert.
[ ] Callable ohne Auth wird abgelehnt.
[ ] Callable mit Auth schreibt logged-only Event.
[ ] Unknown EventName wird abgelehnt.
[ ] Zu grosse Payload wird abgelehnt.
[ ] Event schreibt immer `rewardAuthorized=false`.
[ ] Event schreibt immer `missionCompletionAuthorized=false`.

---

## Abhaengigkeiten

```txt
BUDDY_EVENT_STATE_VERSIONING_PLAN.md
BUDDY_EVENT_INGESTION_PLAN.md
BUDDY_BACKEND_EVENT_API_CONTRACT.md
BUDDY_QA_TEST_MATRIX.md
PC_RETEST_CHECKLIST_2026-05-01.md
```

---

## Risiken

```txt
Event-Spam
instabile Payloads
fehlende Session-Zuordnung
zu fruehe Completion-Kopplung
zu fruehe Reward-Kopplung
```

Gegenregel:

```txt
Erste Backend-Stufe bleibt logged-only.
```

---

## Naechste Schritte nach Unity-Retest

1. Eventnamen aus Test erfassen.
2. Allowlist finalisieren.
3. Payload-Felder minimalisieren.
4. Callable Stub planen.
5. Emulator-Test schreiben.
6. Erst danach App-Integration planen.

---

## Status

[ ] Noch nicht implementieren.
[x] Readiness-Kriterien definiert.
