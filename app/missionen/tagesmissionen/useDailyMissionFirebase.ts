"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type DailyMissionState = { favoriteIds: string[]; dailySlotIds: (string | null)[]; startedMissionIds: string[]; completedMissionIds: string[]; userId: string | null; ready: boolean; lastError: string | null; dailyGoal: number; goalCompleted: boolean; currentStreak: number; longestStreak: number; streakBonus: number; xp: number; level: number; xpForCurrentLevel: number; xpForNextLevel: number; };

const defaultSlots: (string | null)[] = [null, null, null];
const DEFAULT_DAILY_GOAL = 3;
const todayKey = () => new Date().toISOString().slice(0, 10);
const yesterdayKey = () => { const date = new Date(); date.setDate(date.getDate() - 1); return date.toISOString().slice(0, 10); };
const storageKey = (userId?: string | null) => `wellfit-daily-missions-${userId ?? "local"}-${todayKey()}`;
const streakStorageKey = (userId?: string | null) => `wellfit-daily-streak-${userId ?? "local"}`;
const levelStorageKey = (userId?: string | null) => `wellfit-level-${userId ?? "local"}`;
const calculateStreakBonus = (streak: number) => Math.min(25, 5 + Math.floor(Math.max(1, streak) / 3) * 2);
const levelBaseXp = (level: number) => 100 + (Math.max(1, level) - 1) * 50;
function calculateLevelFromXp(totalXp: number) { let remaining = Math.max(0, totalXp); let level = 1; while (remaining >= levelBaseXp(level)) { remaining -= levelBaseXp(level); level += 1; } return { level, xpForCurrentLevel: remaining, xpForNextLevel: levelBaseXp(level) }; }

function readJson<T>(key: string, fallback: T): T { if (typeof window === "undefined") return fallback; try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } }
function writeJson(key: string, value: unknown) { if (typeof window === "undefined") return; localStorage.setItem(key, JSON.stringify(value)); }
function readLocal(userId?: string | null): Partial<DailyMissionState> { return readJson(storageKey(userId), {} as Partial<DailyMissionState>); }
function readLocalStreak(userId?: string | null) { return readJson(streakStorageKey(userId), {} as { currentStreak?: number; longestStreak?: number; lastCompletedDate?: string }); }
function readLocalLevel(userId?: string | null) { return readJson(levelStorageKey(userId), {} as { xp?: number }); }
function writeLocal(userId: string | null, next: Partial<DailyMissionState>) { const current = readLocal(userId); writeJson(storageKey(userId), { ...current, ...next }); }
function writeLocalStreak(userId: string | null, next: { currentStreak: number; longestStreak: number; lastCompletedDate: string }) { writeJson(streakStorageKey(userId), next); }
function writeLocalLevel(userId: string | null, next: { xp: number }) { writeJson(levelStorageKey(userId), next); }

function buildState(data: any, userId: string | null): DailyMissionState {
  const completedMissionIds = Array.isArray(data.completedMissionIds) ? data.completedMissionIds.map(String) : [];
  const dailyGoal = Number(data.dailyGoal ?? DEFAULT_DAILY_GOAL);
  const streak = readLocalStreak(userId);
  const levelData = readLocalLevel(userId);
  const xp = Number(data.xp ?? levelData.xp ?? 0);
  const levelInfo = calculateLevelFromXp(xp);
  const currentStreak = Number(data.currentStreak ?? streak.currentStreak ?? 0);
  const longestStreak = Number(data.longestStreak ?? streak.longestStreak ?? 0);
  const goalCompleted = Boolean(data.goalCompleted ?? completedMissionIds.length >= dailyGoal);
  return { favoriteIds: Array.isArray(data.favoriteIds) ? data.favoriteIds.map(String) : [], dailySlotIds: Array.isArray(data.dailySlotIds) && data.dailySlotIds.length === 3 ? data.dailySlotIds.map((item: string | null) => item ? String(item) : null) : defaultSlots, startedMissionIds: Array.isArray(data.startedMissionIds) ? data.startedMissionIds.map(String) : [], completedMissionIds, userId, ready: true, lastError: null, dailyGoal, goalCompleted, currentStreak, longestStreak, streakBonus: Number(data.streakBonus ?? calculateStreakBonus(currentStreak)), xp, ...levelInfo };
}

