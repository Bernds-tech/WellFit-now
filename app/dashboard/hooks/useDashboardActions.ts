"use client";

import { useState } from "react";
import type { User } from "@/types/user";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { submitDashboardMissionForReview } from "@/lib/beta1/clientMissionCommands";
import type { DashboardMissionPreview, PersonalMission } from "../types";
import { writeCachedUser } from "../lib/dashboardUser";
import { fetchDashboardSpendPreview } from "../lib/serverPreviewApi";

type Params = {
  user: User | null;
  mission: PersonalMission;
  missionPreview?: DashboardMissionPreview;
  pointsBalance: number;
  buddyHunger: number;
  foodPrice: number;
  setMessage: (message: string) => void;
  setPointsBalance: (value: number | ((prev: number) => number)) => void;
  setBuddyHunger: (value: number | ((prev: number) => number)) => void;
};

const createTemporaryEconomyBridgeMeta = (action: "buddy_food_sink") => ({
  action,
  bridgeMode: "temporary_client_projection",
  finalAuthority: false,
  tokenized: false,
  serverTarget: "server_completion_to_ledger_to_projection",
  rulesHardeningTarget: "remove_client_points_xp_level_avatar_authority",
  createdAt: new Date().toISOString(),
});

export function useDashboardActions({
  user,
  mission,
  missionPreview,
  pointsBalance,
  buddyHunger,
  foodPrice,
  setMessage,
  setPointsBalance,
  setBuddyHunger,
}: Params) {
  const [isSubmittingMission, setIsSubmittingMission] = useState(false);

  const persistTemporaryEconomyBridgePatch = async (
    patch: Record<string, unknown>,
    successMessage: string,
    errorMessage: string,
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
        { merge: true },
      );
      setMessage(successMessage);
      return true;
    } catch {
      setMessage(errorMessage);
      return false;
    }
  };

  const handleStartMission = async () => {
    if (isSubmittingMission) return;
    if (!user) {
      setMessage("Bitte warte, bis dein WellFit Profil geladen ist.");
      return;
    }
    if (!mission.serverBacked || !mission.id) {
      setMessage("Noch keine veröffentlichte Beta-1-Mission verfügbar. Es wurden keine Punkte oder XP verändert.");
      return;
    }
    if (missionPreview?.decision.status === "blocked") {
      setMessage("Mission ist aktuell durch interne Beta-Limits blockiert.");
      return;
    }

    try {
      setIsSubmittingMission(true);
      setMessage("Mission wird sicher gestartet und zur Evidence-Prüfung eingereicht...");
      await submitDashboardMissionForReview(mission.id);
      setMessage(
        "Mission wurde serverseitig gestartet. Deine Bestätigung wartet auf Admin-Prüfung; XP werden erst nach Freigabe gutgeschrieben.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Die Mission konnte nicht sicher eingereicht werden.");
    } finally {
      setIsSubmittingMission(false);
    }
  };

  const handleFeedBuddy = async () => {
    if (!user) {
      setMessage("Bitte warte, bis dein WellFit Profil geladen ist.");
      return;
    }

    const spendPreview = await fetchDashboardSpendPreview({
      userId: user.id,
      itemId: "buddy-food-basic",
      pointsBalance,
      sourceId: "dashboard-buddy-feed",
    });

    if (spendPreview.status !== "spend_allowed") {
      setMessage("Nicht genug interne Punkte für Futter.");
      return;
    }

    const spendPoints = spendPreview.spendPoints || foodPrice;
    const newPoints = spendPreview.remainingPoints;
    const newHunger = Math.min(100, buddyHunger + 10);
    const temporaryBridge = createTemporaryEconomyBridgeMeta("buddy_food_sink");

    setPointsBalance(newPoints);
    setBuddyHunger(newHunger);

    await persistTemporaryEconomyBridgePatch(
      {
        points: newPoints,
        avatar: {
          ...(user.avatar ?? {}),
          hunger: newHunger,
          lastSpendPreview: spendPreview.ledgerSummary,
          lastSpendPreviewSource: spendPreview.source,
          lastTemporaryEconomyBridge: temporaryBridge,
        },
      },
      `Flammi wurde gefüttert. -${spendPoints} interne Punkte (${spendPreview.source === "server" ? "Server-Preview" : "lokaler Fallback"}; temporäre Anzeige bis Server-Projektion)`,
      "Flammi wurde lokal gefüttert, Firebase konnte nicht gespeichert werden.",
    );
  };

  return { handleStartMission, handleFeedBuddy, isSubmittingMission };
}
