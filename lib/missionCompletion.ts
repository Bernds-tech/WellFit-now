import { economyConfig, getRewardRate } from "@/config/economy";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection, doc, increment, serverTimestamp, setDoc } from "firebase/firestore";

export type MissionCompletionInput = {
  missionId: string;
  title: string;
  category: string;
  rewardPoints: number;
  rewardLabel?: string;
  icon?: string;
  proofType?: "manual" | "steps" | "gps" | "question" | "event" | "competition" | "adventure";
};

function calculateDynamicReward(baseReward: number) {
  const rewardRate = getRewardRate(economyConfig.reserve, economyConfig.totalSupply);
  const pointsGranted = Math.max(1, Math.round(baseReward * rewardRate));

  return {
    pointsGranted,
    rewardRate,
    reserveAtCompletion: economyConfig.reserve,
    totalSupplyAtCompletion: economyConfig.totalSupply,
  };
}

export async function completeMission(input: MissionCompletionInput) {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Bitte zuerst registrieren oder einloggen.");
  }

  const dynamicReward = calculateDynamicReward(input.rewardPoints);
  const rewardLabel = `+${dynamicReward.pointsGranted} Punkte`;
  const progressId = `${currentUser.uid}_${input.missionId}`;
  const progressRef = doc(db, "userMissionProgress", progressId);
  const userRef = doc(db, "users", currentUser.uid);

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
      pointsGranted: dynamicReward.pointsGranted,
      rewardLabel,
      rewardPolicy: "dynamic_reserve_based_at_completion",
      rewardRateAtCompletion: dynamicReward.rewardRate,
      reserveAtCompletion: dynamicReward.reserveAtCompletion,
      totalSupplyAtCompletion: dynamicReward.totalSupplyAtCompletion,
      icon: input.icon ?? "✅",
      proofType: input.proofType ?? "manual",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await setDoc(
    userRef,
    {
      points: increment(dynamicReward.pointsGranted),
      pointsTotal: increment(dynamicReward.pointsGranted),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await addDoc(collection(db, "history"), {
    userId: currentUser.uid,
    eventType: "missionCompleted",
    missionId: input.missionId,
    title: input.title,
    category: input.category,
    baseRewardPoints: input.rewardPoints,
    pointsDelta: dynamicReward.pointsGranted,
    rewardLabel,
    rewardPolicy: "dynamic_reserve_based_at_completion",
    rewardRateAtCompletion: dynamicReward.rewardRate,
    reserveAtCompletion: dynamicReward.reserveAtCompletion,
    icon: input.icon ?? "✅",
    createdAt: serverTimestamp(),
  });

  return {
    userId: currentUser.uid,
    missionId: input.missionId,
    pointsGranted: dynamicReward.pointsGranted,
  };
}
