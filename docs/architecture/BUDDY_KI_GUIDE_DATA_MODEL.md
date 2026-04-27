# WellFit – Buddy KI Guide Data Model

Stand: 2026-04-27

## Ziel

Der Buddy soll Nutzer am Handy durch Missionen, Menues, AR-Hinweise, Ausruestung und naechste Schritte fuehren.

Der Buddy darf Vorschlaege erzeugen, aber keine Rewards, XP, Punkte, Token oder finale Mission Completion autorisieren.

## Grundprinzip

```txt
KI/Buddy = Vorschlag, Erklaerung, Motivation, UI-Fuehrung
Unity = Darstellung, AR-Bewegung, Animation, Ereignismeldung
Backend = Autoritaet fuer Mission, Evidence, Anti-Cheat, interne Rewards
```

## Collection-Vorschlag

### buddyGuideSessions

Eine laufende Buddy-Guide-Session pro Nutzer und Kontext.

```ts
type BuddyGuideSession = {
  sessionId: string;
  userId: string;
  buddyId: string;
  currentMissionId?: string;
  currentMissionType?: "daily" | "weekly" | "adventure" | "challenge" | "competition" | "arRiddle";
  mode: "menuGuide" | "missionGuide" | "arGuide" | "riddleGuide" | "equipmentGuide";
  ageBand?: "toddler" | "child" | "teen" | "adult" | "senior";
  parentMode?: boolean;
  language?: "de" | "en";
  mood: "neutral" | "happy" | "curious" | "helpful" | "warning";
  status: "active" | "paused" | "completed" | "cancelled";
  createdAt: unknown;
  updatedAt: unknown;
};
```

### buddyGuideMessages

Dialog-, Hinweis- und Empfehlungsevents.

```ts
type BuddyGuideMessage = {
  messageId: string;
  sessionId: string;
  userId: string;
  buddyId: string;
  messageKey: string;
  messageType: "hint" | "question" | "recommendation" | "warning" | "celebration" | "equipmentNeeded";
  text?: string;
  options?: Array<{
    optionId: string;
    label: string;
    value: string;
  }>;
  status: "queued" | "shown" | "answered" | "dismissed";
  createdAt: unknown;
  shownAt?: unknown;
  answeredAt?: unknown;
};
```

### buddyGuideRecommendations

Naechste Mission, naechster Hinweis oder Ausruestungsvorschlag.

```ts
type BuddyGuideRecommendation = {
  recommendationId: string;
  userId: string;
  buddyId: string;
  source: "ai" | "rules" | "mission" | "backend";
  recommendationType: "startMission" | "continueMission" | "useItem" | "scanNfc" | "lookAtMarker" | "takeBreak";
  missionId?: string;
  itemId?: string;
  capabilityId?: string;
  reasonKey: string;
  riskLevel: "low" | "medium" | "high";
  backendValidationStatus: "pending" | "approved" | "rejected" | "manualReview";
  createdAt: unknown;
  updatedAt: unknown;
};
```

### buddyArEvents

Events aus Unity/AR zurueck an WellFit.

```ts
type BuddyArEvent = {
  eventId: string;
  userId: string;
  buddyId: string;
  missionId?: string;
  eventType:
    | "arReady"
    | "planeDetected"
    | "anchorCreated"
    | "buddyPlaced"
    | "buddyActionStarted"
    | "buddyActionCompleted"
    | "buddyReachedSurface"
    | "hintMarkerCreated"
    | "hintMarkerResolved"
    | "arError";
  anchorId?: string;
  surfaceId?: string;
  markerId?: string;
  capabilityId?: string;
  itemId?: string;
  clientPayload?: Record<string, unknown>;
  serverValidationStatus: "received" | "validated" | "rejected" | "manualReview";
  rewardAuthorized: false;
  missionCompletionAuthorized: false;
  createdAt: unknown;
};
```

## Buddy-KI-Kontext

Der Buddy darf spaeter folgende Daten nutzen, wenn Consent und Datenschutz passen:

- aktuelle Mission
- offene Tagesmissionen
- offene Wochenmissionen
- aktueller Fortschritt
- Alter/Altersgruppe
- Elternmodus
- bevorzugte Sprache
- aktuelle AR-Session
- vorhandene Items/Faehigkeiten
- letzte Buddy-Nachricht
- sichere Kontextbewertung aus Backend

## Was der Buddy nicht darf

- keine medizinischen Diagnosen
- keine harte Scham-/Drucksprache als Standard
- keine Token-/Trading-/Presale-Funktionen in Mobile
- keine Reward-Autorisierung
- keine Mission Completion-Autorisierung
- keine Client-Entscheidung ueber Punkte/XP
- kein Kaufdruck durch fehlende Items

## Faire Detour-Regel

Wenn ein Item fehlt, soll der Buddy zuerst faire Alternativen anbieten:

1. kleine Nebenmission
2. AR-Hinweis
3. NFC-/Partnerstation
4. sichere Bewegung
5. einfachere Ersatzaufgabe

Erst danach darf ein optionaler Shop-/Item-Hinweis kommen, sofern rechtlich und UX-seitig sauber.

## Verbindung zu Stufe 1

Stufe 1 hat vorbereitet:

- Evidence Review
- Pattern Review
- Cooldown Review
- RewardPreview
- serverseitige Rules

Der Buddy nutzt diese Bewertungen nur als Anzeige-/Guide-Kontext. Die Autoritaet bleibt beim Backend.
