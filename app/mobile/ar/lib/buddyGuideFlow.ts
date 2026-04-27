import { createNativeArBuddyEvent, type NativeArBuddyEvent, type NativeArBuddyEventType } from "@/lib/nativeAr/nativeArTypes";

type BuddyGuideOption = {
  id: string;
  label: string;
  eventType: NativeArBuddyEventType;
  payload?: NativeArBuddyEvent["payload"];
};

export type BuddyGuideCard = {
  id: string;
  title: string;
  description: string;
  tone: "neutral" | "success" | "warning" | "danger";
  options: BuddyGuideOption[];
};

export function createBuddyGuideCard(event: NativeArBuddyEvent | null, cameraActive: boolean): BuddyGuideCard {
  if (!cameraActive) {
    return {
      id: "camera-required",
      title: "Buddy wartet",
      description: "Starte die Kamera, damit der Buddy dich im AR-Modus begleiten kann.",
      tone: "neutral",
      options: [],
    };
  }

  if (!event) {
    return {
      id: "ready",
      title: "Buddy ist bereit",
      description: "Teste Dialog, Mission, Item oder Marker. Spaeter kommen diese Events aus Unity.",
      tone: "neutral",
      options: [
        {
          id: "suggest-mission",
          label: "Mission vorschlagen",
          eventType: "onBuddyMissionSuggested",
          payload: { missionId: "demo_ar_walk_001", reason: "safe-starter-mission" },
        },
        {
          id: "show-dialogue",
          label: "Buddy sprechen lassen",
          eventType: "onBuddyDialogueShown",
          payload: { messageKey: "buddy.ready.question", status: "shown" },
        },
      ],
    };
  }

  if (event.eventType === "onBuddyMissionSuggested") {
    const missionId = event.payload.missionId || event.missionId || "demo_ar_walk_001";
    return {
      id: "mission-suggested",
      title: "Mission vorgeschlagen",
      description: `Der Buddy empfiehlt ${missionId}. Du kannst die Mission starten oder zuerst einen Hinweis anzeigen lassen.`,
      tone: "success",
      options: [
        {
          id: "start-mission",
          label: "Mission starten",
          eventType: "onBuddyActionStarted",
          payload: { action: "walk", missionId, status: "mission-start-requested" },
        },
        {
          id: "show-marker",
          label: "Hinweis anzeigen",
          eventType: "onArHintMarkerCreated",
          payload: { markerId: "marker_mission_hint_001", missionId, markerType: "Clue" },
        },
      ],
    };
  }

  if (event.eventType === "onBuddyCapabilityNeeded" || event.eventType === "onBuddyActionRejected") {
    const capabilityId = event.payload.capabilityId || event.capabilityId || "climbUp";
    return {
      id: "capability-needed",
      title: "Ausrüstung fehlt",
      description: `Der Buddy braucht ${capabilityId}. Wir zeigen zuerst faire Alternativen statt Kaufdruck.`,
      tone: "warning",
      options: [
        {
          id: "fair-detour",
          label: "Alternative Mission",
          eventType: "onBuddyMissionSuggested",
          payload: { missionId: "demo_safe_detour_001", reason: "fair-detour-no-item-required" },
        },
        {
          id: "scan-nfc",
          label: "NFC/Item prüfen",
          eventType: "onBuddyDialogueShown",
          payload: { messageKey: "buddy.item.scan.explain", capabilityId },
        },
      ],
    };
  }

  if (event.eventType === "onArHintMarkerCreated" || event.eventType === "onArHintMarkerFocused") {
    const markerId = event.payload.markerId || event.markerId || "marker_demo_001";
    return {
      id: "marker-active",
      title: "Hinweis gefunden",
      description: `Der Buddy hat ${markerId} markiert. Du kannst den Hinweis öffnen oder als erledigt markieren.`,
      tone: "success",
      options: [
        {
          id: "focus-marker",
          label: "Hinweis fokussieren",
          eventType: "onArHintMarkerFocused",
          payload: { markerId },
        },
        {
          id: "resolve-marker",
          label: "Hinweis erledigt",
          eventType: "onArHintMarkerResolved",
          payload: { markerId, status: "resolved" },
        },
      ],
    };
  }

  if (event.eventType === "onArError") {
    return {
      id: "ar-error",
      title: "AR braucht Hilfe",
      description: event.payload.message || "Der Buddy konnte die AR-Aktion nicht ausführen.",
      tone: "danger",
      options: [
        {
          id: "retry-dialogue",
          label: "Tipp anzeigen",
          eventType: "onBuddyDialogueShown",
          payload: { messageKey: "ar.retry.tip", status: "shown" },
        },
      ],
    };
  }

  return {
    id: "generic",
    title: "Buddy reagiert",
    description: "Der Buddy hat ein Ereignis gesendet. Der nächste Schritt bleibt sicher in App/Backend kontrolliert.",
    tone: "neutral",
    options: [
      {
        id: "continue",
        label: "Weiter",
        eventType: "onBuddyDialogueShown",
        payload: { messageKey: "buddy.continue" },
      },
    ],
  };
}

export function createBuddyGuideOptionEvent(option: BuddyGuideOption, currentEvent: NativeArBuddyEvent | null) {
  return createNativeArBuddyEvent({
    eventType: option.eventType,
    missionId: option.payload?.missionId || currentEvent?.missionId,
    markerId: option.payload?.markerId || currentEvent?.markerId,
    capabilityId: option.payload?.capabilityId || currentEvent?.capabilityId,
    itemId: option.payload?.itemId || currentEvent?.itemId,
    payload: option.payload || { status: "guide-flow-selected" },
  });
}
