import { economyConfig, getRewardRate } from "@/config/economy";
import { auth, db } from "@/lib/firebase";
import { aggregateUserMissionAnalytics } from "@/lib/userAnalytics";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export type AiMissionProfile = {
  age?: number;
  level?: number;
  stepsToday?: number;
  goal?: "fitness" | "abnehmen" | "lernen" | "sozial" | "gesundheit" | string;
  preferredType?: "Bewegung" | "Ernährung" | "Workout" | "Community" | "Abenteuer" | string;
  lastTargetValue?: number;
  adaptiveLimit?: number;
  recentSuccessRate?: number;
  progressIndex?: number;
  slotIndex?: number;
};

type AiAnalyticsProfile = {
  completionRate: number;
  expiredCount: number;
  completedCount: number;
  startedCount: number;
  totalPointsEarned: number;
  averageLockedReward: number;
};

export type GeneratedMission = {
  title: string;
  category: "Tagesmissionen" | "Wochenmissionen" | "Abenteuer" | "Challenge" | "Wettkämpfe";
  description: string;
  difficulty: "Leicht" | "Mittel" | "Schwer";
  type: "Bewegung" | "Ernährung" | "Workout" | "Community" | "Abenteuer";
  duration: string;
  baseReward: number;
  reward: number;
  targetValue: number;
  unit: "steps" | "minutes" | "questions" | "checkin" | string;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
export const calculateAvailabilityReward = (baseReward: number) => Math.round(clamp(baseReward * getRewardRate(economyConfig.reserve, economyConfig.totalSupply), 3, 80));
const withAvailabilityReward = (mission: Omit<GeneratedMission, "reward">): GeneratedMission => ({ ...mission, reward: calculateAvailabilityReward(mission.baseReward) });

function computeAdaptiveTarget(profile: AiMissionProfile, analytics?: AiAnalyticsProfile) {
  const lastTarget = Math.max(10, Math.round(profile.lastTargetValue ?? 10));
  const progressIndex = Math.max(0, profile.progressIndex ?? analytics?.completedCount ?? 0);
  const adaptiveLimit = Math.max(lastTarget + 5, Math.round(profile.adaptiveLimit ?? Math.max(24, lastTarget + 8)));
  const successRate = clamp(profile.recentSuccessRate ?? analytics?.completionRate ?? 0.7, 0, 1);
  const expiredCount = analytics?.expiredCount ?? 0;

  let increment = 1;
  if (expiredCount > 0) increment = 0;
  else if (lastTarget < 12) increment = successRate > 0.75 ? 2 : 1;
  else if (lastTarget < 20) increment = successRate > 0.8 ? 2 : 1;
  else if (lastTarget < adaptiveLimit * 0.85) increment = successRate > 0.85 ? 2 : 1;
  else increment = successRate > 0.9 && progressIndex % 3 === 0 ? 1 : 0;

  const nextTarget = Math.min(adaptiveLimit, lastTarget + increment);
  const nearLimit = nextTarget >= adaptiveLimit * 0.85;

  return { lastTarget, adaptiveLimit, successRate, nextTarget, nearLimit, expiredCount };
}

async function loadUserProfile(userId: string): Promise<Partial<AiMissionProfile>> {
  const snap = await getDoc(doc(db, "users", userId));
  if (!snap.exists()) return {};
  const data = snap.data();
  const profile = (data.profile ?? {}) as Record<string, any>;
  const activity = (profile.activity ?? {}) as Record<string, any>;
  const goalsText = Array.isArray(activity.goals) ? activity.goals.join(" ").toLowerCase() : String(activity.goals ?? profile.goals ?? "").toLowerCase();
  const goal = goalsText.includes("abnehmen") ? "abnehmen" : goalsText.includes("lernen") ? "lernen" : "gesundheit";

  return {
    level: Number(data.level ?? 1),
    stepsToday: Number(data.stepsToday ?? 0),
    goal,
  };
}

export function generateLocalAiMission(profile: AiMissionProfile = {}, analytics?: AiAnalyticsProfile): GeneratedMission {
  const level = profile.level ?? 1;
  const stepsToday = profile.stepsToday ?? 0;
  const goal = profile.goal ?? "gesundheit";
  const lowActivity = stepsToday < 3000;
  const slotIndex = profile.slotIndex ?? 0;
  const adaptive = computeAdaptiveTarget(profile, analytics);
  const analyticsHint = analytics ? ` Erfolgsquote: ${Math.round(analytics.completionRate * 100)}%.` : "";

  if (goal === "lernen") {
    const questionTarget = Math.max(3, Math.min(8, 3 + Math.floor((analytics?.completedCount ?? profile.progressIndex ?? 0) / 3) + slotIndex));
    const difficulty = questionTarget >= 6 || level > 3 ? "Mittel" : "Leicht";
    return withAvailabilityReward({ title: `KI Wissens-Sprint ${slotIndex + 1}`, category: "Tagesmissionen", description: `Löse ${questionTarget} kurze Wissensfragen. Die KI nutzt deine Verlaufsauswertung und erhöht erst nach stabilen Abschlüssen.${analyticsHint}`, difficulty, type: "Community", duration: "10 Minuten", baseReward: 15 + level * 2 + slotIndex * 2, targetValue: questionTarget, unit: "questions" });
  }

  if (goal === "abnehmen") {
    const baseTarget = lowActivity ? Math.max(500, adaptive.nextTarget * 100) : Math.max(1500, adaptive.nextTarget * 220);
    const difficulty = adaptive.nearLimit ? "Mittel" : lowActivity ? "Leicht" : "Mittel";
    return withAvailabilityReward({ title: lowActivity ? `KI Sanfter Fettstoffwechsel-Start ${slotIndex + 1}` : `KI Aktiv-Burn Mission ${slotIndex + 1}`, category: "Tagesmissionen", description: adaptive.expiredCount > 0 ? `Gestern/offene Missionen wurden nicht vollständig abgeschlossen. Das Ziel bleibt stabil bei ${baseTarget.toLocaleString("de-DE")} Schritten, bis der Zeitraum abgeschlossen ist.${analyticsHint}` : adaptive.nearLimit ? `Du bist nahe an deinem aktuellen Belastungslimit. Wir halten das Ziel bei rund ${baseTarget.toLocaleString("de-DE")} Schritten und erhöhen danach wieder langsam.${analyticsHint}` : `Dein Ziel steigt kontrolliert auf ${baseTarget.toLocaleString("de-DE")} echte Schritte. Die KI nutzt deine Verlaufsdaten, nicht nur den Momentwert.${analyticsHint}`, difficulty, type: "Bewegung", duration: "1 Tag", baseReward: 20 + slotIndex * 4 + Math.round(baseTarget / 1000) * 2, targetValue: baseTarget, unit: "steps" });
  }

  const movementTarget = lowActivity ? Math.max(300, adaptive.nextTarget * 80) : Math.max(800, adaptive.nextTarget * 180);
  const difficulty = adaptive.nearLimit ? "Mittel" : lowActivity ? "Leicht" : "Mittel";
  return withAvailabilityReward({ title: lowActivity ? `KI Tagesstart Bewegung ${slotIndex + 1}` : `KI Fortschrittsrunde ${slotIndex + 1}`, category: "Tagesmissionen", description: adaptive.expiredCount > 0 ? `Nicht abgeschlossene Zeiträume werden berücksichtigt. Das Ziel bleibt bei etwa ${movementTarget.toLocaleString("de-DE")} Schritten stabil.${analyticsHint}` : adaptive.nearLimit ? `Du näherst dich deiner persönlichen Grenze. Das System stabilisiert dein Ziel bei etwa ${movementTarget.toLocaleString("de-DE")} Schritten.${analyticsHint}` : `Das Ziel wächst aus deinem Verlauf: von ${adaptive.lastTarget} auf ${adaptive.nextTarget}. Heute etwa ${movementTarget.toLocaleString("de-DE")} Schritte.${analyticsHint}`, difficulty, type: "Bewegung", duration: "1 Tag", baseReward: 18 + slotIndex * 3 + Math.round(movementTarget / 1000) * 2, targetValue: movementTarget, unit: "steps" });
}

export async function createAiMissionForCurrentUser(profile: AiMissionProfile = {}) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Bitte zuerst registrieren oder einloggen.");

  const analytics = await aggregateUserMissionAnalytics(currentUser.uid, "daily");
  const storedProfile = await loadUserProfile(currentUser.uid);
  const mergedProfile = { ...storedProfile, ...profile, recentSuccessRate: analytics.completionRate, progressIndex: analytics.completedCount };

  const slotIndex = mergedProfile.slotIndex ?? 0;
  const dateKey = new Date().toISOString().slice(0, 10);
  const missionId = `${currentUser.uid}_${dateKey}_ai_slot_${slotIndex + 1}`;
  const mission = generateLocalAiMission(mergedProfile, analytics);
  const rewardRate = getRewardRate(economyConfig.reserve, economyConfig.totalSupply);

  const payload = { ...mission, baseRewardPoints: mission.baseReward, pointsReward: mission.reward, rewardPolicy: "dynamic_reserve_based_at_availability_and_locked_on_start", reserveAtAvailability: economyConfig.reserve, rewardRateAtAvailability: rewardRate, userId: currentUser.uid, source: "ai", generatedByAi: true, active: true, status: "testing", analyticsUsed: true, completionRateUsed: analytics.completionRate, expiredCountUsed: analytics.expiredCount, completedCountUsed: analytics.completedCount, startedCountUsed: analytics.startedCount, dateKey, slotIndex, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };

  await setDoc(doc(db, "aiGeneratedMissions", missionId), payload, { merge: true });
  await setDoc(doc(db, "missions", missionId), { ...payload, sortOrder: 100 + slotIndex, originCollection: "aiGeneratedMissions", originId: missionId }, { merge: true });

  return { id: missionId, ...mission };
}
