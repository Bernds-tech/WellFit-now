"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@/types/user";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import type { BuddyAction, BuddyState } from "../types";
import { getBuddyActions } from "../lib/buddyCopy";
import { buddyEconomyNotice } from "../lib/buddyEconomy";
import { createBuddyStateFromUser, getBuddyDailyMode, getBuddyStatus } from "../lib/buddyState";

const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max);

type BuddyPatch = Partial<Pick<BuddyState, "energy" | "hunger" | "mood" | "cleanliness" | "bond" | "loyalty" | "curiosity" | "points">>;

function applyBuddyPatch(previous: BuddyState, patch: BuddyPatch): BuddyState {
  const nextBase = {
    ...previous,
    ...patch,
    energy: clamp(patch.energy ?? previous.energy),
    hunger: clamp(patch.hunger ?? previous.hunger),
    mood: clamp(patch.mood ?? previous.mood),
    cleanliness: clamp(patch.cleanliness ?? previous.cleanliness),
    bond: clamp(patch.bond ?? previous.bond),
    loyalty: clamp(patch.loyalty ?? previous.loyalty),
    curiosity: clamp(patch.curiosity ?? previous.curiosity),
    points: Math.max(0, patch.points ?? previous.points),
  };

  const status = getBuddyStatus(nextBase);
  const dailyMode = getBuddyDailyMode(nextBase);
  return { ...nextBase, status, dailyMode };
}

function getActionPatch(buddy: BuddyState, action: BuddyAction): BuddyPatch {
  const points = Math.max(0, buddy.points - action.cost);

  switch (action.type) {
    case "feed":
      return {
        points,
        hunger: buddy.hunger + 14,
        mood: buddy.mood + 4,
        bond: buddy.bond + 2,
        loyalty: buddy.loyalty + 1,
      };
    case "care":
      return {
        points,
        cleanliness: buddy.cleanliness + 18,
        mood: buddy.mood + 3,
        bond: buddy.bond + 4,
        loyalty: buddy.loyalty + 2,
      };
    case "play":
      return {
        points,
        energy: buddy.energy - 4,
        mood: buddy.mood + 10,
        bond: buddy.bond + 5,
        curiosity: buddy.curiosity + 5,
      };
    case "clean":
      return {
        points,
        cleanliness: buddy.cleanliness + 28,
        mood: buddy.mood + 2,
        bond: buddy.bond + 3,
        loyalty: buddy.loyalty + 3,
      };
    case "call":
      return {
        mood: buddy.mood + 3,
        bond: buddy.bond + 2,
        loyalty: buddy.loyalty + 2,
      };
    case "search":
      return {
        curiosity: buddy.curiosity + 4,
        loyalty: buddy.loyalty + 1,
      };
    default:
      return {};
  }
}

export function useBuddyState(user: User | null) {
  const [buddy, setBuddy] = useState<BuddyState>(() => createBuddyStateFromUser(user));
  const [buddyMessage, setBuddyMessage] = useState("Flammi wird vorbereitet...");
  const [isSavingBuddy, setIsSavingBuddy] = useState(false);

  useEffect(() => {
    setBuddy(createBuddyStateFromUser(user));
    if (user) setBuddyMessage("Flammi ist bereit. Wähle eine Aktion oder prüfe seinen Zustand.");
  }, [user]);

  const actions = useMemo(() => getBuddyActions(buddy), [buddy]);

  const persistBuddy = async (nextBuddy: BuddyState) => {
    if (!user) return false;

    setIsSavingBuddy(true);
    try {
      await setDoc(
        doc(db, "users", user.id),
        {
          points: nextBuddy.points,
          avatar: {
            ...(user.avatar ?? {}),
            energy: nextBuddy.energy,
            hunger: nextBuddy.hunger,
            mood: nextBuddy.mood,
            level: nextBuddy.level,
            cleanliness: nextBuddy.cleanliness,
            bond: nextBuddy.bond,
            loyalty: nextBuddy.loyalty,
            curiosity: nextBuddy.curiosity,
            status: nextBuddy.status,
            dailyMode: nextBuddy.dailyMode,
          },
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return true;
    } catch {
      return false;
    } finally {
      setIsSavingBuddy(false);
    }
  };

  const handleBuddyAction = async (action: BuddyAction) => {
    if (!user) {
      setBuddyMessage("Bitte warte, bis dein WellFit-Profil geladen ist.");
      return;
    }

    if (action.disabled) {
      setBuddyMessage(`${action.label} ist gerade nicht möglich.`);
      return;
    }

    if (action.type === "search" && buddy.status !== "ranAway") {
      setBuddyMessage("Die AR-Rückholsuche wird aktiv, sobald Flammi wirklich auf Abenteuer ist.");
      return;
    }

    const nextBuddy = applyBuddyPatch(buddy, getActionPatch(buddy, action));
    setBuddy(nextBuddy);

    const saved = await persistBuddy(nextBuddy);
    setBuddyMessage(
      saved
        ? `${action.label} ausgeführt. ${buddyEconomyNotice}`
        : `${action.label} lokal ausgeführt. Firebase konnte gerade nicht synchronisieren.`
    );
  };

  return {
    buddy,
    actions,
    buddyMessage,
    isSavingBuddy,
    handleBuddyAction,
  };
}
