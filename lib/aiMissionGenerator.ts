import { economyConfig, getRewardRate } from "@/config/economy";
import { auth, db } from "@/lib/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

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

export type GeneratedMission = {
  title: string;
  category: "Tagesmissionen" | "Wochenmissionen" | "Abenteuer" | "Challenge" | "Wettkämpfe";
  description: string;
  difficulty: "Leicht" | "Mittel" | "Schwer";
  type: "Bewegung" | "Ernährung" | "Workout" | "Community" | "Abenteuer";
  duration: string;
  reward: number;
  targetValue: number;
  unit: "steps" | "minutes" | "questions" | "checkin" | string;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const getEconomyReward = (baseReward: number) => Math.round(clamp(baseReward * getRewardRate(economyConfig.reserve, economyConfig.totalSupply), 3, 80));

function computeAdaptiveTarget(profile: AiMissionProfile) {
  const lastTarget = Math.max(10, Math.round(profile.lastTargetValue ?? 10));
  const progressIndex = Math.max(0, profile.progressIndex ?? 0);
  const adaptiveLimit = Math.max(lastTarget + 5, Math.round(profile.adaptiveLimit ?? Math.max(24, lastTarget + 8)));
  const successRate = clamp(profile.recentSuccessRate ?? 0.7, 0, 1);

  let increment = 1;
  if (lastTarget < 12) increment = successRate > 0.75 ? 2 : 1;
  else if (lastTarget < 20) increment = successRate > 0.8 ? 2 : 1;
  else if (lastTarget < adaptiveLimit * 0.85) increment = successRate > 0.85 ? 2 : 1;
  else increment = successRate > 0.9 && progressIndex % 3 === 0 ? 1 : 0;

  const nextTarget = Math.min(adaptiveLimit, lastTarget + increment);
  const nearLimit = nextTarget >= adaptiveLimit * 0.85;

  return { lastTarget, adaptiveLimit, successRate, nextTarget, nearLimit };
}

export function generateLocalAiMission(profile: AiMissionProfile = {}): GeneratedMission {
  const level = profile.level ?? 1;
  const stepsToday = profile.stepsToday ?? 0;
  const goal = profile.goal ?? "gesundheit";
  const lowActivity = stepsToday < 3000;
  const slotIndex = profile.slotIndex ?? 0;
  const adaptive = computeAdaptiveTarget(profile);

  if (goal === "lernen") {
    const questionTarget = Math.max(3, Math.min(8, 3 + Math.floor((profile.progressIndex ?? 0) / 3) + slotIndex));
    const difficulty = questionTarget >= 6 || level > 3 ? "Mittel" : "Leicht";
    return { title: `KI Wissens-Sprint ${slotIndex + 1}`, category: "Tagesmissionen", description: `Löse ${questionTarget} kurze Wissensfragen. Bei stabilen Erfolgen wird die Schwierigkeit Schritt für Schritt erhöht.`, difficulty, type: "Community", duration: "10 Minuten", reward: getEconomyReward(15 + level * 2 + slotIndex * 2), targetValue: questionTarget, unit: "questions" };
  }

  if (goal === "abnehmen") {
    const baseTarget = lowActivity ? Math.max(500, adaptive.nextTarget * 100) : Math.max(1500, adaptive.nextTarget * 220);
    const difficulty = adaptive.nearLimit ? "Mittel" : lowActivity ? "Leicht" : "Mittel";
    return { title: lowActivity ? `KI Sanfter Fettstoffwechsel-Start ${slotIndex + 1}` : `KI Aktiv-Burn Mission ${slotIndex + 1}`, category: "Tagesmissionen", description: adaptive.nearLimit ? `Du bist nahe an deinem aktuellen Belastungslimit. Wir halten das Ziel bei rund ${baseTarget.toLocaleString("de-DE")} Schritten und erhöhen danach wieder langsam.` : `Dein Ziel steigt kontrolliert: erst kleine Schritte, dann etwas stärker. Heute: ${baseTarget.toLocaleString("de-DE")} echte Schritte.`, difficulty, type: "Bewegung", duration: "1 Tag", reward: getEconomyReward(20 + slotIndex * 4 + Math.round(baseTarget / 1000) * 2), targetValue: baseTarget, unit: "steps" };
  }

  const movementTarget = lowActivity ? Math.max(300, adaptive.nextTarget * 80) : Math.max(800, adaptive.nextTarget * 180);
  const difficulty = adaptive.nearLimit ? "Mittel" : lowActivity ? "Leicht" : "Mittel";
  return { title: lowActivity ? `KI Tagesstart Bewegung ${slotIndex + 1}` : `KI Fortschrittsrunde ${slotIndex + 1}`, category: "Tagesmissionen", description: adaptive.nearLimit ? `Du näherst dich deiner persönlichen Grenze. Das System stabilisiert dein Ziel bei etwa ${movementTarget.toLocaleString("de-DE")} Schritten und steigert danach langsamer weiter.` : `Das Ziel wächst in kleinen Schritten mit dir: zuerst ${adaptive.lastTarget}, dann ${adaptive.nextTarget}. Heute entspricht das etwa ${movementTarget.toLocaleString("de-DE")} Schritten.`, difficulty, type: "Bewegung", duration: "1 Tag", reward: getEconomyReward(18 + slotIndex * 3 + Math.round(movementTarget / 1000) * 2), targetValue: movementTarget, unit: "steps" };
}

export async function createAiMissionForCurrentUser(profile: AiMissionProfile = {}) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Bitte zuerst registrieren oder einloggen.");

  const slotIndex = profile.slotIndex ?? 0;
  const dateKey = new Date().toISOString().slice(0, 10);
  const missionId = `${currentUser.uid}_${dateKey}_ai_slot_${slotIndex + 1}`;
  const mission = generateLocalAiMission(profile);

  const payload = { ...mission, pointsReward: mission.reward, rewardPolicy: "dynamic_reserve_based", reserveAtGeneration: economyConfig.reserve, rewardRateAtGeneration: getRewardRate(economyConfig.reserve, economyConfig.totalSupply), userId: currentUser.uid, source: "ai", generatedByAi: true, active: true, status: "testing", dateKey, slotIndex, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };

  await setDoc(doc(db, "aiGeneratedMissions", missionId), payload, { merge: true });
  await setDoc(doc(db, "missions", missionId), { ...payload, sortOrder: 100 + slotIndex, originCollection: "aiGeneratedMissions", originId: missionId }, { merge: true });

  return { id: missionId, ...mission };
}
