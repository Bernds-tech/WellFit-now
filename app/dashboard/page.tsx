"use client";

import React, { useEffect, useMemo, useState } from "react";
import { economyConfig, getPriceRate } from "@/config/economy";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import AppSidebar from "@/app/AppSidebar";
import DashboardHeader from "./components/DashboardHeader";
import DashboardMissionPanel from "./components/DashboardMissionPanel";
import DashboardCards from "./components/DashboardCards";
import DashboardAvatarPanel from "./components/DashboardAvatarPanel";
import { useDashboardUser } from "./hooks/useDashboardUser";
import { getPersonalMission } from "./lib/personalMission";
import { writeCachedUser } from "./lib/dashboardUser";

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

  const persistUserPatch = async (patch: Record<string, unknown>, successMessage: string, errorMessage: string) => {
    if (!user) {
      setMessage("Bitte warte, bis dein WellFit Profil geladen ist.");
      return false;
    }

    const updatedUser = {
      ...user,
      ...patch,
      avatar: {
        ...user.avatar,
        ...((patch.avatar as Record<string, unknown> | undefined) ?? {}),
      },
    };

    writeCachedUser(updatedUser);

    try {
      await setDoc(
        doc(db, "users", user.id),
        {
          ...patch,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setMessage(successMessage);
      return true;
    } catch {
      setMessage(errorMessage);
      return false;
    }
  };

  const handleStartMission = async () => {
    if (!user) {
      setMessage("Bitte warte, bis dein WellFit Profil geladen ist.");
      return;
    }

    const newSteps = stepsToday + mission.steps;
    const newPoints = pointsBalance + mission.reward;
    const newEnergy = Math.max(buddyEnergy - 6, 0);
    const newHunger = Math.max(buddyHunger - 4, 0);
    const nextLevel = newPoints >= 150 && buddyLevel === 1 ? 2 : buddyLevel;

    setStepsToday(newSteps);
    setPointsBalance(newPoints);
    setBuddyEnergy(newEnergy);
    setBuddyHunger(newHunger);
    setBuddyLevel(nextLevel);

    await persistUserPatch(
      {
        points: newPoints,
        xp: (user.xp ?? 0) + mission.reward,
        stepsToday: newSteps,
        level: Math.max(user.level ?? 1, nextLevel),
        avatar: {
          ...(user.avatar ?? {}),
          level: nextLevel,
          energy: newEnergy,
          hunger: newHunger,
        },
      },
      `Mission gestartet: +${mission.steps} Schritte, +${mission.reward} Punkte`,
      "Mission lokal aktualisiert, Firebase konnte nicht gespeichert werden."
    );
  };

  const handleFeedBuddy = async () => {
    if (!user) {
      setMessage("Bitte warte, bis dein WellFit Profil geladen ist.");
      return;
    }

    if (pointsBalance < foodPrice) {
      setMessage("Nicht genug Punkte für Futter.");
      return;
    }

    const newPoints = Math.max(0, pointsBalance - foodPrice);
    const newHunger = Math.min(100, buddyHunger + 10);

    setPointsBalance(newPoints);
    setBuddyHunger(newHunger);

    await persistUserPatch(
      {
        points: newPoints,
        avatar: {
          ...(user.avatar ?? {}),
          hunger: newHunger,
        },
      },
      `Flammi wurde gefüttert. -${foodPrice} Punkte`,
      "Flammi wurde lokal gefüttert, Firebase konnte nicht gespeichert werden."
    );
  };

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
