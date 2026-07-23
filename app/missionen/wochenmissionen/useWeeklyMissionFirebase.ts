"use client";

import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getClientTimeZone } from "@/lib/beta1/clientUserContext";
import {
  fetchWeeklyMissionProgress,
  reconcileWeeklyMissionAttempt,
  submitWeeklyMissionForReview,
  type Beta1WeeklyActiveAttempt,
  type Beta1WeeklyMissionActionResult,
  type Beta1WeeklyMissionProgress,
} from "@/lib/beta1/clientWeeklyMissionProgress";

export type WeeklyMissionState = {
  favoriteIds: string[];
  startedMissionIds: string[];
  completedMissionIds: string[];
  activeAttempts: Beta1WeeklyActiveAttempt[];
  userId: string | null;
  ready: boolean;
  lastError: string | null;
  weekKey: string | null;
  weekStartDateKey: string | null;
  weekEndDateKey: string | null;
  timeZone: string;
  calendarAuthority: "server-user-time-zone" | "device-preview";
  timeZoneChangeDeferred: boolean;
  nextTimeZoneChangeAt: string | null;
  weeklyGoal: number;
  goalCompleted: boolean;
  walletBalance: number;
  xp: number;
  level: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  walletAvailable: boolean;
  progressSource: "server" | "local";
  busyMissionId: string | null;
};

const localStorageKey = (userId?: string | null) => `wellfit-weekly-favorites:${userId ?? "guest"}`;

function readLocalFavorites(userId?: string | null): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(localStorageKey(userId));
    const value = raw ? JSON.parse(raw) : [];
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
  } catch {
    return [];
  }
}

function writeLocalFavorites(userId: string | null, favoriteIds: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(localStorageKey(userId), JSON.stringify(favoriteIds));
}

function emptyState(userId: string | null, ready = false): WeeklyMissionState {
  return {
    favoriteIds: readLocalFavorites(userId),
    startedMissionIds: [],
    completedMissionIds: [],
    activeAttempts: [],
    userId,
    ready,
    lastError: null,
    weekKey: null,
    weekStartDateKey: null,
    weekEndDateKey: null,
    timeZone: getClientTimeZone(),
    calendarAuthority: "device-preview",
    timeZoneChangeDeferred: false,
    nextTimeZoneChangeAt: null,
    weeklyGoal: 3,
    goalCompleted: false,
    walletBalance: 0,
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
  projection: Beta1WeeklyMissionProgress,
  userId: string,
  favoriteIds: string[],
  busyMissionId: string | null,
): WeeklyMissionState {
  return {
    favoriteIds,
    startedMissionIds: projection.startedMissionIds,
    completedMissionIds: projection.completedMissionIds,
    activeAttempts: projection.activeAttempts,
    userId,
    ready: true,
    lastError: null,
    weekKey: projection.weekKey,
    weekStartDateKey: projection.weekStartDateKey,
    weekEndDateKey: projection.weekEndDateKey,
    timeZone: projection.timeZone,
    calendarAuthority: projection.calendarAuthority,
    timeZoneChangeDeferred: projection.timeZoneChangeDeferred,
    nextTimeZoneChangeAt: projection.nextTimeZoneChangeAt,
    weeklyGoal: projection.weeklyGoal,
    goalCompleted: projection.goalCompleted,
    walletBalance: projection.walletBalance,
    xp: projection.xp,
    level: projection.level,
    xpForCurrentLevel: projection.xpForCurrentLevel,
    xpForNextLevel: projection.xpForNextLevel,
    walletAvailable: projection.walletAvailable,
    progressSource: "server",
    busyMissionId,
  };
}

export function useWeeklyMissionFirebase() {
  const [state, setState] = useState<WeeklyMissionState>(() => emptyState(null, false));

  const refresh = useCallback(async (userId: string) => {
    const projection = await fetchWeeklyMissionProgress();
    setState((current) => stateFromProjection(
      projection,
      userId,
      current.userId === userId ? current.favoriteIds : readLocalFavorites(userId),
      current.busyMissionId,
    ));
    return projection;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (!cancelled) setState(emptyState(null, true));
        return;
      }
      const favorites = readLocalFavorites(user.uid);
      if (!cancelled) setState({ ...emptyState(user.uid, false), favoriteIds: favorites });
      try {
        const projection = await fetchWeeklyMissionProgress();
        if (cancelled) return;
        setState(stateFromProjection(projection, user.uid, favorites, null));
      } catch (error) {
        if (cancelled) return;
        setState({
          ...emptyState(user.uid, true),
          favoriteIds: favorites,
          lastError: error instanceof Error ? error.message : "Wochenmissionen konnten nicht geladen werden.",
        });
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const setFavoriteIds = useCallback((favoriteIds: string[]) => {
    writeLocalFavorites(state.userId, favoriteIds);
    setState((current) => ({ ...current, favoriteIds }));
  }, [state.userId]);

  const runMissionAction = useCallback(async (
    missionId: string,
    action: () => Promise<Beta1WeeklyMissionActionResult>,
  ) => {
    if (!state.userId) throw new Error("Bitte melde dich an, um Wochenmissionen zu starten.");
    if (state.busyMissionId) throw new Error("Eine Wochenmission wird bereits verarbeitet.");
    setState((current) => ({ ...current, busyMissionId: missionId, lastError: null }));
    try {
      const result = await action();
      await refresh(state.userId);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Wochenmission konnte nicht verarbeitet werden.";
      setState((current) => ({ ...current, lastError: message }));
      throw error;
    } finally {
      setState((current) => ({ ...current, busyMissionId: null }));
    }
  }, [refresh, state.busyMissionId, state.userId]);

  const startMission = useCallback(async (missionId: string) => runMissionAction(
    missionId,
    () => submitWeeklyMissionForReview(missionId),
  ), [runMissionAction]);

  const continueMission = useCallback(async (missionId: string) => {
    const activeAttempt = state.activeAttempts.find((attempt) => attempt.missionId === missionId);
    if (!activeAttempt) {
      return runMissionAction(missionId, () => submitWeeklyMissionForReview(missionId));
    }
    return runMissionAction(missionId, () => reconcileWeeklyMissionAttempt(activeAttempt));
  }, [runMissionAction, state.activeAttempts]);

  const refreshProgress = useCallback(async () => {
    if (!state.userId) return null;
    return refresh(state.userId);
  }, [refresh, state.userId]);

  return {
    ...state,
    setFavoriteIds,
    startMission,
    continueMission,
    refreshProgress,
  };
}