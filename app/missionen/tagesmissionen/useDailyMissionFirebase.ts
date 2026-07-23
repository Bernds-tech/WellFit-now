"use client";

import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  fetchDailyMissionProgress,
  reconcileDailyMissionAttempt,
  saveDailyMissionPreferences,
  submitDailyMissionForReview,
  type Beta1DailyActiveAttempt,
  type Beta1DailyMissionActionResult,
  type Beta1DailyMissionProgress,
} from "@/lib/beta1/clientDailyMissionProgress";

export type DailyMissionState = {
  favoriteIds: string[];
  dailySlotIds: (string | null)[];
  startedMissionIds: string[];
  completedMissionIds: string[];
  activeAttempts: Beta1DailyActiveAttempt[];
  userId: string | null;
  ready: boolean;
  lastError: string | null;
  dailyGoal: number;
  goalCompleted: boolean;
  currentStreak: number;
  longestStreak: number;
  streakBonus: number;
  xp: number;
  level: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  walletAvailable: boolean;
  progressSource: "server" | "local";
  busyMissionId: string | null;
};

const DEFAULT_SLOTS: (string | null)[] = [null, null, null];
const DEFAULT_DAILY_GOAL = 3;

const localDateKey = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Vienna",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
};
const localStorageKey = (userId?: string | null) => `wellfit-daily-preferences:${userId ?? "guest"}:${localDateKey()}`;

function readLocalPreferences(userId?: string | null) {
  if (typeof window === "undefined") return { favoriteIds: [], dailySlotIds: DEFAULT_SLOTS };
  try {
    const raw = window.localStorage.getItem(localStorageKey(userId));
    const value = raw ? JSON.parse(raw) as { favoriteIds?: unknown; dailySlotIds?: unknown } : {};
    const favoriteIds = Array.isArray(value.favoriteIds)
      ? value.favoriteIds.filter((entry): entry is string => typeof entry === "string")
      : [];
    const dailySlotIds = Array.isArray(value.dailySlotIds)
      ? value.dailySlotIds.map((entry) => typeof entry === "string" ? entry : null).slice(0, 3)
      : [...DEFAULT_SLOTS];
    while (dailySlotIds.length < 3) dailySlotIds.push(null);
    return { favoriteIds, dailySlotIds };
  } catch {
    return { favoriteIds: [], dailySlotIds: [...DEFAULT_SLOTS] };
  }
}

function writeLocalPreferences(userId: string | null, value: { favoriteIds: string[]; dailySlotIds: (string | null)[] }) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(localStorageKey(userId), JSON.stringify(value));
}

function emptyState(userId: string | null, ready = false): DailyMissionState {
  const local = readLocalPreferences(userId);
  return {
    favoriteIds: local.favoriteIds,
    dailySlotIds: local.dailySlotIds,
    startedMissionIds: [],
    completedMissionIds: [],
    activeAttempts: [],
    userId,
    ready,
    lastError: null,
    dailyGoal: DEFAULT_DAILY_GOAL,
    goalCompleted: false,
    currentStreak: 0,
    longestStreak: 0,
    streakBonus: 5,
    xp: 0,
    level: 1,
    xpForCurrentLevel: 0,
    xpForNextLevel: 100,
    walletAvailable: false,
    progressSource: "local",
    busyMissionId: null,
  };
}

function stateFromProjection(
  projection: Beta1DailyMissionProgress,
  userId: string,
  busyMissionId: string | null,
): DailyMissionState {
  return {
    favoriteIds: projection.favoriteIds,
    dailySlotIds: projection.dailySlotIds,
    startedMissionIds: projection.startedMissionIds,
    completedMissionIds: projection.completedMissionIds,
    activeAttempts: projection.activeAttempts,
    userId,
    ready: true,
    lastError: null,
    dailyGoal: projection.dailyGoal,
    goalCompleted: projection.goalCompleted,
    currentStreak: projection.currentStreak,
    longestStreak: projection.longestStreak,
    streakBonus: projection.streakBonus,
    xp: projection.xp,
    level: projection.level,
    xpForCurrentLevel: projection.xpForCurrentLevel,
    xpForNextLevel: projection.xpForNextLevel,
    walletAvailable: projection.walletAvailable,
    progressSource: "server",
    busyMissionId,
  };
}

