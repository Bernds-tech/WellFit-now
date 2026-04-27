"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createNativeArBuddyEvent,
  type NativeArBuddyEvent,
  type NativeArBuddyEventType,
} from "@/lib/nativeAr/nativeArTypes";
import {
  emitNativeArBuddyEvent,
  getRecentNativeArBuddyEvents,
  subscribeToNativeArBuddyEvents,
} from "@/lib/nativeAr/nativeArBridge";

const eventLabels: Partial<Record<NativeArBuddyEventType, string>> = {
  onArReady: "AR bereit",
  onPlaneDetected: "Flaeche erkannt",
  onAnchorCreated: "Anker gesetzt",
  onBuddyPlaced: "Buddy platziert",
  onBuddyActionStarted: "Aktion gestartet",
  onBuddyActionCompleted: "Aktion beendet",
  onBuddyActionRejected: "Aktion abgelehnt",
  onBuddyDialogueShown: "Buddy spricht",
  onBuddyMissionSuggested: "Mission empfohlen",
  onBuddyCapabilityNeeded: "Ausrüstung benoetigt",
  onArHintMarkerCreated: "Hinweis markiert",
  onArError: "AR-Fehler",
};

function getEventTone(event: NativeArBuddyEvent) {
  if (event.eventType === "onArError" || event.eventType === "onBuddyActionRejected") {
    return "border-red-300/40 bg-red-500/15 text-red-50";
  }

  if (event.eventType === "onBuddyMissionSuggested" || event.eventType === "onArHintMarkerCreated") {
    return "border-amber-300/40 bg-amber-400/15 text-amber-50";
  }

  if (event.eventType === "onBuddyDialogueShown" || event.eventType === "onBuddyCapabilityNeeded") {
    return "border-cyan-200/40 bg-cyan-400/15 text-cyan-50";
  }

  return "border-white/15 bg-white/10 text-white";
}

function getEventTitle(event: NativeArBuddyEvent) {
  return eventLabels[event.eventType] ?? event.eventType;
}

function getEventDescription(event: NativeArBuddyEvent) {
  const payload = event.payload;

  if (event.eventType === "onBuddyDialogueShown") {
    return payload.messageKey ? `Dialog: ${payload.messageKey}` : "Der Buddy moechte etwas sagen.";
  }

  if (event.eventType === "onBuddyMissionSuggested") {
    return payload.missionId ? `Vorschlag: ${payload.missionId}` : "Der Buddy empfiehlt eine passende Mission.";
  }

  if (event.eventType === "onBuddyCapabilityNeeded") {
    return payload.capabilityId ? `Faehigkeit fehlt: ${payload.capabilityId}` : "Der Buddy braucht eine passende Ausruestung.";
  }

  if (event.eventType === "onArHintMarkerCreated") {
    return payload.markerId ? `Marker: ${payload.markerId}` : "Ein AR-Hinweis wurde markiert.";
  }

  if (event.eventType === "onArError") {
    return payload.message || payload.code || "AR meldet einen Fehler.";
  }

  if (payload.status) return payload.status;
  if (payload.reason) return payload.reason;
  if (payload.ability) return `Aktion: ${payload.ability}`;

  return "Buddy-/AR-Ereignis empfangen.";
}

export default function ArBuddyEventPanel({ cameraActive }: { cameraActive: boolean }) {
  const [events, setEvents] = useState<NativeArBuddyEvent[]>([]);
  const latestEvent = events[0] ?? null;

  useEffect(() => {
    setEvents(getRecentNativeArBuddyEvents());

    return subscribeToNativeArBuddyEvents((event) => {
      setEvents((current) => [event, ...current].slice(0, 5));
    });
  }, []);

  const panelTitle = useMemo(() => {
    if (!cameraActive) return "Buddy wartet";
    if (!latestEvent) return "Buddy ist bereit";
    return getEventTitle(latestEvent);
  }, [cameraActive, latestEvent]);

  const panelDescription = useMemo(() => {
    if (!cameraActive) return "Starte die Kamera, dann kann der Buddy auf AR-/App-Ereignisse reagieren.";
    if (!latestEvent) return "Noch keine Buddy-Events empfangen. Nutze die Test-Buttons fuer die UI-Vorschau.";
    return getEventDescription(latestEvent);
  }, [cameraActive, latestEvent]);

  const emitDemoEvent = async (eventType: NativeArBuddyEventType) => {
    const payloadByType: Partial<Record<NativeArBuddyEventType, NativeArBuddyEvent["payload"]>> = {
      onBuddyDialogueShown: { messageKey: "buddy.demo.ready", status: "shown" },
      onBuddyMissionSuggested: { missionId: "demo_ar_walk_001", reason: "nearby-safe-mission" },
      onBuddyCapabilityNeeded: { capabilityId: "climbUp", reason: "capability-needed" },
      onArHintMarkerCreated: { markerId: "marker_demo_001", markerType: "Clue" },
      onArError: { code: "ar-demo-error", message: "Demo-Fehler: echte AR kommt ueber Unity/ARCore." },
    };

    await emitNativeArBuddyEvent(
      createNativeArBuddyEvent({
        eventType,
        missionId: eventType === "onBuddyMissionSuggested" ? "demo_ar_walk_001" : undefined,
        markerId: eventType === "onArHintMarkerCreated" ? "marker_demo_001" : undefined,
        capabilityId: eventType === "onBuddyCapabilityNeeded" ? "climbUp" : undefined,
        payload: payloadByType[eventType] ?? { status: "demo" },
      })
    );
  };

  return (
    <section className="absolute inset-x-3 bottom-28 z-30 rounded-[28px] border border-white/15 bg-[#042f37]/90 p-4 shadow-[0_18px_48px_rgba(0,0,0,0.35)] backdrop-blur md:left-auto md:right-4 md:w-[360px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100/70">KI-Buddy Event UI</p>
          <h2 className="mt-1 text-lg font-black text-white">{panelTitle}</h2>
          <p className="mt-1 text-sm leading-relaxed text-cyan-50/80">{panelDescription}</p>
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-2 text-xl">🐉</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => emitDemoEvent("onBuddyDialogueShown")}
          className="rounded-full bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/20"
        >
          Dialog
        </button>
        <button
          type="button"
          onClick={() => emitDemoEvent("onBuddyMissionSuggested")}
          className="rounded-full bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/20"
        >
          Mission
        </button>
        <button
          type="button"
          onClick={() => emitDemoEvent("onBuddyCapabilityNeeded")}
          className="rounded-full bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/20"
        >
          Item fehlt
        </button>
        <button
          type="button"
          onClick={() => emitDemoEvent("onArHintMarkerCreated")}
          className="rounded-full bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/20"
        >
          Marker
        </button>
      </div>

      {events.length > 0 && (
        <div className="mt-3 space-y-2">
          {events.slice(0, 3).map((event) => (
            <div key={event.eventId} className={`rounded-2xl border px-3 py-2 text-xs ${getEventTone(event)}`}>
              <div className="flex items-center justify-between gap-2">
                <strong>{getEventTitle(event)}</strong>
                <span className="text-[10px] opacity-70">{new Date(event.clientTimestamp).toLocaleTimeString("de-DE")}</span>
              </div>
              <p className="mt-1 opacity-85">{getEventDescription(event)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
