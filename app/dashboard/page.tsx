"use client";

import React, { useEffect, useMemo, useState } from "react";
import { economyConfig, getPriceRate } from "@/config/economy";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

import AppSidebar from "@/app/AppSidebar";
import DashboardHeader from "./components/DashboardHeader";
import DashboardMissionPanel from "./components/DashboardMissionPanel";
import DashboardCards from "./components/DashboardCards";
import DashboardAvatarPanel from "./components/DashboardAvatarPanel";
import { useDashboardUser } from "./hooks/useDashboardUser";
import { useDashboardActions } from "./hooks/useDashboardActions";
import { getPersonalMission } from "./lib/personalMission";

export default function DashboardPage() {
  const {
    user,
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
      await signOut(auth);
      window.location.href = "/";
    } catch {
      setMessage("Abmelden fehlgeschlagen. Bitte erneut versuchen.");
    }
  };

  const { handleStartMission, handleFeedBuddy } = useDashboardActions({
    user,
    mission,
    pointsBalance,
    stepsToday,
    buddyEnergy,
    buddyHunger,
    buddyLevel,
    foodPrice,
    setMessage,
    setPointsBalance,
    setStepsToday,
    setBuddyEnergy,
    setBuddyHunger,
    setBuddyLevel,
  });

  return (
    <main
      className="h-screen w-screen overflow-hidden text-white"
      style={{
        background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))`,
      }}
    >
      <div className="flex h-full">
        <AppSidebar
          brightness={brightness}
          onBrightnessChange={setBrightness}
          onLogout={handleLogout}
        />

        <section className="flex flex-1 flex-col gap-4 overflow-y-auto px-7 py-5">
          <DashboardHeader
            message={message}
            isRealtimeConnected={isRealtimeConnected}
            loadedFromCache={loadedFromCache}
            isLoadingUser={isLoadingUser}
            hasUser={!!user}
            buddyLevel={buddyLevel}
          />

          {mission && (
            <DashboardMissionPanel
              mission={mission}
              stepsToday={stepsToday}
              onStartMission={handleStartMission}
            />
          )}

          <DashboardAvatarPanel
            buddyLevel={buddyLevel}
            buddyEnergy={buddyEnergy}
            buddyHunger={buddyHunger}
            pointsBalance={pointsBalance}
            foodPrice={foodPrice}
            onFeedBuddy={handleFeedBuddy}
          />

          {mission && (
            <DashboardCards
              mission={mission}
              pointsBalance={pointsBalance}
              buddyEnergy={buddyEnergy}
              buddyHunger={buddyHunger}
              stepsToday={stepsToday}
              foodPrice={foodPrice}
              onFeedBuddy={handleFeedBuddy}
            />
          )}
        </section>
      </div>
    </main>
  );
}
