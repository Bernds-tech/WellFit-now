import { economyConfig, getRewardRate } from "@/config/economy";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection, doc, getDoc, increment, serverTimestamp, setDoc } from "firebase/firestore";
import { calculateRewardMultipliers } from "@/lib/avatarMultiplier";
import { calculateDynamicRewardScore } from "@/lib/rewardScore";

export type MissionStartInput = {
  missionId: string;
  title: string;
  category: string;
  rewardPoints: number;
  missionKind?: string;
  icon?: string;
  proofType?: "manual" | "steps" | "gps" | "question" | "event" | "competition" | "adventure";
  precisionFactor?: number;
  socialMultiplier?: number;
  streakMultiplier?: number;
  sponsorMultiplier?: number;
  validationRisk?: number;
};

export type MissionCompletionInput = MissionStartInput & { rewardLabel?: string };

const normalizeMissionKind = (input: MissionStartInput) => input.missionKind ?? `${input.category}_${input.proofType ?? "manual"}_${input.title.toLowerCase().replace(/[^a-z0-9äöüß]+/gi, "_")}`;
const todayKey = () => new Date().toISOString().slice(0, 10);
const yesterdayKey = () => { const date = new Date(); date.setDate(date.getDate() - 1); return date.toISOString().slice(0, 10); };

async function updateDailyLoop(userId: string, pointsGranted: number) {
  const key = todayKey();
  const dailyRef = doc(db, "userDailyRewards", `${userId}_${key}`);
  const streakRef = doc(db, "userStreaks", userId);
  const userRef = doc(db, "users", userId);
  const dailySnap = await getDoc(dailyRef);
  const streakSnap = await getDoc(streakRef);
  const daily = dailySnap.exists() ? dailySnap.data() : {};
  const streak = streakSnap.exists() ? streakSnap.data() : {};
  const completedCount = Number(daily.completedCount ?? 0) + 1;
  const rewardEarnedToday = Number(daily.rewardEarnedToday ?? 0) + pointsGranted;
  const dailyGoal = Number(daily.dailyGoal ?? 3);
  const wasGoalCompleted = Boolean(daily.goalCompleted);
  const goalCompleted = completedCount >= dailyGoal;
  const lastCompletedDate = String(streak.lastCompletedDate ?? "");
  const currentStreak = Number(streak.currentStreak ?? 0);
  const longestStreak = Number(streak.longestStreak ?? 0);
  let nextStreak = currentStreak;
  let streakBonus = 0;

  if (goalCompleted && !wasGoalCompleted) {
    nextStreak = lastCompletedDate === yesterdayKey() ? currentStreak + 1 : lastCompletedDate === key ? currentStreak : 1;
    streakBonus = Math.min(25, 5 + Math.floor(nextStreak / 3) * 2);
    await setDoc(userRef, { points: increment(streakBonus), pointsTotal: increment(streakBonus), updatedAt: serverTimestamp() }, { merge: true });
    await addDoc(collection(db, "history"), { userId, eventType: "dailyRewardClaimed", dateKey: key, streak: nextStreak, pointsDelta: streakBonus, createdAt: serverTimestamp() });
  }

  await setDoc(dailyRef, { userId, dateKey: key, dailyGoal, completedCount, rewardEarnedToday, goalCompleted, streakBonus, updatedAt: serverTimestamp() }, { merge: true });
  await setDoc(streakRef, { userId, currentStreak: nextStreak, longestStreak: Math.max(longestStreak, nextStreak), lastCompletedDate: goalCompleted ? key : lastCompletedDate, updatedAt: serverTimestamp() }, { merge: true });

  return { dateKey: key, completedCount, dailyGoal, goalCompleted, streak: nextStreak, streakBonus };
}

