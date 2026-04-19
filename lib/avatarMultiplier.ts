import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export type RewardMultiplierResult = {
  avatarMultiplier: number;
  userEconomyMultiplier: number;
  finalMultiplier: number;
  reasons: string[];
};

export async function calculateRewardMultipliers(userId: string): Promise<RewardMultiplierResult> {
  const snap = await getDoc(doc(db, "users", userId));
  const user = snap.exists() ? snap.data() : {};
  const avatar = (user.avatar ?? {}) as Record<string, any>;

  const avatarLevel = Number(avatar.level ?? user.level ?? 1);
  const avatarEnergy = Number(avatar.energy ?? user.energy ?? 100);
  const avatarMood = Number(avatar.mood ?? 100);
  const avatarHunger = Number(avatar.hunger ?? 100);
  const points = Number(user.points ?? 0);
  const pointsSpent = Number(user.pointsSpent ?? 0);
  const pointsTotal = Number(user.pointsTotal ?? points);

  const reasons: string[] = [];
  const levelBonus = Math.min(0.2, Math.max(0, (avatarLevel - 1) * 0.02));
  const stateAverage = (avatarEnergy + avatarMood + avatarHunger) / 3;
  const stateModifier = stateAverage >= 85 ? 0.08 : stateAverage >= 65 ? 0.03 : stateAverage >= 40 ? -0.05 : -0.12;

  if (levelBonus > 0) reasons.push(`Avatar-Level Bonus +${Math.round(levelBonus * 100)}%`);
  if (stateModifier > 0) reasons.push("Avatar ist gut versorgt");
  if (stateModifier < 0) reasons.push("Avatar braucht Pflege");

  const avatarMultiplier = clamp(1 + levelBonus + stateModifier, 0.85, 1.25);

  const spendRatio = pointsTotal > 0 ? pointsSpent / pointsTotal : 0;
  const hoardingPressure = points >= 1000 && spendRatio < 0.1 ? 0.85 : points >= 500 && spendRatio < 0.15 ? 0.92 : 1;
  const spendingBonus = spendRatio >= 0.35 ? 1.06 : spendRatio >= 0.2 ? 1.03 : 1;

  if (hoardingPressure < 1) reasons.push("Horten erkannt: persönliche Ausschüttung wird stabilisiert");
  if (spendingBonus > 1) reasons.push("Ökosystem-Nutzung Bonus");

  const userEconomyMultiplier = clamp(hoardingPressure * spendingBonus, 0.75, 1.08);
  const finalMultiplier = clamp(avatarMultiplier * userEconomyMultiplier, 0.65, 1.5);

  return { avatarMultiplier, userEconomyMultiplier, finalMultiplier, reasons };
}
