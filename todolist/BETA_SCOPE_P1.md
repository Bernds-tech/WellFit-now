# WellFit – Beta Scope P1

Version: 1.0
Stand: 2026-05-01
Zweck: Wichtige Beta-Erweiterungen nach stabiler Alpha

---

## Grundsatz

P1 ist wichtig fuer eine gute Beta, aber blockiert nicht die testbare Alpha.

P1 beginnt, sobald P0 stabil genug ist:

```txt
Unity Compile gruen
Android AR-Buddy Test laeuft
Basis-Mission/Game Loop funktioniert
Security-Grundlage bleibt sauber
```

---

## P1-Ziel

Die Beta soll sich nicht nur technisch lauffaehig, sondern produktnah anfuehlen.

Dazu gehoeren:

```txt
saubere Product-UI
stabilerer AR-Buddy
bessere Companion-Logik
erste Avatar-Profile
erste App-/Unity-Commands
versionierte Events
Basis-Backend-Event-Log als logged-only
```

---

## P1-Bereich 1 – Debug-Overlay entkoppeln

Nach erfolgreichem Unity-Retest:

```txt
BuddyCallDebugController.cs splitten
Root / DiagnosticsPanel / ReturnPage / VisualPage / AbilityPage / GuidePage
Debug per Flag oder Debug-Szene abschaltbar machen
```

Referenzen:

```txt
BUDDY_DEBUG_OVERLAY_SPLIT_SPEC.md
RUNTIME_REFACTOR_CHECKLIST.md
```

---

## P1-Bereich 2 – Product-UI vorbereiten

```txt
Product-UI getrennt vom Debug-Overlay
kurze nutzerfreundliche Hinweise
Message Keys statt harter Texte
Surface-Hinweise
Movement-Hinweise
Ability-Hinweise
Guide-Hinweise
```

Referenzen:

```txt
BUDDY_PRODUCT_UI_CONTRACT.md
BUDDY_PRODUCT_UI_MESSAGE_KEYS.md
BUDDY_PRODUCT_UI_FLOW_PLAN.md
```

---

## P1-Bereich 3 – AR-Buddy Stabilisierung

```txt
Tap-Zielmarker
Plane-Missing-Hinweis
Surface Quality
Re-Anchor nach Bewegung/Rueckruf
Companion Radius stabilisieren
Auto-Return gegen Spam absichern
```

Referenzen:

```txt
BUDDY_SURFACE_QUALITY_DRAFT.md
BUDDY_COMPANION_RADIUS_CONTRACT.md
BUDDY_MOVEMENT_POLICY_DRAFT.md
```

---

## P1-Bereich 4 – App-/Unity-Bridge

Erste sichere Commands:

```txt
callBuddyToUser
resetPlacement
applyGuideSuggestion
clearGuide
```

Danach:

```txt
applyAbilityState
setCompanionMode
setDebugMode
```

Referenzen:

```txt
BUDDY_COMMAND_CONTRACT.md
BUDDY_MOBILE_UNITY_BRIDGE_PLAN.md
BUDDY_MOBILE_AR_PRODUCT_INTEGRATION_MAP.md
```

---

## P1-Bereich 5 – Event-Versionierung

```txt
Event Envelope
Command Envelope
State Envelope
EventNames Allowlist
DebugOnly-Markierung
```

Referenzen:

```txt
BUDDY_EVENT_STATE_VERSIONING_PLAN.md
BUDDY_EVENT_CONTRACT.md
```

---

## P1-Bereich 6 – Backend logged-only Event API

Nur wenn Unity-Events stabil sind:

```txt
recordBuddyArEvent Stub
buddyArEvents Collection Draft
Direct Client Writes blockiert
rewardAuthorized=false
missionCompletionAuthorized=false
```

Referenzen:

```txt
BUDDY_BACKEND_EVENT_API_CONTRACT.md
BUDDY_BACKEND_STUB_READINESS_PLAN.md
BUDDY_EVENT_INGESTION_PLAN.md
```

---

## P1-Bereich 7 – Erste Avatar-Profile

```txt
AvatarProfile Registry
MovementProfile
AbilityProfile
PersonalityProfile
Visual/PrefabKey
```

MVP-Profile:

```txt
animal_dog_default
animal_cat_default
fantasy_dragon_default
robot_companion_default
humanoid_knight_default
magic_creature_default
```

Referenzen:

```txt
BUDDY_AVATAR_PROFILE_ARCHITECTURE.md
BUDDY_AVATAR_PROFILE_REGISTRY_DRAFT.md
BUDDY_AVATAR_MOVEMENT_PROFILES.md
BUDDY_AVATAR_ABILITY_PROFILES.md
BUDDY_AVATAR_PERSONALITY_PROFILES.md
```

---

## P1-Bereich 8 – Buddy KI Guide stabilisieren

```txt
Rules-Fallback weiter stabil halten
Backend-/Remote-Provider sauber anzeigen
Guide Suggestions an Unity uebergeben
fehlende Faehigkeiten erklaeren
keine Rewards/Completion in KI oder Unity
```

Referenzen:

```txt
BUDDY_GUIDE_MISSION_CONTRACT.md
BUDDY_PRODUCT_UI_FLOW_PLAN.md
app/api/buddy-ki/route.ts
```

---

## Nicht P1-blockierend

Bleibt P2/P3:

```txt
Voice Runtime
TTS Provider
Wake Word
NFTs
WFT Token
Marketplace
DePIN
B2B Whitelabel
voller Partner Editor
freie Voice-Chats
```

---

## P1 Definition of Done

```txt
[ ] Debug-Overlay ist modular.
[ ] Product-UI ist getrennt geplant oder minimal umgesetzt.
[ ] Surface-/Movement-Hints funktionieren.
[ ] erste App-/Unity-Commands sind stabil.
[ ] Unity Events sind versioniert oder klar normalisiert.
[ ] Backend Event Logging ist logged-only vorbereitet.
[ ] erste Avatar-Profile sind datengetrieben vorbereitet.
[ ] keine neue Client-/Unity-Autoritaet fuer Rewards/Completion entstanden.
```

---

## Entscheidungsregel

P1 darf erst aktiv dominieren, wenn P0 nicht mehr blockiert ist.

Wenn P0-Fehler auftreten:

```txt
P1 pausieren.
P0 reparieren.
```
