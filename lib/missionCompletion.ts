import { economyConfig, getRewardRate } from "@/config/economy";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection, doc, getDoc, increment, serverTimestamp, setDoc } from "firebase/firestore";

export type MissionStartInput = {
  missionId: string;
  title: string;
  category: string;
  rewardPoints: number;
  icon?: string;
  proofType?: "manual" | "steps" | "gps" | "question" | "event" | "competition" | "adventure";
};

export type MissionCompletionInput = MissionStartInput & {
  rewardLabel?: string;
};

function calculateDynamicReward(baseReward: number) {
  const rewardRate = getRewardRate(economyConfig.reserve, economyConfig.totalSupply);
  const pointsGranted = Math.max(1, Math.round(baseReward * rewardRate));

  return {
    pointsGranted,
    rewardRate,
    reserve: economyConfig.reserve,
    totalSupply: economyConfig.totalSupply,
  };
}

export async function startMission(input: MissionStartInput) {
  const currentUser = auth.currentUser;

  if (!currentUser) throw new Error("Bitte zuerst registrieren oder einloggen.");

  const lockedReward = calculateDynamicReward(input.rewardPoints);
  const progressId = `${currentUser.uid}_${input.missionId}`;
  const progressRef = doc(db, "userMissionProgress", progressId);
  const existingSnap = await getDoc(progressRef);
  const existing = existingSnap.exists() ? existingSnap.data() : null;

  if (existing?.status === "completed") {
    return { userId: currentUser.uid, missionId: input.missionId, lockedReward: Number(existing.pointsGranted ?? 0), alreadyCompleted: true };
  }

  if (existing?.lockedRewardPoints) {
    return { userId: currentUser.uid, missionId: input.missionId, lockedReward: Number(existing.lockedRewardPoints), alreadyStarted: true };
  }

  await setDoc(
    progressRef,
    {
      userId: currentUser.uid,
      missionId: input.missionId,
      title: input.title,
      category: input.category,
      progressValue: 0,
      status: "active",
      startedAt: serverTimestamp(),
      baseRewardPoints: input.rewardPoints,
      lockedRewardPoints: lockedReward.pointsGranted,
      lockedRewardLabel: `+${lockedReward.pointsGranted} Punkte`,
      rewardPolicy: "dynamic_reserve_based_locked_on_start",
      rewardRateAtStart: lockedReward.rewardRate,
      reserveAtStart: lockedReward.reserve,
      totalSupplyAtStart: lockedReward.totalSupply,
      icon: input.icon ?? "✅",
      proofType: input.proofType ?? "manual",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await addDoc(collection(db, "history"), {
    userId: currentUser.uid,
    eventType: "missionStarted",
    missionId: input.missionId,
    title: input.title,
    category: input.category,
    baseRewardPoints: input.rewardPoints,
    lockedRewardPoints: lockedReward.pointsGranted,
    rewardLabel: `+${lockedReward.pointsGranted} Punkte fixiert`,
    rewardPolicy: "dynamic_reserve_based_locked_on_start",
    createdAt: serverTimestamp(),
  });

  return { userId: currentUser.uid, missionId: input.missionId, lockedReward: lockedReward.pointsGranted };
}

export async function completeMission(input: MissionCompletionInput) {
  const currentUser = auth.currentUser;

  if (!currentUser) throw new Error("Bitte zuerst registrieren oder einloggen.");

  const progressId = `${currentUser.uid}_${input.missionId}`;
  const progressRef = doc(db, "userMissionProgress", progressId);
  const userRef = doc(db, "users", currentUser.uid);
  const progressSnap = await getDoc(progressRef);
  const progressData = progressSnap.exists() ? progressSnap.data() : null;

  if (progressData?.status === "completed") {
    return { userId: currentUser.uid, missionId: input.missionId, pointsGranted: Number(progressData.pointsGranted ?? 0), alreadyCompleted: true };
  }

  const startResult = progressData?.lockedRewardPoints ? null : await startMission(input);
  const lockedRewardPoints = Number(progressData?.lockedRewardPoints ?? startResult?.lockedReward ?? calculateDynamicReward(input.rewardPoints).pointsGranted);
  const rewardLabel = `+${lockedRewardPoints} Punkte`;

  await setDoc(
    progressRef,
    {
      userId: currentUser.uid,
      missionId: input.missionId,
      title: input.title,
      category: input.category,
      progressValue: 100,
      status: "completed",
      completedAt: serverTimestamp(),
      baseRewardPoints: input.rewardPoints,
      pointsGranted: lockedRewardPoints,
      rewardLabel,
      rewardPolicy: "dynamic_reserve_based_locked_on_start",
      icon: input.icon ?? "✅",
      proofType: input.proofType ?? "manual",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await setDoc(userRef, { points: increment(lockedRewardPoints), pointsTotal: increment(lockedRewardPoints), updatedAt: serverTimestamp() }, { merge: true });

  await addDoc(collection(db, "history"), {
    userId: currentUser.uid,
    eventType: "missionCompleted",
    missionId: input.missionId,
    title: input.title,
    category: input.category,
    baseRewardPoints: input.rewardPoints,
    pointsDelta: lockedRewardPoints,
    rewardLabel,
    rewardPolicy: "dynamic_reserve_based_locked_on_start",
    icon: input.icon ?? "✅",
    createdAt: serverTimestamp(),
  });

  return { userId: currentUser.uid, missionId: input.missionId, pointsGranted: lockedRewardPoints };
}
