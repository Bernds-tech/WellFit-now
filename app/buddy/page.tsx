"use client";

import { useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import AppSidebar from "@/app/AppSidebar";
import { auth } from "@/lib/firebase";
import { useDashboardUser } from "@/app/dashboard/hooks/useDashboardUser";
import BuddyActions from "./components/BuddyActions";
import BuddyEvolution from "./components/BuddyEvolution";
import BuddyFutureModules from "./components/BuddyFutureModules";
import BuddyHero from "./components/BuddyHero";
import BuddyHomePanel from "./components/BuddyHomePanel";
import BuddyStats from "./components/BuddyStats";
import BuddyStoryBox from "./components/BuddyStoryBox";
import { buddyEconomyNotice } from "./lib/buddyEconomy";
import { getBuddyActions, getBuddyStory } from "./lib/buddyCopy";
import { createBuddyStateFromUser } from "./lib/buddyState";
import type { BuddyAction } from "./types";

export default function BuddyPage() {
  const { user, message, setMessage, isRealtimeConnected, loadedFromCache } = useDashboardUser();
  const [brightness, setBrightness] = useState(100);
  const [localMessage, setLocalMessage] = useState("Flammi wird vorbereitet...");

  const buddy = useMemo(() => createBuddyStateFromUser(user), [user]);
  const actions = useMemo(() => getBuddyActions(buddy), [buddy]);
  const story = useMemo(() => getBuddyStory(buddy), [buddy]);

  const handleLogout = async () => {
    try {
      setMessage("Du wirst abgemeldet...");
      await signOut(auth);
      window.location.href = "/";
    } catch {
      setMessage("Abmelden fehlgeschlagen. Bitte erneut versuchen.");
    }
  };

  const handleBuddyAction = (action: BuddyAction) => {
    if (action.disabled) {
      setLocalMessage(`${action.label} ist gerade nicht möglich.`);
      return;
    }

    if (action.type === "search") {
      setLocalMessage("Die AR-Rückholsuche wird in Phase 3 aktiviert. Die Mechanik ist vorbereitet.");
      return;
    }

    setLocalMessage(`${action.label} ausgeführt. ${buddyEconomyNotice}`);
  };

  return (
    <main
      className="h-screen w-screen overflow-hidden text-white"
      style={{
        background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))`,
      }}
    >
      <div className="flex h-full">
        <AppSidebar brightness={brightness} onBrightnessChange={setBrightness} onLogout={handleLogout} />

        <section className="flex flex-1 flex-col gap-4 overflow-y-auto px-7 py-5">
          <header className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-5xl font-extrabold leading-none">Mein KI-Buddy</h1>
              <p className="mt-2 text-lg text-cyan-100/90">{user ? "Dein lebendiger WellFit-Begleiter" : message}</p>
              <p className={`mt-1 text-xs font-semibold ${isRealtimeConnected ? "text-green-300" : "text-yellow-200"}`}>
                Realtime: {isRealtimeConnected ? "verbunden" : loadedFromCache ? "Cache aktiv" : "wird verbunden"}
              </p>
            </div>
            <div className="rounded-full bg-[#073b44] px-4 py-2 text-sm font-semibold text-cyan-100">
              Phase 1 MVP
            </div>
          </header>

          <BuddyHero buddy={buddy} />
          <BuddyStats buddy={buddy} />

          <div className="grid grid-cols-[1.25fr_0.75fr] gap-4">
            <div className="space-y-4">
              <BuddyStoryBox story={story} message={localMessage} />
              <BuddyFutureModules />
            </div>
            <div className="space-y-4">
              <BuddyActions actions={actions} onAction={handleBuddyAction} />
              <BuddyHomePanel buddy={buddy} />
            </div>
          </div>

          <BuddyEvolution buddy={buddy} />
        </section>
      </div>
    </main>
  );
}
