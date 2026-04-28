"use client";

import { useEffect, useMemo, useState } from "react";
import { buddyKiRemoteProvider } from "@/lib/buddyKi/buddyKiProviderRemote";
import type { BuddyKiContext, BuddyKiIntent, BuddyKiOption, BuddyKiResponse } from "@/lib/buddyKi/buddyKiTypes";
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
import { createBuddyGuideCard, createBuddyGuideOptionEvent } from "../lib/buddyGuideFlow";

function mapEventToBuddyKiIntent(event: NativeArBuddyEvent | null, cameraActive: boolean): BuddyKiIntent {
  if (!cameraActive) return "welcome";
  if (!event) return "welcome";

  switch (event.eventType) {
    case "onBuddyMissionSuggested":
      return "suggestMission";
    case "onBuddyCapabilityNeeded":
    case "onBuddyActionRejected":
      return "explainMissingCapability";
    case "onArHintMarkerCreated":
    case "onArHintMarkerFocused":
      return "arHint";
    case "onBuddyActionStarted":
    case "onBuddyActionCompleted":
    case "onArHintMarkerResolved":
      return "missionProgress";
    case "onBuddyDialogueShown":
      return "explainMenu";
    case "onArError":
      return "errorHelp";
    default:
      return "welcome";
  }
}

function buildBuddyKiContext(event: NativeArBuddyEvent | null, cameraActive: boolean): BuddyKiContext {
  return {
    language: "de",
    buddyId: "flammi-demo",
    currentMissionId: event?.payload.missionId || event?.missionId,
    currentMissionType: "arRiddle",
    currentRoute: "/mobile/ar",
    ageBand: "adult",
    parentMode: false,
    inventoryCapabilityIds: [],
    missingCapabilityId: event?.payload.capabilityId || event?.capabilityId,
    markerId: event?.payload.markerId || event?.markerId,
    riskLevel: event?.eventType === "onArError" ? "medium" : "low",
    cameraActive,
  };
}

function mapBuddyKiIntentToEventType(intent: BuddyKiIntent): NativeArBuddyEventType {
  switch (intent) {
    case "suggestMission":
      return "onBuddyMissionSuggested";
    case "explainMissingCapability":
    case "safeDetour":
      return "onBuddyCapabilityNeeded";
    case "arHint":
      return "onArHintMarkerCreated";
    case "missionProgress":
    case "celebrate":
      return "onBuddyActionStarted";
    case "errorHelp":
      return "onArError";
    case "explainMenu":
    case "welcome":
    default:
      return "onBuddyDialogueShown";
  }
}

function createEventFromBuddyKiOption(option: BuddyKiOption, currentEvent: NativeArBuddyEvent | null) {
  const payload = {
    ...(option.payload || {}),
    status: "buddy-ki-option-selected",
    optionId: option.id,
    label: option.label,
  };

  return createNativeArBuddyEvent({
    eventType: mapBuddyKiIntentToEventType(option.intent),
    missionId: typeof payload.missionId === "string" ? payload.missionId : currentEvent?.missionId,
    markerId: typeof payload.markerId === "string" ? payload.markerId : currentEvent?.markerId,
    capabilityId: typeof payload.capabilityId === "string" ? payload.capabilityId : currentEvent?.capabilityId,
    itemId: typeof payload.itemId === "string" ? payload.itemId : currentEvent?.itemId,
    payload,
  });
}

export default function ArBuddyEventPanel({ cameraActive }: { cameraActive: boolean }) {
  const [events, setEvents] = useState<NativeArBuddyEvent[]>([]);
  const [buddyKiResponse, setBuddyKiResponse] = useState<BuddyKiResponse | null>(null);
  const [isBuddyKiLoading, setIsBuddyKiLoading] = useState(false);
  const latestEvent = events[0] ?? null;

  useEffect(() => {
    setEvents(getRecentNativeArBuddyEvents());

    return subscribeToNativeArBuddyEvents((event) => {
      setEvents((current) => [event, ...current].slice(0, 5));
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBuddyKiResponse() {
      setIsBuddyKiLoading(true);
      const intent = mapEventToBuddyKiIntent(latestEvent, cameraActive);
      const context = buildBuddyKiContext(latestEvent, cameraActive);

      try {
        const response = await buddyKiRemoteProvider.generateResponse(intent, context);
        if (!cancelled) {
          setBuddyKiResponse(response);
        }
      } catch (error) {
        console.warn("Buddy KI panel fallback to local guide flow", error);
        if (!cancelled) {
          setBuddyKiResponse(null);
        }
      } finally {
        if (!cancelled) {
          setIsBuddyKiLoading(false);
        }
      }
    }

    loadBuddyKiResponse();

    return () => {
      cancelled = true;
    };
  }, [cameraActive, latestEvent]);

  const guideCard = useMemo(() => createBuddyGuideCard(latestEvent, cameraActive), [latestEvent, cameraActive]);
  const displayTitle = buddyKiResponse?.title || guideCard.title;
  const displayMessage = buddyKiResponse?.message || guideCard.description;
  const providerMode = buddyKiResponse?.providerMode || "rules";

  const handleLocalOptionClick = async (option: Parameters<typeof createBuddyGuideOptionEvent>[0]) => {
    const event = createBuddyGuideOptionEvent(option, latestEvent);
    await emitNativeArBuddyEvent(event);
  };

  const handleBuddyKiOptionClick = async (option: BuddyKiOption) => {
    const event = createEventFromBuddyKiOption(option, latestEvent);
    await emitNativeArBuddyEvent(event);

    const context = buildBuddyKiContext(event, cameraActive);
    const response = await buddyKiRemoteProvider.generateResponse(option.intent, context);
    setBuddyKiResponse(response);
  };

  const emitDemoEvent = async (eventType: NativeArBuddyEventType) => {
    await emitNativeArBuddyEvent(
      createNativeArBuddyEvent({
        eventType,
        payload: { status: "demo" },
      })
    );
  };

  return (
    <section className="absolute inset-x-3 bottom-28 z-30 rounded-[28px] border border-white/15 bg-[#042f37]/90 p-4 shadow-[0_18px_48px_rgba(0,0,0,0.35)] backdrop-blur md:left-auto md:right-4 md:w-[360px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100/70">KI-Buddy Guide</p>
          <h2 className="mt-1 text-lg font-black text-white">{displayTitle}</h2>
          <p className="mt-1 text-sm leading-relaxed text-cyan-50/80">{displayMessage}</p>
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/50">
            {isBuddyKiLoading ? "Buddy denkt ..." : `Provider: ${providerMode}`}
          </p>
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-2 text-xl">🐉</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {buddyKiResponse?.options.length ? (
          buddyKiResponse.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleBuddyKiOptionClick(option)}
              className="rounded-full bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/20"
            >
              {option.label}
            </button>
          ))
        ) : (
          guideCard.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleLocalOptionClick(option)}
              className="rounded-full bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/20"
            >
              {option.label}
            </button>
          ))
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => emitDemoEvent("onBuddyDialogueShown")} className="rounded-full bg-white/10 px-3 py-2 text-xs text-white">Dialog</button>
        <button onClick={() => emitDemoEvent("onBuddyMissionSuggested")} className="rounded-full bg-white/10 px-3 py-2 text-xs text-white">Mission</button>
        <button onClick={() => emitDemoEvent("onBuddyCapabilityNeeded")} className="rounded-full bg-white/10 px-3 py-2 text-xs text-white">Item fehlt</button>
      </div>
    </section>
  );
}
