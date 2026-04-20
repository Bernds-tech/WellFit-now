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
};

const defaultSlots: (string | null)[] = [null, null, null];
const todayKey = () => new Date().toISOString().slice(0, 10);
const storageKey = (userId?: string | null) => `wellfit-daily-missions-${userId ?? "local"}-${todayKey()}`;

function readLocal(userId?: string | null): Partial<DailyMissionState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(userId));
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

export function useDailyMissionFirebase() {
  const [state, setState] = useState<DailyMissionState>({
    favoriteIds: [],
    dailySlotIds: defaultSlots,
    startedMissionIds: [],
    completedMissionIds: [],
    userId: null,
    ready: false,
    lastError: null,
  });

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        const local = readLocal(null);
        setState({
          favoriteIds: Array.isArray(local.favoriteIds) ? local.favoriteIds.map(String) : [],
          dailySlotIds: Array.isArray(local.dailySlotIds) && local.dailySlotIds.length === 3 ? local.dailySlotIds.map((item) => item ? String(item) : null) : defaultSlots,
          startedMissionIds: Array.isArray(local.startedMissionIds) ? local.startedMissionIds.map(String) : [],
          completedMissionIds: Array.isArray(local.completedMissionIds) ? local.completedMissionIds.map(String) : [],
          userId: null,
          ready: true,
          lastError: null,
        });
        return;
      }

      const local = readLocal(user.uid);
      try {
        const ref = doc(db, "userDailyMissionState", `${user.uid}_${todayKey()}`);
        const snap = await getDoc(ref);
        const data = snap.exists() ? snap.data() : local;

        setState({
          favoriteIds: Array.isArray(data.favoriteIds) ? data.favoriteIds.map(String) : [],
          dailySlotIds: Array.isArray(data.dailySlotIds) && data.dailySlotIds.length === 3 ? data.dailySlotIds.map((item) => item ? String(item) : null) : defaultSlots,
          startedMissionIds: Array.isArray(data.startedMissionIds) ? data.startedMissionIds.map(String) : [],
          completedMissionIds: Array.isArray(data.completedMissionIds) ? data.completedMissionIds.map(String) : [],
          userId: user.uid,
          ready: true,
          lastError: null,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Firebase konnte nicht gelesen werden.";
        setState({
          favoriteIds: Array.isArray(local.favoriteIds) ? local.favoriteIds.map(String) : [],
          dailySlotIds: Array.isArray(local.dailySlotIds) && local.dailySlotIds.length === 3 ? local.dailySlotIds.map((item) => item ? String(item) : null) : defaultSlots,
          startedMissionIds: Array.isArray(local.startedMissionIds) ? local.startedMissionIds.map(String) : [],
          completedMissionIds: Array.isArray(local.completedMissionIds) ? local.completedMissionIds.map(String) : [],
          userId: user.uid,
          ready: true,
          lastError: message,
        });
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
    setState((current) => ({ ...current, completedMissionIds }));
    await persist({ completedMissionIds });
  };

  return {
    ...state,
    setFavoriteIds,
    setDailySlotIds,
    startMission,
    completeMission,
  };
}
