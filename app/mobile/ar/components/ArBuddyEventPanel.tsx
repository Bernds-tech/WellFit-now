"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buddyKiRemoteProvider } from "@/lib/buddyKi/buddyKiProviderRemote";
import type { BuddyKiContext, BuddyKiIntent, BuddyKiOption, BuddyKiResponse } from "@/lib/buddyKi/buddyKiTypes";
import {
  createNativeArBuddyEvent,
  type NativeArBuddyEvent,
  type NativeArBuddyEventPayload,
  type NativeArBuddyEventType,
} from "@/lib/nativeAr/nativeArTypes";
import {
  emitNativeArBuddyEvent,
  getRecentNativeArBuddyEvents,
  subscribeToNativeArBuddyEvents,
} from "@/lib/nativeAr/nativeArBridge";
import { createBuddyGuideCard, createBuddyGuideOptionEvent } from "../lib/buddyGuideFlow";

type BuddyKiResponseWithMeta = BuddyKiResponse & { meta?: { fallbackReason?: string } };

type ArBuddyEventPanelProps = {
  cameraActive: boolean;
  floating?: boolean;
};

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
  const optionPayload: NativeArBuddyEventPayload = {
    ...(option.payload || {}),
    status: "buddy-ki-option-selected",
    message: option.label,
  };

  return createNativeArBuddyEvent({
    eventType: mapBuddyKiIntentToEventType(option.intent),
    missionId: typeof optionPayload.missionId === "string" ? optionPayload.missionId : currentEvent?.missionId,
    markerId: typeof optionPayload.markerId === "string" ? optionPayload.markerId : currentEvent?.markerId,
    capabilityId: typeof optionPayload.capabilityId === "string" ? optionPayload.capabilityId : currentEvent?.capabilityId,
    itemId: typeof optionPayload.itemId === "string" ? optionPayload.itemId : currentEvent?.itemId,
    payload: optionPayload,
  });
}

function getProviderLabel(response: BuddyKiResponseWithMeta | null, loading: boolean) {
  if (loading) return "Buddy denkt ...";
  if (!response) return "Provider: lokaler Fallback";
  const reason = response.meta?.fallbackReason;
  if (reason === "model-provider-disabled") return "Provider: Backend Rules";
  if (reason === "model-provider-error") return "Provider: Backend Rules nach Fehler";
  return `Provider: ${response.providerMode}`;
}

export default function ArBuddyEventPanel({ cameraActive, floating = true }: ArBuddyEventPanelProps) {
  const [events, setEvents] = useState<NativeArBuddyEvent[]>([]);
  const [buddyKiResponse, setBuddyKiResponse] = useState<BuddyKiResponseWithMeta | null>(null);
  const [isBuddyKiLoading, setIsBuddyKiLoading] = useState(false);
  const activeRequestIdRef = useRef(0);
  const latestEvent = events[0] ?? null;

  useEffect(() => {
    setEvents(getRecentNativeArBuddyEvents());

    return subscribeToNativeArBuddyEvents((event) => {
      setEvents((current) => [event, ...current].slice(0, 5));
    });
  }, []);

  const requestBuddyKiResponse = useCallback(
    async (intent: BuddyKiIntent, context: BuddyKiContext) => {
      const requestId = activeRequestIdRef.current + 1;
      activeRequestIdRef.current = requestId;
      setIsBuddyKiLoading(true);

      try {
        const response = await buddyKiRemoteProvider.generateResponse(intent, context);
        if (activeRequestIdRef.current === requestId) {
          setBuddyKiResponse(response as BuddyKiResponseWithMeta);
        }
      } catch (error) {
        console.warn("Buddy KI panel fallback to local guide flow", error);
        if (activeRequestIdRef.current === requestId) {
          setBuddyKiResponse(null);
        }
      } finally {
        if (activeRequestIdRef.current === requestId) {
          setIsBuddyKiLoading(false);
        }
      }
    },
    []
  );

  const loadBuddyKiResponse = useCallback(
    async (event: NativeArBuddyEvent | null = latestEvent) => {
      const intent = mapEventToBuddyKiIntent(event, cameraActive);
      const context = buildBuddyKiContext(event, cameraActive);
      await requestBuddyKiResponse(intent, context);
    },
    [cameraActive, latestEvent, requestBuddyKiResponse]
  );

  useEffect(() => {
    void loadBuddyKiResponse();
  }, [loadBuddyKiResponse]);

  const guideCard = useMemo(() => createBuddyGuideCard(latestEvent, cameraActive), [latestEvent, cameraActive]);
  const displayTitle = buddyKiResponse?.title || guideCard.title;
  const displayMessage = buddyKiResponse?.message || guideCard.description;
  const providerLabel = getProviderLabel(buddyKiResponse, isBuddyKiLoading);
  const panelPositionClass = floating
    ? "absolute inset-x-3 bottom-28 z-30 md:left-auto md:right-4 md:w-[360px]"
    : "relative z-30 mt-4 max-h-[52vh] overflow-y-auto";

  const handleLocalOptionClick = async (option: Parameters<typeof createBuddyGuideOptionEvent>[0]) => {
    const event = createBuddyGuideOptionEvent(option, latestEvent);
    await emitNativeArBuddyEvent(event);
  };

  const handleBuddyKiOptionClick = async (option: BuddyKiOption) => {
    const event = createEventFromBuddyKiOption(option, latestEvent);
    await emitNativeArBuddyEvent(event);

    const context = buildBuddyKiContext(event, cameraActive);
    await requestBuddyKiResponse(option.intent, context);
  };

  const emitDemoEvent = async (eventType: NativeArBuddyEventType) => {
    await emitNativeArBuddyEvent(
      createNativeArBuddyEvent({
        eventType,
        payload: { status: "demo", rewardStatus: "preview-only" },
      })
    );
  };

  return (
    <section className={`${panelPositionClass} rounded-[28px] border border-white/15 bg-[#042f37]/90 p-4 shadow-[0_18px_48px_rgba(0,0,0,0.35)] backdrop-blur`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100/70">KI-Buddy Guide</p>
          <h2 className="mt-1 text-lg font-black text-white">{displayTitle}</h2>
          <p className="mt-1 text-sm leading-relaxed text-cyan-50/80">{displayMessage}</p>
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/50">
            {providerLabel}
          </p>
          {buddyKiResponse?.meta?.fallbackReason && (
            <p className="mt-1 text-[10px] text-cyan-100/45">Fallback: {buddyKiResponse.meta.fallbackReason}</p>
          )}
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-2 text-xl">🐉</div>
      </div>

      <div className="mt-3 rounded-2xl border border-emerald-200/10 bg-emerald-300/10 px-3 py-2 text-[10px] font-bold leading-relaxed text-emerald-50/75">
        Sicherheitsstatus: AR-Events sind nur Preview/Evidence. Keine Punkte, keine Rewards, keine Mission-Completion im Mobile-Client.
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
        <button onClick={() => loadBuddyKiResponse()} className="rounded-full bg-cyan-300/20 px-3 py-2 text-xs font-black text-cyan-50">Backend neu laden</button>
      </div>
    </section>
  );
}