export async function startMission(input: MissionStartInput) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Bitte zuerst registrieren oder einloggen.");

  const missionKind = normalizeMissionKind(input);
  const activeKindRef = doc(db, "userActiveMissionKinds", `${currentUser.uid}_${missionKind}`);
  const activeKindSnap = await getDoc(activeKindRef);
  const activeKind = activeKindSnap.exists() ? activeKindSnap.data() : null;

  if (activeKind?.status === "active" && activeKind?.missionId !== input.missionId) {
    throw new Error(`Du hast bereits eine aktive Mission dieser Art: ${activeKind.title ?? "aktive Mission"}. Schließe sie zuerst ab.`);
  }

  const progressId = `${currentUser.uid}_${input.missionId}`;
  const progressRef = doc(db, "userMissionProgress", progressId);
  const existingSnap = await getDoc(progressRef);
  const existing = existingSnap.exists() ? existingSnap.data() : null;

  if (existing?.status === "completed") return { userId: currentUser.uid, missionId: input.missionId, lockedReward: Number(existing.pointsGranted ?? 0), alreadyCompleted: true };
  if (existing?.lockedRewardPoints) return { userId: currentUser.uid, missionId: input.missionId, lockedReward: Number(existing.lockedRewardPoints), alreadyStarted: true };

  const systemRewardRate = getRewardRate(economyConfig.reserve, economyConfig.totalSupply);
  const multipliers = await calculateRewardMultipliers(currentUser.uid);
  const score = calculateDynamicRewardScore({ baseReward: input.rewardPoints, systemRewardRate, avatarMultiplier: multipliers.avatarMultiplier, userEconomyMultiplier: multipliers.userEconomyMultiplier, precisionFactor: input.precisionFactor, socialMultiplier: input.socialMultiplier, streakMultiplier: input.streakMultiplier, sponsorMultiplier: input.sponsorMultiplier, validationRisk: input.validationRisk });

  const payload = { userId: currentUser.uid, missionId: input.missionId, missionKind, title: input.title, category: input.category, progressValue: 0, status: "active", startedAt: serverTimestamp(), baseRewardPoints: input.rewardPoints, lockedRewardPoints: score.finalReward, systemRewardRate, avatarMultiplier: multipliers.avatarMultiplier, userEconomyMultiplier: multipliers.userEconomyMultiplier, precisionFactor: score.precisionFactor, socialMultiplier: score.socialMultiplier, streakMultiplier: score.streakMultiplier, sponsorMultiplier: score.sponsorMultiplier, integrityMultiplier: score.integrityMultiplier, validationRisk: score.validationRisk, multiplierReasons: multipliers.reasons, rewardPolicy: "dynamic_reward_score_locked_on_start", reserveAtStart: economyConfig.reserve, icon: input.icon ?? "✅", proofType: input.proofType ?? "manual", updatedAt: serverTimestamp() };

  await setDoc(progressRef, payload, { merge: true });
  await setDoc(activeKindRef, { ...payload, activeMissionProgressId: progressId }, { merge: true });
  await addDoc(collection(db, "history"), { userId: currentUser.uid, eventType: "missionStarted", missionId: input.missionId, missionKind, title: input.title, category: input.category, baseRewardPoints: input.rewardPoints, finalReward: score.finalReward, rewardPolicy: "dynamic_reward_score_locked_on_start", rewardBreakdown: payload, createdAt: serverTimestamp() });
  return { userId: currentUser.uid, missionId: input.missionId, lockedReward: score.finalReward };
}

export async function completeMission(input: MissionCompletionInput) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Bitte zuerst registrieren oder einloggen.");

  const missionKind = normalizeMissionKind(input);
  const progressId = `${currentUser.uid}_${input.missionId}`;
  const progressRef = doc(db, "userMissionProgress", progressId);
  const userRef = doc(db, "users", currentUser.uid);
  const activeKindRef = doc(db, "userActiveMissionKinds", `${currentUser.uid}_${missionKind}`);
  const progressSnap = await getDoc(progressRef);
  const progressData = progressSnap.exists() ? progressSnap.data() : null;

  if (progressData?.status === "completed") return { userId: currentUser.uid, missionId: input.missionId, pointsGranted: Number(progressData.pointsGranted ?? 0), alreadyCompleted: true };

  const startResult = progressData?.lockedRewardPoints ? null : await startMission(input);
  const lockedRewardPoints = Number(progressData?.lockedRewardPoints ?? startResult?.lockedReward ?? 0);

  await setDoc(progressRef, { status: "completed", completedAt: serverTimestamp(), pointsGranted: lockedRewardPoints, updatedAt: serverTimestamp() }, { merge: true });
  await setDoc(activeKindRef, { status: "completed", completedAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
  await setDoc(userRef, { points: increment(lockedRewardPoints), pointsTotal: increment(lockedRewardPoints), updatedAt: serverTimestamp() }, { merge: true });
  const dailyLoop = await updateDailyLoop(currentUser.uid, lockedRewardPoints);

  await addDoc(collection(db, "history"), { userId: currentUser.uid, eventType: "missionCompleted", missionId: input.missionId, missionKind, title: input.title, category: input.category, pointsDelta: lockedRewardPoints, dailyLoop, createdAt: serverTimestamp() });
  return { userId: currentUser.uid, missionId: input.missionId, pointsGranted: lockedRewardPoints, dailyLoop };
}
