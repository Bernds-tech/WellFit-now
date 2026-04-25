"use client";

import { useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import AppSidebar from "@/app/AppSidebar";
import { auth } from "@/lib/firebase";
import { useDashboardUser } from "@/app/dashboard/hooks/useDashboardUser";
import BuddyEvolution from "./components/BuddyEvolution";
import BuddyHero from "./components/BuddyHero";
import BuddyMainGrid from "./components/BuddyMainGrid";
import BuddyPageHeader from "./components/BuddyPageHeader";
import BuddyStats from "./components/BuddyStats";
import { getBuddyStory } from "./lib/buddyCopy";
import { useBuddyState } from "./hooks/useBuddyState";

export default function BuddyPage() {
  const { user, message, setMessage, isRealtimeConnected, loadedFromCache } = useDashboardUser();
  const [brightness, setBrightness] = useState(100);
  const { buddy, actions, buddyMessage, isSavingBuddy, handleBuddyAction } = useBuddyState(user);

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

  return (
    <main
      className="h-screen w-screen overflow-hidden text-white"
      style={{
        background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))`,
      }}
    >
      <div className="flex h-full">
        <AppSidebar brightness={brightness} onBrightnessChange={setBrightness} onLogout={handleLogout} />

        <section className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5 md:px-7">
          <BuddyPageHeader
            hasUser={!!user}
            fallbackMessage={message}
            isRealtimeConnected={isRealtimeConnected}
            loadedFromCache={loadedFromCache}
            isSavingBuddy={isSavingBuddy}
          />

          <BuddyHero buddy={buddy} />
          <BuddyStats buddy={buddy} />
          <BuddyMainGrid
            buddy={buddy}
            actions={actions}
            story={story}
            buddyMessage={buddyMessage}
            onAction={handleBuddyAction}
          />
          <BuddyEvolution buddy={buddy} />
        </section>
      </div>
    </main>
  );
}
