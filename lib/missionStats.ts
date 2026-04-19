import { auth, db } from "@/lib/firebase";
import { doc, increment, serverTimestamp, setDoc } from "firebase/firestore";

export type MissionStatsEvent = "view" | "favorite" | "unfavorite" | "completion" | "start" | "abort";

export type MissionStatsInput = {
  missionId: string;
  title?: string;
  category?: string;
  source?: "prefab" | "ai" | "fallback" | "firestore" | string;
  event: MissionStatsEvent;
};

const eventIncrementMap: Record<MissionStatsEvent, string> = {
  view: "viewCount",
  favorite: "favoriteCount",
  unfavorite: "unfavoriteCount",
  completion: "completionCount",
  start: "usageCount",
  abort: "abortCount",
};

export async function recordMissionStatsEvent(input: MissionStatsInput) {
  const statsRef = doc(db, "missionStats", input.missionId);
  const eventField = eventIncrementMap[input.event];

  await setDoc(
    statsRef,
    {
      missionId: input.missionId,
      title: input.title ?? "",
      category: input.category ?? "",
      source: input.source ?? "prefab",
      [eventField]: increment(1),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export type MissionRatingInput = {
  missionId: string;
  title: string;
  category: string;
  source?: "prefab" | "ai" | "fallback" | "firestore" | string;
  liked?: boolean;
  difficultyMatch?: number;
  completed?: boolean;
};

export async function saveMissionRating(input: MissionRatingInput) {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Bitte zuerst registrieren oder einloggen.");
  }

  const ratingId = `${currentUser.uid}_${input.missionId}`;
  const ratingRef = doc(db, "missionRatings", ratingId);

  await setDoc(
    ratingRef,
    {
      userId: currentUser.uid,
      missionId: input.missionId,
      title: input.title,
      category: input.category,
      source: input.source ?? "prefab",
      liked: input.liked ?? null,
      difficultyMatch: input.difficultyMatch ?? null,
      completed: input.completed ?? false,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function promoteAiMissionToGlobal(input: {
  missionId: string;
  title: string;
  category: string;
  description: string;
  reward: number;
  difficulty: string;
  type: string;
  duration: string;
  targetValue?: number;
  unit?: string;
}) {
  const globalMissionRef = doc(db, "missions", input.missionId);

  await setDoc(
    globalMissionRef,
    {
      title: input.title,
      category: input.category,
      description: input.description,
      pointsReward: input.reward,
      difficulty: input.difficulty,
      type: input.type,
      duration: input.duration,
      targetValue: input.targetValue ?? null,
      unit: input.unit ?? "checkin",
      source: "ai_promoted",
      generatedByAi: true,
      active: true,
      promotedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
