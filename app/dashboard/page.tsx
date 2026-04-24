"use client";

import React, { useEffect, useMemo, useState } from "react";
import { economyConfig, getPriceRate } from "@/config/economy";
import { signOut } from "firebase/auth";

import AppSidebar from "@/app/AppSidebar";
import DashboardHeader from "./components/DashboardHeader";
import DashboardMissionPanel from "./components/DashboardMissionPanel";
import DashboardCards from "./components/DashboardCards";
import { useDashboardUser } from "./hooks/useDashboardUser";
import { getPersonalMission } from "./lib/personalMission";

export default function DashboardPage() {
  const {
    user,
    setUser,
    isLoadingUser,
    message,
    setMessage,
    loadedFromCache,
    isRealtimeConnected,
  } = useDashboardUser();

  const [brightness, setBrightness] = useState(100);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [buddyLevel, setBuddyLevel] = useState(1);
  const [stepsToday, setStepsToday] = useState(0);
  const [buddyEnergy, setBuddyEnergy] = useState(100);
  const [buddyHunger, setBuddyHunger] = useState(100);
  const [trackingActive, setTrackingActive] = useState(false);
  const [permissions, setPermissions] = useState({ location: false });
  const [foodPrice, setFoodPrice] = useState(5);

  const mission = useMemo(() => getPersonalMission(user), [user]);

  useEffect(() => {
    if (!user) return;
    setPointsBalance(user.points ?? 0);
    setBuddyEnergy(user.avatar?.energy ?? 100);
    setBuddyHunger(user.avatar?.hunger ?? 100);
    setBuddyLevel(user.avatar?.level ?? user.level ?? 1);
    setStepsToday(user.stepsToday ?? 0);
  }, [user]);

  useEffect(() => {
    const priceRate = getPriceRate(economyConfig.reserve, economyConfig.totalSupply);
    setFoodPrice(Math.round(economyConfig.baseFoodPrice * priceRate));
  }, []);

  const handleLogout = async () => {
    try {
      setMessage("Du wirst abgemeldet...");
      await signOut();
      window.location.href = "/";
    } catch {
      setMessage("Abmelden fehlgeschlagen. Bitte erneut versuchen.");
    }
  };

  return (
    <main className="h-screen w-screen overflow-hidden text-white">
      <div className="flex h-full">
        <AppSidebar brightness={brightness} onBrightnessChange={setBrightness} />

        <section className="flex flex-1 flex-col px-7 py-5 gap-4 overflow-y-auto">
          <DashboardHeader
            message={message}
            isRealtimeConnected={isRealtimeConnected}
            loadedFromCache={loadedFromCache}
            isLoadingUser={isLoadingUser}
            hasUser={!!user}
            buddyLevel={buddyLevel}
          />

          {mission && (
            <DashboardMissionPanel mission={mission} stepsToday={stepsToday} />
          )}

          {mission && (
            <DashboardCards
              mission={mission}
              pointsBalance={pointsBalance}
              buddyEnergy={buddyEnergy}
              buddyHunger={buddyHunger}
              stepsToday={stepsToday}
              foodPrice={foodPrice}
            />
          )}
        </section>
      </div>
    </main>
  );
}
