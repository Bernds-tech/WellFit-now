"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { economyConfig, getPriceRate } from "@/config/economy";
import { signOut } from "firebase/auth";

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

  const cardClass = "rounded-[22px] bg-[#053841]/85 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.12)]";

  return (
    <main className="h-screen w-screen overflow-hidden text-white">
      <div className="flex h-full items-center justify-center text-xl">
        Dashboard Refactor Schritt 1 erfolgreich
      </div>
    </main>
  );
}