export function useDailyMissionFirebase() {
  const [state, setState] = useState<DailyMissionState>({ favoriteIds: [], dailySlotIds: defaultSlots, startedMissionIds: [], completedMissionIds: [], userId: null, ready: false, lastError: null, dailyGoal: DEFAULT_DAILY_GOAL, goalCompleted: false, currentStreak: 0, longestStreak: 0, streakBonus: calculateStreakBonus(0), xp: 0, level: 1, xpForCurrentLevel: 0, xpForNextLevel: 100 });

  useEffect(() => { return onAuthStateChanged(auth, async (user) => { if (!user) { setState(buildState(readLocal(null), null)); return; } const local = readLocal(user.uid); try { const ref = doc(db, "userDailyMissionState", `${user.uid}_${todayKey()}`); const streakRef = doc(db, "userDailyStreaks", user.uid); const levelRef = doc(db, "userLevels", user.uid); const snap = await getDoc(ref); const streakSnap = await getDoc(streakRef); const levelSnap = await getDoc(levelRef); const data = snap.exists() ? snap.data() : local; const streakData = streakSnap.exists() ? streakSnap.data() : readLocalStreak(user.uid); const levelData = levelSnap.exists() ? levelSnap.data() : readLocalLevel(user.uid); setState(buildState({ ...data, ...streakData, ...levelData }, user.uid)); } catch (error) { const message = error instanceof Error ? error.message : "Firebase konnte nicht gelesen werden."; setState({ ...buildState(local, user.uid), lastError: message }); } }); }, []);

  const persist = async (next: Partial<DailyMissionState>) => { writeLocal(state.userId, next); if (!state.userId) return; try { const ref = doc(db, "userDailyMissionState", `${state.userId}_${todayKey()}`); await setDoc(ref, { ...next, updatedAt: serverTimestamp() }, { merge: true }); setState((current) => ({ ...current, lastError: null })); } catch (error) { const message = error instanceof Error ? error.message : "Firebase konnte nicht gespeichert werden."; setState((current) => ({ ...current, lastError: message })); } };
  const persistStreak = async (currentStreak: number, longestStreak: number) => { const payload = { currentStreak, longestStreak, lastCompletedDate: todayKey() }; writeLocalStreak(state.userId, payload); if (!state.userId) return; try { await setDoc(doc(db, "userDailyStreaks", state.userId), { ...payload, updatedAt: serverTimestamp() }, { merge: true }); } catch (error) { const message = error instanceof Error ? error.message : "Streak konnte nicht gespeichert werden."; setState((current) => ({ ...current, lastError: message })); } };
  const persistLevel = async (xp: number) => { writeLocalLevel(state.userId, { xp }); if (!state.userId) return; try { await setDoc(doc(db, "userLevels", state.userId), { xp, ...calculateLevelFromXp(xp), updatedAt: serverTimestamp() }, { merge: true }); } catch (error) { const message = error instanceof Error ? error.message : "Level konnte nicht gespeichert werden."; setState((current) => ({ ...current, lastError: message })); } };

  const setFavoriteIds = async (favoriteIds: string[]) => { setState((current) => ({ ...current, favoriteIds })); await persist({ favoriteIds }); };
  const setDailySlotIds = async (dailySlotIds: (string | null)[]) => { setState((current) => ({ ...current, dailySlotIds })); await persist({ dailySlotIds }); };
  const startMission = async (missionId: string) => { const startedMissionIds = Array.from(new Set([...state.startedMissionIds, missionId])); setState((current) => ({ ...current, startedMissionIds })); await persist({ startedMissionIds }); };
  const completeMission = async (missionId: string, rewardPoints = 0) => { if (state.completedMissionIds.includes(missionId)) return; const completedMissionIds = Array.from(new Set([...state.completedMissionIds, missionId])); const goalCompleted = completedMissionIds.length >= state.dailyGoal; let currentStreak = state.currentStreak; let longestStreak = state.longestStreak; let streakBonus = state.streakBonus; if (goalCompleted && !state.goalCompleted) { const streak = readLocalStreak(state.userId); const lastCompletedDate = String(streak.lastCompletedDate ?? ""); currentStreak = lastCompletedDate === yesterdayKey() ? state.currentStreak + 1 : lastCompletedDate === todayKey() ? state.currentStreak : 1; longestStreak = Math.max(state.longestStreak, currentStreak); streakBonus = calculateStreakBonus(currentStreak); await persistStreak(currentStreak, longestStreak); } const xp = state.xp + Math.max(1, rewardPoints); const levelInfo = calculateLevelFromXp(xp); await persistLevel(xp); const next = { completedMissionIds, goalCompleted, currentStreak, longestStreak, streakBonus, dailyGoal: state.dailyGoal, xp, ...levelInfo }; setState((current) => ({ ...current, ...next })); await persist(next); };

  return { ...state, setFavoriteIds, setDailySlotIds, startMission, completeMission };
}
