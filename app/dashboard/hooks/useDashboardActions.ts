"use client";

import type { User } from "@/types/user";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import type { DashboardMissionPreview, PersonalMission } from "../types";
import { writeCachedUser } from "../lib/dashboardUser";

type Params = {
  user: User | null;
  mission: PersonalMission;
  missionPreview?: DashboardMissionPreview;
  pointsBalance: number;
  stepsToday: number;
  buddyEnergy: number;
  buddyHunger: number;
  buddyLevel: number;
  foodPrice: number;
  setMessage: (message: string) => void;
  setPointsBalance: (value: number | ((prev: number) => number)) => void;
  setStepsToday: (value: number | ((prev: number) => number)) => void;
  setBuddyEnergy: (value: number | ((prev: number) => number)) => void;
  setBuddyHunger: (value: number | ((prev: number) => number)) => void;
  setBuddyLevel: (value: number | ((prev: number) => number)) => void;
};

export function useDashboardActions({
  user,
  mission,
  missionPreview,
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
}: Params) {
  const persistUserPatch = async (
    patch: Record<string, unknown>,
    successMessage: string,
    errorMessage: string
  ) => {
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
    } as User;

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

    if (missionPreview?.decision.status === "blocked") {
      setMessage("Mission ist aktuell durch interne Beta-Limits blockiert.");
      return;
    }

    if (missionPreview?.decision.status === "manual_review") {
      setMessage("Mission wurde fuer Review vorgemerkt. Finale Punkte bleiben serverseitig.");
      return;
    }

    const previewPoints = missionPreview?.decision.cappedPoints ?? mission.reward;
    const newSteps = stepsToday + mission.steps;
    const newPoints = pointsBalance + previewPoints;
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
        xp: (user.xp ?? 0) + previewPoints,
        stepsToday: newSteps,
        level: Math.max(user.level ?? 1, nextLevel),
        avatar: {
          ...(user.avatar ?? {}),
          level: nextLevel,
          energy: newEnergy,
          hunger: newHunger,
        },
      },
      `Mission gestartet: +${mission.steps} Schritte, +${previewPoints} interne Punkte`,
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

  return { handleStartMission, handleFeedBuddy };
}
