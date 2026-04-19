import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type UserMissionAnalytics = {
  userId: string;
  period: "daily" | "weekly";
  startedCount: number;
  completedCount: number;
  expiredCount: number;
  completionRate: number;
  totalPointsEarned: number;
  activeMissionKinds: string[];
  completedMissionKinds: string[];
  averageLockedReward: number;
  updatedAt?: unknown;
};

const dayKey = () => new Date().toISOString().slice(0, 10);
const weekKey = () => {
  const now = new Date();
  const first = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - first.getTime()) / 86400000);
  return `${now.getFullYear()}-W${String(Math.ceil((days + first.getDay() + 1) / 7)).padStart(2, "0")}`;
};

export async function aggregateUserMissionAnalytics(userId: string, period: "daily" | "weekly" = "daily") {
  const historyQuery = query(collection(db, "history"), where("userId", "==", userId));
  const snapshot = await getDocs(historyQuery);

  let startedCount = 0;
  let completedCount = 0;
  let expiredCount = 0;
  let totalPointsEarned = 0;
  let totalLockedReward = 0;
  const activeMissionKinds = new Set<string>();
  const completedMissionKinds = new Set<string>();

  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const eventType = String(data.eventType ?? "");
    const missionKind = String(data.missionKind ?? data.missionId ?? "unknown");

    if (eventType === "missionStarted") {
      startedCount += 1;
      activeMissionKinds.add(missionKind);
      totalLockedReward += Number(data.lockedRewardPoints ?? data.finalReward ?? 0);
    }

    if (eventType === "missionCompleted") {
      completedCount += 1;
      completedMissionKinds.add(missionKind);
      activeMissionKinds.delete(missionKind);
      totalPointsEarned += Number(data.pointsDelta ?? 0);
    }

    if (eventType === "missionExpired") {
      expiredCount += 1;
      activeMissionKinds.delete(missionKind);
    }
  });

  const completionRate = startedCount > 0 ? completedCount / startedCount : 0;
  const averageLockedReward = startedCount > 0 ? totalLockedReward / startedCount : 0;
  const analytics: UserMissionAnalytics = {
    userId,
    period,
    startedCount,
    completedCount,
    expiredCount,
    completionRate,
    totalPointsEarned,
    activeMissionKinds: Array.from(activeMissionKinds),
    completedMissionKinds: Array.from(completedMissionKinds),
    averageLockedReward,
  };

  const key = period === "daily" ? dayKey() : weekKey();
  await setDoc(doc(db, "userAnalytics", `${userId}_${period}_${key}`), { ...analytics, key, updatedAt: serverTimestamp() }, { merge: true });
  await setDoc(doc(db, "users", userId), { analytics: { [period]: analytics }, updatedAt: serverTimestamp() }, { merge: true });

  return analytics;
}
