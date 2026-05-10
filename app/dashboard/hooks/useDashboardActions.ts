"use client";

import type { User } from "@/types/user";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import type { DashboardMissionPreview, PersonalMission } from "../types";
import { writeCachedUser } from "../lib/dashboardUser";
import { fetchDashboardMissionCompletion, fetchDashboardSpendPreview } from "../lib/serverPreviewApi";

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

const createTemporaryEconomyBridgeMeta = (action: "mission_completion" | "buddy_food_sink") => ({
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
  const persistTemporaryEconomyBridgePatch = async (
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

    const completion = await fetchDashboardMissionCompletion({
      user,
      mission,
      missionPreview,
      stepsToday,
    });

    if (completion.status === "completion_blocked") {
      setMessage("Mission wurde servernah blockiert. Keine Punktegutschrift.");
      return;
    }

    if (completion.status === "manual_review_required") {
      setMessage("Mission wurde servernah fuer Review vorgemerkt. Keine direkte Punktegutschrift.");
      return;
    }

    const previewPoints = completion.approvedPointsPreview || missionPreview?.decision.cappedPoints || mission.reward;
    const previewXp = completion.approvedXpPreview || previewPoints;
    const newSteps = stepsToday + mission.steps;
    const newPoints = pointsBalance + previewPoints;
    const newEnergy = Math.max(buddyEnergy - 6, 0);
    const newHunger = Math.max(buddyHunger - 4, 0);
    const nextLevel = newPoints >= 150 && buddyLevel === 1 ? 2 : buddyLevel;
    const completionSource = completion.source === "server" ? "Server-Completion" : "lokaler Completion-Fallback";
    const temporaryBridge = createTemporaryEconomyBridgeMeta("mission_completion");

    setStepsToday(newSteps);
    setPointsBalance(newPoints);
    setBuddyEnergy(newEnergy);
    setBuddyHunger(newHunger);
    setBuddyLevel(nextLevel);

    await persistTemporaryEconomyBridgePatch(
      {
        points: newPoints,
        xp: (user.xp ?? 0) + previewXp,
        stepsToday: newSteps,
        level: Math.max(user.level ?? 1, nextLevel),
        avatar: {
          ...(user.avatar ?? {}),
          level: nextLevel,
          energy: newEnergy,
          hunger: newHunger,
          lastMissionCompletion: completion.summary,
          lastMissionCompletionSource: completion.source,
          lastTemporaryEconomyBridge: temporaryBridge,
        },
      },
      `Mission gestartet: +${mission.steps} Schritte, +${previewPoints} interne Punkte (${completionSource}; temporäre Anzeige, finale Ledger-Autorität folgt serverseitig)`,
      "Mission lokal aktualisiert, Firebase konnte nicht gespeichert werden."
    );
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
      "Flammi wurde lokal gefüttert, Firebase konnte nicht gespeichert werden."
    );
  };

  return { handleStartMission, handleFeedBuddy };
}
