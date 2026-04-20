"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type DailyMissionState = {
  favoriteIds: string[];
  dailySlotIds: (string | null)[];
  startedMissionIds: string[];
  completedMissionIds: string[];
  userId: string | null;
  ready: boolean;
  lastError: string | null;
  dailyGoal: number;
  goalCompleted: boolean;
  currentStreak: number;
  longestStreak: number;
  streakBonus: number;
};

const defaultSlots: (string | null)[] = [null, null, null];
const DEFAULT_DAILY_GOAL = 3;
const todayKey = () => new Date().toISOString().slice(0, 10);
const yesterdayKey = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
};
const storageKey = (userId?: string | null) => `wellfit-daily-missions-${userId ?? "local"}-${todayKey()}`;
const streakStorageKey = (userId?: string | null) => `wellfit-daily-streak-${userId ?? "local"}`;
const calculateStreakBonus = (streak: number) => Math.min(25, 5 + Math.floor(Math.max(1, streak) / 3) * 2);

function readLocal(userId?: string | null): Partial<DailyMissionState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function readLocalStreak(userId?: string | null) {
  if (typeof window === "undefined") return {} as { currentStreak?: number; longestStreak?: number; lastCompletedDate?: string };
  try {
    const raw = localStorage.getItem(streakStorageKey(userId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeLocal(userId: string | null, next: Partial<DailyMissionState>) {
  if (typeof window === "undefined") return;
  const current = readLocal(userId);
  localStorage.setItem(storageKey(userId), JSON.stringify({ ...current, ...next }));
}

function writeLocalStreak(userId: string | null, next: { currentStreak: number; longestStreak: number; lastCompletedDate: string }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(streakStorageKey(userId), JSON.stringify(next));
}

function buildState(data: any, userId: string | null): DailyMissionState {
  const completedMissionIds = Array.isArray(data.completedMissionIds) ? data.completedMissionIds.map(String) : [];
  const dailyGoal = Number(data.dailyGoal ?? DEFAULT_DAILY_GOAL);
  const streak = readLocalStreak(userId);
  const currentStreak = Number(data.currentStreak ?? streak.currentStreak ?? 0);
  const longestStreak = Number(data.longestStreak ?? streak.longestStreak ?? 0);
  const goalCompleted = Boolean(data.goalCompleted ?? completedMissionIds.length >= dailyGoal);

  return {
    favoriteIds: Array.isArray(data.favoriteIds) ? data.favoriteIds.map(String) : [],
    dailySlotIds: Array.isArray(data.dailySlotIds) && data.dailySlotIds.length === 3 ? data.dailySlotIds.map((item: string | null) => item ? String(item) : null) : defaultSlots,
    startedMissionIds: Array.isArray(data.startedMissionIds) ? data.startedMissionIds.map(String) : [],
    completedMissionIds,
    userId,
    ready: true,
    lastError: null,
    dailyGoal,
    goalCompleted,
    currentStreak,
    longestStreak,
    streakBonus: Number(data.streakBonus ?? calculateStreakBonus(currentStreak)),
  };
}

export function useDailyMissionFirebase() {
  const [state, setState] = useState<DailyMissionState>({
    favoriteIds: [],
    dailySlotIds: defaultSlots,
    startedMissionIds: [],
    completedMissionIds: [],
    userId: null,
    ready: false,
    lastError: null,
    dailyGoal: DEFAULT_DAILY_GOAL,
    goalCompleted: false,
    currentStreak: 0,
    longestStreak: 0,
    streakBonus: calculateStreakBonus(0),
  });

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        const local = readLocal(null);
        setState(buildState(local, null));
        return;
      }

      const local = readLocal(user.uid);
      try {
        const ref = doc(db, "userDailyMissionState", `${user.uid}_${todayKey()}`);
        const streakRef = doc(db, "userDailyStreaks", user.uid);
        const snap = await getDoc(ref);
        const streakSnap = await getDoc(streakRef);
        const data = snap.exists() ? snap.data() : local;
        const streakData = streakSnap.exists() ? streakSnap.data() : readLocalStreak(user.uid);
        setState(buildState({ ...data, ...streakData }, user.uid));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Firebase konnte nicht gelesen werden.";
        setState({ ...buildState(local, user.uid), lastError: message });
      }
    });
  }, []);

  const persist = async (next: Partial<DailyMissionState>) => {
    writeLocal(state.userId, next);
    if (!state.userId) return;
    try {
      const ref = doc(db, "userDailyMissionState", `${state.userId}_${todayKey()}`);
      await setDoc(ref, { ...next, updatedAt: serverTimestamp() }, { merge: true });
      setState((current) => ({ ...current, lastError: null }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Firebase konnte nicht gespeichert werden.";
      setState((current) => ({ ...current, lastError: message }));
    }
  };

  const persistStreak = async (currentStreak: number, longestStreak: number) => {
    const payload = { currentStreak, longestStreak, lastCompletedDate: todayKey() };
    writeLocalStreak(state.userId, payload);
    if (!state.userId) return;
    try {
      const streakRef = doc(db, "userDailyStreaks", state.userId);
      await setDoc(streakRef, { ...payload, updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Streak konnte nicht gespeichert werden.";
      setState((current) => ({ ...current, lastError: message }));
    }
  };

  const setFavoriteIds = async (favoriteIds: string[]) => {
    setState((current) => ({ ...current, favoriteIds }));
    await persist({ favoriteIds });
  };

  const setDailySlotIds = async (dailySlotIds: (string | null)[]) => {
    setState((current) => ({ ...current, dailySlotIds }));
    await persist({ dailySlotIds });
  };

  const startMission = async (missionId: string) => {
    const startedMissionIds = Array.from(new Set([...state.startedMissionIds, missionId]));
    setState((current) => ({ ...current, startedMissionIds }));
    await persist({ startedMissionIds });
  };

  const completeMission = async (missionId: string) => {
    const completedMissionIds = Array.from(new Set([...state.completedMissionIds, missionId]));
    const goalCompleted = completedMissionIds.length >= state.dailyGoal;
    let currentStreak = state.currentStreak;
    let longestStreak = state.longestStreak;
    let streakBonus = state.streakBonus;

    if (goalCompleted && !state.goalCompleted) {
      const streak = readLocalStreak(state.userId);
      const lastCompletedDate = String(streak.lastCompletedDate ?? "");
      currentStreak = lastCompletedDate === yesterdayKey() ? state.currentStreak + 1 : lastCompletedDate === todayKey() ? state.currentStreak : 1;
      longestStreak = Math.max(state.longestStreak, currentStreak);
      streakBonus = calculateStreakBonus(currentStreak);
      await persistStreak(currentStreak, longestStreak);
    }

    const next = { completedMissionIds, goalCompleted, currentStreak, longestStreak, streakBonus, dailyGoal: state.dailyGoal };
    setState((current) => ({ ...current, ...next }));
    await persist(next);
  };

  return {
    ...state,
    setFavoriteIds,
    setDailySlotIds,
    startMission,
    completeMission,
  };
}
