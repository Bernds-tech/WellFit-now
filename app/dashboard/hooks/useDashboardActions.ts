"use client";

import { useEffect, useState } from "react";
import type { User } from "@/types/user";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import {
  clearPendingDashboardMission,
  completeDashboardMissionAttempt,
  getDashboardMissionAttemptStatus,
  readPendingDashboardMission,
  submitDashboardMissionForReview,
  writePendingDashboardMission,
  type Beta1PendingDashboardMission,
} from "@/lib/beta1/clientMissionCommands";
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
  const [isCheckingMission, setIsCheckingMission] = useState(false);
  const [pendingMission, setPendingMission] = useState<Beta1PendingDashboardMission | null>(null);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      setPendingMission(null);
      return;
    }
    setPendingMission(readPendingDashboardMission(userId));
  }, [user?.id]);

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
    if (isSubmittingMission || isCheckingMission) return;
    if (!user) {
      setMessage("Bitte warte, bis dein WellFit Profil geladen ist.");
      return;
    }
    if (pendingMission) {
      setMessage("Eine Mission wartet bereits auf Review. Bitte zuerst den Prüfstatus aktualisieren.");
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
      const submission = await submitDashboardMissionForReview(mission.id);
      const nextPending: Beta1PendingDashboardMission = {
        version: 1,
        userId: user.id,
        missionId: mission.id,
        missionTitle: mission.title,
        attemptId: submission.attemptId,
        evidenceId: submission.evidenceId,
        submittedAt: new Date().toISOString(),
        lastCheckedAt: null,
        attemptStatus: "evidence-submitted",
        reviewStatus: submission.reviewStatus,
        completionStatus: "not-completed",
        rewardXp: 0,
      };
      writePendingDashboardMission(nextPending);
      setPendingMission(nextPending);
      setMessage(
        "Mission wurde serverseitig gestartet. Deine Bestätigung wartet auf Admin-Prüfung; WFXP werden erst nach Freigabe gutgeschrieben.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Die Mission konnte nicht sicher eingereicht werden.");
    } finally {
      setIsSubmittingMission(false);
    }
  };

  const handleCheckMissionStatus = async () => {
    if (isCheckingMission || isSubmittingMission) return;
    if (!user || !pendingMission) {
      setMessage("Es gibt derzeit keine offene Mission zur Prüfung.");
      return;
    }

    try {
      setIsCheckingMission(true);
      setMessage("Reviewstatus wird serverseitig geprüft...");
      const status = await getDashboardMissionAttemptStatus(pendingMission);
      const checkedAt = new Date().toISOString();
      const updatedPending: Beta1PendingDashboardMission = {
        ...pendingMission,
        lastCheckedAt: checkedAt,
        attemptStatus: status.attemptStatus,
        reviewStatus: status.reviewStatus,
        completionStatus: status.completionStatus,
        rewardXp: status.rewardXp,
      };

      if (status.completionStatus === "completed") {
        clearPendingDashboardMission(user.id);
        setPendingMission(null);
        window.dispatchEvent(new CustomEvent("wellfit-beta1-projection-updated"));
        setMessage(`Mission ist bereits abgeschlossen. +${status.rewardXp} WFXP wurden serverseitig verbucht.`);
        return;
      }

      writePendingDashboardMission(updatedPending);
      setPendingMission(updatedPending);

      if (status.canRequestCompletion) {
        setMessage("Evidence ist freigegeben. Mission wird jetzt serverseitig abgeschlossen...");
        const completion = await completeDashboardMissionAttempt(pendingMission.attemptId);
        clearPendingDashboardMission(user.id);
        setPendingMission(null);
        window.dispatchEvent(new CustomEvent("wellfit-beta1-projection-updated"));
        setMessage(
          `Mission abgeschlossen: +${completion.rewardXp} WFXP wurden im serverseitigen Ledger verbucht${completion.idempotent ? " (bereits vorhanden)" : ""}.`,
        );
        return;
      }

      if (status.reviewStatus === "rejected") {
        setMessage("Die Evidence wurde abgelehnt. Du kannst den Vorgang schließen und die Mission neu starten.");
      } else if (status.reviewStatus === "needs-more-evidence") {
        setMessage("Für diese Mission wird weitere Evidence benötigt. Du kannst den Vorgang schließen und neu starten.");
      } else {
        setMessage("Die Mission wartet weiterhin auf Admin-Prüfung. Es wurden noch keine WFXP gutgeschrieben.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Der Reviewstatus konnte nicht sicher geladen werden.");
    } finally {
      setIsCheckingMission(false);
    }
  };

  const handleDismissPendingMission = () => {
    if (!user || !pendingMission) return;
    if (pendingMission.reviewStatus !== "rejected" && pendingMission.reviewStatus !== "needs-more-evidence") {
      setMessage("Ein laufender Review kann nicht verworfen werden. Bitte zuerst den Status aktualisieren.");
      return;
    }
    clearPendingDashboardMission(user.id);
    setPendingMission(null);
    setMessage("Der abgelehnte beziehungsweise unvollständige Vorgang wurde lokal geschlossen. Serverseitige Auditdaten bleiben erhalten.");
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

  return {
    handleStartMission,
    handleCheckMissionStatus,
    handleDismissPendingMission,
    handleFeedBuddy,
    isSubmittingMission,
    isCheckingMission,
    pendingMission,
  };
}
