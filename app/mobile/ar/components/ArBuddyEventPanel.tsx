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
import { createBuddyGuideCard, createBuddyGuideOptionEvent } from "../lib/buddyGuideFlow";

export default function ArBuddyEventPanel({ cameraActive }: { cameraActive: boolean }) {
  const [events, setEvents] = useState<NativeArBuddyEvent[]>([]);
  const latestEvent = events[0] ?? null;

  useEffect(() => {
    setEvents(getRecentNativeArBuddyEvents());

    return subscribeToNativeArBuddyEvents((event) => {
      setEvents((current) => [event, ...current].slice(0, 5));
    });
  }, []);

  const guideCard = useMemo(() => createBuddyGuideCard(latestEvent, cameraActive), [latestEvent, cameraActive]);

  const handleOptionClick = async (option: any) => {
    const event = createBuddyGuideOptionEvent(option, latestEvent);
    await emitNativeArBuddyEvent(event);
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
          <h2 className="mt-1 text-lg font-black text-white">{guideCard.title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-cyan-50/80">{guideCard.description}</p>
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-2 text-xl">🐉</div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {guideCard.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option)}
            className="rounded-full bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/20"
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => emitDemoEvent("onBuddyDialogueShown")} className="rounded-full bg-white/10 px-3 py-2 text-xs text-white">Dialog</button>
        <button onClick={() => emitDemoEvent("onBuddyMissionSuggested")} className="rounded-full bg-white/10 px-3 py-2 text-xs text-white">Mission</button>
        <button onClick={() => emitDemoEvent("onBuddyCapabilityNeeded")} className="rounded-full bg-white/10 px-3 py-2 text-xs text-white">Item fehlt</button>
      </div>
    </section>
  );
}
