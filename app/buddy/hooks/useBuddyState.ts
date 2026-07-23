"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@/types/user";
import {
  createBuddyActionRequestId,
  getServerBuddyState,
  performServerBuddyAction,
  type Beta1BuddyActionPolicy,
  type Beta1ServerBuddyActionType,
} from "@/lib/beta1/clientBuddyActions";
import { feedBuddyWithWfxp } from "@/lib/beta1/clientBuddyCare";
import type { BuddyAction, BuddyActionType, BuddyState } from "../types";
import { getBuddyActions, type BuddyActionPriceMap } from "../lib/buddyCopy";
import { buddyEconomyNotice } from "../lib/buddyEconomy";
import { createBuddyStateFromUser } from "../lib/buddyState";

function pricesFromPolicies(
  policies: Partial<Record<Beta1ServerBuddyActionType, Beta1BuddyActionPolicy>>,
): BuddyActionPriceMap {
  return Object.fromEntries(
    Object.entries(policies).map(([actionType, policy]) => [actionType, policy?.costWfxp ?? 0]),
  ) as BuddyActionPriceMap;
}

function mergeBuddyFoodProjection(
  current: BuddyState,
  projection: {
    hunger: number;
    energy: number;
    mood: number;
    level: number;
    xpTotal: number;
  },
  remainingWfxp: number | null,
): BuddyState {
  return {
    ...current,
    hunger: projection.hunger,
    energy: projection.energy,
    mood: projection.mood,
    level: projection.level,
    xp: projection.xpTotal,
    points: remainingWfxp ?? current.points,
  };
}

export function useBuddyState(user: User | null) {
  const userId = user?.id ?? null;
  const [buddy, setBuddy] = useState<BuddyState>(() => createBuddyStateFromUser(user));
  const [actionPrices, setActionPrices] = useState<BuddyActionPriceMap>({});
  const [buddyMessage, setBuddyMessage] = useState("Flammi wird über den sicheren Serverpfad vorbereitet...");
  const [isSavingBuddy, setIsSavingBuddy] = useState(false);
  const [serverReady, setServerReady] = useState(false);

  const applyServerSnapshot = useCallback((snapshot: Awaited<ReturnType<typeof getServerBuddyState>>) => {
    setBuddy(snapshot.buddy);
    setActionPrices((current) => ({ ...current, ...pricesFromPolicies(snapshot.actionPolicies) }));
    setServerReady(true);
  }, []);

  const refreshBuddy = useCallback(async () => {
    if (!userId) return null;
    const snapshot = await getServerBuddyState();
    applyServerSnapshot(snapshot);
    return snapshot;
  }, [applyServerSnapshot, userId]);

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setBuddy(createBuddyStateFromUser(null));
      setActionPrices({});
      setServerReady(false);
      setBuddyMessage("Bitte melde dich an, um Flammi und dein WFXP-Guthaben zu laden.");
      return () => {
        cancelled = true;
      };
    }

    setServerReady(false);
    setBuddyMessage("Flammis serverseitiger Zustand wird geladen...");
    getServerBuddyState()
      .then((snapshot) => {
        if (cancelled) return;
        applyServerSnapshot(snapshot);
        setBuddyMessage(`Flammi ist serverseitig bereit. ${buddyEconomyNotice}`);
      })
      .catch((error) => {
        if (cancelled) return;
        setBuddy(createBuddyStateFromUser(user));
        setServerReady(false);
        setBuddyMessage(error instanceof Error ? error.message : "Flammis Serverprojektion konnte nicht geladen werden.");
      });

    return () => {
      cancelled = true;
    };
  }, [applyServerSnapshot, userId]);

  const actions = useMemo(
    () => getBuddyActions(buddy, actionPrices).map((action) => ({
      ...action,
      disabled: action.disabled || !serverReady || isSavingBuddy,
    })),
    [actionPrices, buddy, isSavingBuddy, serverReady],
  );

  const handleBuddyAction = useCallback(async (action: BuddyAction): Promise<boolean> => {
    if (!userId) {
      setBuddyMessage("Bitte warte, bis dein WellFit-Profil und die Serverautorität geladen sind.");
      return false;
    }
    if (!serverReady) {
      setBuddyMessage("Der sichere Buddy-Server ist noch nicht bereit. Bitte aktualisiere den Zustand.");
      return false;
    }
    if (action.disabled) {
      setBuddyMessage(`${action.label} ist im aktuellen, serverseitigen Zustand nicht möglich.`);
      return false;
    }

    setIsSavingBuddy(true);
    setBuddyMessage(`${action.label} wird serverseitig geprüft und atomar ausgeführt...`);

    try {
      if (action.type === "feed") {
        const feedResult = await feedBuddyWithWfxp();
        setBuddy((current) => mergeBuddyFoodProjection(current, feedResult.buddy, feedResult.remainingWfxp));
        setServerReady(true);

        let refreshed = true;
        try {
          await refreshBuddy();
        } catch {
          refreshed = false;
        }

        const sourceText = feedResult.usedExistingInventory
          ? "Ein vorhandener Energie-Snack wurde verwendet."
          : `Der Energie-Snack wurde serverseitig gekauft${feedResult.purchaseEventId ? " und auditiert" : ""}.`;
        const replayText = feedResult.idempotent ? " Der Verbrauch war bereits verbucht; es gab keinen zweiten Abzug." : "";
        const refreshText = refreshed ? "" : " Die vollständige Anzeige wird beim nächsten Serverabruf aktualisiert.";
        setBuddyMessage(`${sourceText}${replayText}${refreshText} ${buddyEconomyNotice}`);
        return true;
      }

      const actionType: Beta1ServerBuddyActionType = action.type;
      const result = await performServerBuddyAction({
        actionType,
        requestId: createBuddyActionRequestId(actionType),
      });
      setBuddy(result.buddy);
      setServerReady(true);

      const bookingText = result.costWfxp > 0
        ? `${result.costWfxp} WFXP wurden atomar aus Wallet und Ledger abgezogen.`
        : "Die Aktion war kostenlos und hat das WFXP-Guthaben nicht verändert.";
      const replayText = result.idempotent ? " Der identische Auftrag war bereits verbucht; es erfolgte keine Doppelbuchung." : "";
      setBuddyMessage(`${action.label} abgeschlossen. ${bookingText}${replayText} ${buddyEconomyNotice}`);
      return true;
    } catch (error) {
      setBuddyMessage(error instanceof Error ? error.message : "Die Buddy-Aktion konnte nicht sicher ausgeführt werden.");
      return false;
    } finally {
      setIsSavingBuddy(false);
    }
  }, [refreshBuddy, serverReady, userId]);

  return {
    buddy,
    actions,
    buddyMessage,
    isSavingBuddy,
    serverReady,
    handleBuddyAction,
    refreshBuddy,
  };
}
