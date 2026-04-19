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

export async function completeMission(input: MissionCompletionInput) {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Bitte zuerst registrieren oder einloggen.");
  }

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
      pointsGranted: input.rewardPoints,
      rewardLabel: input.rewardLabel ?? `+${input.rewardPoints} Punkte`,
      icon: input.icon ?? "✅",
      proofType: input.proofType ?? "manual",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await setDoc(
    userRef,
    {
      points: increment(input.rewardPoints),
      pointsTotal: increment(input.rewardPoints),
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
    pointsDelta: input.rewardPoints,
    rewardLabel: input.rewardLabel ?? `+${input.rewardPoints} Punkte`,
    icon: input.icon ?? "✅",
    createdAt: serverTimestamp(),
  });

  return {
    userId: currentUser.uid,
    missionId: input.missionId,
    pointsGranted: input.rewardPoints,
  };
}
