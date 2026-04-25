import { auth, db } from "@/lib/firebase";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import type { DailyMission, DailyMissionType } from "../tagesmissionen/missions";

type MissionBuddyEffect = {
  energy: number;
  hunger: number;
  mood: number;
  cleanliness: number;
  bond: number;
  loyalty: number;
  curiosity: number;
};

type ApplyMissionBuddyBridgeInput = {
  mission: DailyMission;
  rewardPoints: number;
  source?: "dailyMission" | "mobile" | "ar" | "pose";
};

type BridgeResult =
  | {
      ok: true;
      alreadyApplied: boolean;
      rewardPoints: number;
      effect: MissionBuddyEffect;
      message: string;
    }
  | {
      ok: false;
      reason: "not-authenticated" | "bridge-failed";
      message: string;
    };

const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max);

const defaultEffect: MissionBuddyEffect = {
  energy: -2,
  hunger: -2,
  mood: 4,
  cleanliness: -1,
  bond: 3,
  loyalty: 2,
  curiosity: 2,
};

const effectsByType: Record<DailyMissionType, MissionBuddyEffect> = {
  Bewegung: {
    energy: -4,
    hunger: -2,
    mood: 5,
    cleanliness: -1,
    bond: 3,
    loyalty: 2,
    curiosity: 5,
  },
  Workout: {
    energy: -6,
    hunger: -3,
    mood: 6,
    cleanliness: -2,
    bond: 4,
    loyalty: 2,
    curiosity: 3,
  },
  Ernährung: {
    energy: 2,
    hunger: 8,
    mood: 4,
    cleanliness: 0,
    bond: 2,
    loyalty: 3,
    curiosity: 1,
  },
  Abenteuer: {
    energy: -3,
    hunger: -2,
    mood: 6,
    cleanliness: -1,
    bond: 5,
    loyalty: 2,
    curiosity: 8,
  },
  Community: {
    energy: 1,
    hunger: 0,
    mood: 5,
    cleanliness: 0,
    bond: 3,
    loyalty: 5,
    curiosity: 2,
  },
};

function getBuddyStatus(input: { energy: number; hunger: number; cleanliness: number; bond: number; loyalty: number }) {
  if (input.loyalty <= 12 && input.bond <= 15) return "ranAway";
  if (input.cleanliness <= 25) return "messy";
  if (input.energy <= 30 || input.hunger <= 30 || input.bond <= 30) return "needsCare";
  if (input.energy <= 45 || input.hunger <= 45) return "tired";
  return "active";
}

function getDailyMode(input: { energy: number; hunger: number; cleanliness: number; mood: number; curiosity: number }) {
  if (input.cleanliness < 35) return "chaotisch";
  if (input.hunger < 40) return "hungrig";
  if (input.energy < 45) return "muede";
  if (input.mood > 78) return "stolz";
  if (input.curiosity > 72) return "abenteuerlustig";
  if (input.mood > 58) return "verspielt";
  return "neugierig";
}

function applyEffect(currentAvatar: Record<string, unknown>, effect: MissionBuddyEffect) {
  const next = {
    energy: clamp(Number(currentAvatar.energy ?? 75) + effect.energy),
    hunger: clamp(Number(currentAvatar.hunger ?? 70) + effect.hunger),
    mood: clamp(Number(currentAvatar.mood ?? 65) + effect.mood),
    cleanliness: clamp(Number(currentAvatar.cleanliness ?? 75) + effect.cleanliness),
    bond: clamp(Number(currentAvatar.bond ?? 60) + effect.bond),
    loyalty: clamp(Number(currentAvatar.loyalty ?? 70) + effect.loyalty),
    curiosity: clamp(Number(currentAvatar.curiosity ?? 60) + effect.curiosity),
    level: Number(currentAvatar.level ?? 1),
  };

  return {
    ...currentAvatar,
    ...next,
    status: getBuddyStatus(next),
    dailyMode: getDailyMode(next),
    lastMissionEffectAt: new Date().toISOString(),
  };
}

export async function applyMissionBuddyBridge({
  mission,
  rewardPoints,
  source = "dailyMission",
}: ApplyMissionBuddyBridgeInput): Promise<BridgeResult> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return {
      ok: false,
      reason: "not-authenticated",
      message: "Kein eingeloggter Nutzer für Mission-Buddy-Bridge.",
    };
  }

  const today = new Date().toISOString().slice(0, 10);
  const safeReward = Math.max(0, Math.round(Number(rewardPoints) || 0));
  const effect = effectsByType[mission.type] ?? defaultEffect;
  const userRef = doc(db, "users", currentUser.uid);
  const eventId = `${currentUser.uid}_${today}_${mission.id}`;
  const eventRef = doc(db, "missionBuddyEvents", eventId);

  try {
    const transactionResult = await runTransaction(db, async (transaction) => {
      const eventSnap = await transaction.get(eventRef);

      if (eventSnap.exists()) {
        return {
          alreadyApplied: true,
          pointsApplied: Number(eventSnap.data().rewardPoints ?? safeReward),
        };
      }

      const userSnap = await transaction.get(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};
      const currentPoints = Number(userData.points ?? 0);
      const currentAvatar = (userData.avatar ?? {}) as Record<string, unknown>;
      const nextAvatar = applyEffect(currentAvatar, effect);
      const appliedAt = new Date().toISOString();

      transaction.set(
        userRef,
        {
          points: currentPoints + safeReward,
          avatar: nextAvatar,
          lastMissionCompletedAt: appliedAt,
          updatedAt: appliedAt,
        },
        { merge: true }
      );

      transaction.set(
        eventRef,
        {
          userId: currentUser.uid,
          missionId: mission.id,
          missionTitle: mission.title,
          missionType: mission.type,
          rewardPoints: safeReward,
          source,
          effect,
          status: "applied",
          appliedAt,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          productNote:
            "Mission-Buddy-Bridge ist produktrelevante Logik. Client-Aufruf ist aktuell der Integrationspfad; serverseitige Validierung/Cloud Functions sind der nächste Sicherheitsausbau.",
        },
        { merge: true }
      );

      return {
        alreadyApplied: false,
        pointsApplied: safeReward,
      };
    });

    return {
      ok: true,
      alreadyApplied: transactionResult.alreadyApplied,
      rewardPoints: transactionResult.pointsApplied,
      effect,
      message: transactionResult.alreadyApplied
        ? "Mission-Buddy-Effekt war bereits angewendet. Keine doppelte Punktevergabe."
        : "Mission wurde mit Punkten und Buddy-Effekt verbunden.",
    };
  } catch (error) {
    return {
      ok: false,
      reason: "bridge-failed",
      message: error instanceof Error ? error.message : "Mission-Buddy-Bridge konnte nicht gespeichert werden.",
    };
  }
}
