import { auth, db } from "@/lib/firebase";
import { doc, getDoc, increment, serverTimestamp, setDoc } from "firebase/firestore";

export type MissionStatsEvent = "view" | "favorite" | "unfavorite" | "completion" | "start" | "abort";

export type MissionStatsInput = {
  missionId: string;
  title?: string;
  category?: string;
  description?: string;
  reward?: number;
  difficulty?: string;
  type?: string;
  duration?: string;
  targetValue?: number;
  unit?: string;
  source?: "prefab" | "ai" | "fallback" | "firestore" | "ai_promoted" | string;
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
      description: input.description ?? "",
      reward: input.reward ?? 0,
      difficulty: input.difficulty ?? "Leicht",
      type: input.type ?? "Bewegung",
      duration: input.duration ?? "1 Tag",
      targetValue: input.targetValue ?? null,
      unit: input.unit ?? "checkin",
      source: input.source ?? "prefab",
      [eventField]: increment(1),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await evaluateMissionQuality(input.missionId);
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

export async function evaluateMissionQuality(missionId: string) {
  const statsRef = doc(db, "missionStats", missionId);
  const statsSnap = await getDoc(statsRef);

  if (!statsSnap.exists()) return null;

  const stats = statsSnap.data();
  const viewCount = Number(stats.viewCount ?? 0);
  const usageCount = Number(stats.usageCount ?? 0);
  const completionCount = Number(stats.completionCount ?? 0);
  const favoriteCount = Number(stats.favoriteCount ?? 0);
  const abortCount = Number(stats.abortCount ?? 0);
  const unfavoriteCount = Number(stats.unfavoriteCount ?? 0);

  const completionRate = usageCount > 0 ? completionCount / usageCount : 0;
  const favoriteRate = viewCount > 0 ? favoriteCount / viewCount : 0;
  const abortRate = usageCount > 0 ? abortCount / usageCount : 0;
  const dislikeRate = favoriteCount > 0 ? unfavoriteCount / favoriteCount : 0;
  const qualityScore = Math.round(Math.max(0, Math.min(100, completionRate * 45 + favoriteRate * 35 + (1 - abortRate) * 15 + (1 - dislikeRate) * 5)));
  const isAiMission = stats.source === "ai" || stats.source === "ai_promoted";
  const shouldPromote = isAiMission && usageCount >= 20 && qualityScore >= 70 && completionRate >= 0.6 && favoriteRate >= 0.2 && abortRate <= 0.25;
  const aiDecision = shouldPromote ? "auto_promoted" : qualityScore < 35 && usageCount >= 10 ? "needs_revision" : "collect_more_data";

  await setDoc(
    statsRef,
    {
      completionRate,
      favoriteRate,
      abortRate,
      dislikeRate,
      qualityScore,
      aiDecision,
      evaluatedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  if (shouldPromote && !stats.promotedAt) {
    await promoteAiMissionToGlobal({
      missionId,
      title: String(stats.title ?? "KI Mission"),
      category: String(stats.category ?? "Tagesmissionen"),
      description: String(stats.description ?? "Diese Mission wurde durch Nutzerverhalten als gute KI-Mission erkannt."),
      reward: Number(stats.reward ?? 0),
      difficulty: String(stats.difficulty ?? "Leicht"),
      type: String(stats.type ?? "Bewegung"),
      duration: String(stats.duration ?? "1 Tag"),
      targetValue: stats.targetValue === null || stats.targetValue === undefined ? undefined : Number(stats.targetValue),
      unit: String(stats.unit ?? "checkin"),
    });

    await setDoc(statsRef, { promotedAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
  }

  return { qualityScore, completionRate, favoriteRate, abortRate, shouldPromote };
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
