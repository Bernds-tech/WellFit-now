"use client";

import { useMemo, useState } from "react";
import MobileBottomNav from "../components/MobileBottomNav";
import { useDashboardUser } from "@/app/dashboard/hooks/useDashboardUser";
import { useBuddyState } from "@/app/buddy/hooks/useBuddyState";
import { getBuddyStatusLabel, getBuddyStory } from "@/app/buddy/lib/buddyCopy";
import type { BuddyAction } from "@/app/buddy/types";

export default function MobileBuddyPage() {
  const { user, message } = useDashboardUser();
  const { buddy, actions, buddyMessage, isSavingBuddy, handleBuddyAction } = useBuddyState(user);
  const [localMessage, setLocalMessage] = useState("Flammi ist in der mobilen Testansicht.");
  const story = useMemo(() => getBuddyStory(buddy), [buddy]);
  const visibleActions = actions.filter((action) => ["feed", "care", "play", "clean"].includes(action.type));

  const runAction = async (action: BuddyAction) => {
    setLocalMessage(`${action.label} wird ausgeführt...`);
    await handleBuddyAction(action);
    setLocalMessage(`${action.label} ausgeführt.`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#00aabe] to-[#00505a] pb-24 text-white">
      <section className="px-4 pt-4">
        <div className="rounded-[30px] bg-[#04343b] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100/55">Mobile Buddy</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="grid h-24 w-24 place-items-center rounded-[26px] bg-cyan-100/10 text-5xl">🐉</div>
            <div>
              <h1 className="text-4xl font-black leading-none">{buddy.name}</h1>
              <p className="mt-2 text-sm font-bold text-cyan-100/70">{user ? getBuddyStatusLabel(buddy) : message}</p>
              <p className="mt-1 text-xs text-yellow-200">{isSavingBuddy ? "Speichert..." : `Level ${buddy.level} · ${buddy.points} Punkte`}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-cyan-100/75">{story}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-2xl bg-[#053841]/90 p-3">
            <p className="text-2xl font-black text-cyan-200">{buddy.hunger}%</p>
            <p className="text-xs text-white/55">Hunger</p>
          </div>
          <div className="rounded-2xl bg-[#053841]/90 p-3">
            <p className="text-2xl font-black text-cyan-200">{buddy.mood}%</p>
            <p className="text-xs text-white/55">Stimmung</p>
          </div>
          <div className="rounded-2xl bg-[#053841]/90 p-3">
            <p className="text-2xl font-black text-cyan-200">{buddy.energy}%</p>
            <p className="text-xs text-white/55">Energie</p>
          </div>
          <div className="rounded-2xl bg-[#053841]/90 p-3">
            <p className="text-2xl font-black text-cyan-200">{buddy.bond}%</p>
            <p className="text-xs text-white/55">Bindung</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {visibleActions.map((action) => (
            <button
              key={action.type}
              type="button"
              onClick={() => runAction(action)}
              disabled={action.disabled || isSavingBuddy}
              className="rounded-[22px] bg-orange-400 p-4 text-left text-[#042f35] shadow-[0_8px_22px_rgba(0,0,0,0.14)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-lg font-black">{action.label}</span>
                <span className="text-xs font-black">{action.cost > 0 ? `${action.cost} P` : "frei"}</span>
              </div>
              <p className="mt-1 text-sm font-semibold opacity-80">{action.description}</p>
            </button>
          ))}
        </div>

        <p className="mt-4 rounded-2xl bg-[#04343b]/80 p-3 text-xs font-semibold leading-relaxed text-cyan-100/75">
          {buddyMessage || localMessage}
        </p>
      </section>

      <MobileBottomNav activeTab="buddy" />
    </main>
  );
}