export function useDailyMissionFirebase() {
  const [state, setState] = useState<DailyMissionState>(() => emptyState(null, false));

  const refresh = useCallback(async (userId: string) => {
    const projection = await fetchDailyMissionProgress();
    setState((current) => stateFromProjection(projection, userId, current.busyMissionId));
    writeLocalPreferences(userId, {
      favoriteIds: projection.favoriteIds,
      dailySlotIds: projection.dailySlotIds,
    });
    return projection;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (!cancelled) setState(emptyState(null, true));
        return;
      }
      if (!cancelled) setState(emptyState(user.uid, false));
      try {
        const projection = await fetchDailyMissionProgress();
        if (cancelled) return;
        setState(stateFromProjection(projection, user.uid, null));
        writeLocalPreferences(user.uid, {
          favoriteIds: projection.favoriteIds,
          dailySlotIds: projection.dailySlotIds,
        });
      } catch (error) {
        if (cancelled) return;
        const fallback = emptyState(user.uid, true);
        setState({
          ...fallback,
          lastError: error instanceof Error ? error.message : "Tagesmissionen konnten nicht geladen werden.",
        });
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const persistPreferences = useCallback(async (
    favoriteIds: string[],
    dailySlotIds: (string | null)[],
  ) => {
    const userId = state.userId;
    writeLocalPreferences(userId, { favoriteIds, dailySlotIds });
    if (!userId) {
      setState((current) => ({ ...current, favoriteIds, dailySlotIds, lastError: null }));
      return;
    }
    const previous = { favoriteIds: state.favoriteIds, dailySlotIds: state.dailySlotIds };
    setState((current) => ({ ...current, favoriteIds, dailySlotIds, lastError: null }));
    try {
      const saved = await saveDailyMissionPreferences({ favoriteIds, dailySlotIds });
      setState((current) => ({
        ...current,
        favoriteIds: saved.favoriteIds,
        dailySlotIds: saved.dailySlotIds,
        progressSource: "server",
        lastError: null,
      }));
      writeLocalPreferences(userId, saved);
    } catch (error) {
      setState((current) => ({
        ...current,
        ...previous,
        lastError: error instanceof Error ? error.message : "Tagesauswahl konnte nicht gespeichert werden.",
      }));
      throw error;
    }
  }, [state.dailySlotIds, state.favoriteIds, state.userId]);

  const setFavoriteIds = useCallback(async (favoriteIds: string[]) => {
    await persistPreferences(favoriteIds, state.dailySlotIds);
  }, [persistPreferences, state.dailySlotIds]);

  const setDailySlotIds = useCallback(async (dailySlotIds: (string | null)[]) => {
    await persistPreferences(state.favoriteIds, dailySlotIds);
  }, [persistPreferences, state.favoriteIds]);

  const runMissionAction = useCallback(async (
    missionId: string,
    action: () => Promise<Beta1DailyMissionActionResult>,
  ) => {
    if (!state.userId) throw new Error("Bitte melde dich an, um Tagesmissionen zu starten.");
    if (state.busyMissionId) throw new Error("Eine Tagesmission wird bereits verarbeitet.");
    setState((current) => ({ ...current, busyMissionId: missionId, lastError: null }));
    try {
      const result = await action();
      await refresh(state.userId);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tagesmission konnte nicht verarbeitet werden.";
      setState((current) => ({ ...current, lastError: message }));
      throw error;
    } finally {
      setState((current) => ({ ...current, busyMissionId: null }));
    }
  }, [refresh, state.busyMissionId, state.userId]);

  const startMission = useCallback(async (missionId: string) => runMissionAction(
    missionId,
    () => submitDailyMissionForReview(missionId),
  ), [runMissionAction]);

  const completeMission = useCallback(async (missionId: string) => {
    const activeAttempt = state.activeAttempts.find((attempt) => attempt.missionId === missionId);
    if (!activeAttempt) {
      throw new Error("Für diese Tagesmission gibt es keinen offenen serverseitigen Attempt.");
    }
    return runMissionAction(missionId, () => reconcileDailyMissionAttempt(activeAttempt));
  }, [runMissionAction, state.activeAttempts]);

  const refreshProgress = useCallback(async () => {
    if (!state.userId) return null;
    return refresh(state.userId);
  }, [refresh, state.userId]);

  return {
    ...state,
    setFavoriteIds,
    setDailySlotIds,
    startMission,
    completeMission,
    refreshProgress,
  };
}
