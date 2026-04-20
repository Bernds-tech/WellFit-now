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
};

const defaultSlots: (string | null)[] = [null, null, null];
const todayKey = () => new Date().toISOString().slice(0, 10);

export function useDailyMissionFirebase() {
  const [state, setState] = useState<DailyMissionState>({
    favoriteIds: [],
    dailySlotIds: defaultSlots,
    startedMissionIds: [],
    completedMissionIds: [],
    userId: null,
    ready: false,
  });

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ favoriteIds: [], dailySlotIds: defaultSlots, startedMissionIds: [], completedMissionIds: [], userId: null, ready: true });
        return;
      }

      const ref = doc(db, "userDailyMissionState", `${user.uid}_${todayKey()}`);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};

      setState({
        favoriteIds: Array.isArray(data.favoriteIds) ? data.favoriteIds.map(String) : [],
        dailySlotIds: Array.isArray(data.dailySlotIds) && data.dailySlotIds.length === 3 ? data.dailySlotIds.map((item) => item ? String(item) : null) : defaultSlots,
        startedMissionIds: Array.isArray(data.startedMissionIds) ? data.startedMissionIds.map(String) : [],
        completedMissionIds: Array.isArray(data.completedMissionIds) ? data.completedMissionIds.map(String) : [],
        userId: user.uid,
        ready: true,
      });
    });
  }, []);

  const persist = async (next: Partial<DailyMissionState>) => {
    if (!state.userId) return;
    const ref = doc(db, "userDailyMissionState", `${state.userId}_${todayKey()}`);
    await setDoc(ref, { ...next, updatedAt: serverTimestamp() }, { merge: true });
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
