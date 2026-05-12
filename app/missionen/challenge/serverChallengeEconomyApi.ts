export type ChallengeEconomyMission = {
  id: number;
  title: string;
  category: string;
  description: string;
  rewardPoints: number;
};

export type ChallengeRewardResult = {
  source: "server" | "local";
  status: "completion_ready" | "manual_review_required" | "completion_blocked";
  rewardPreviewStatus: "preview_allowed" | "manual_review" | "blocked" | "fallback";
  approvedPointsPreview: number;
  approvedXpPreview: number;
  projectedPoints: number;
  projectedXp: number;
  buddySyncMessage: string;
  draftCollections: string[];
  message: string;
};

const asNumber = (value: unknown, fallback: number) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const getMissionType = (mission: ChallengeEconomyMission) => {
  const text = `${mission.title} ${mission.category} ${mission.description}`.toLowerCase();
  if (text.includes("mathe") || text.includes("wissen") || text.includes("quiz")) return "learning";
  if (text.includes("sprint") || text.includes("fitness") || text.includes("bewegung") || text.includes("balance")) return "movement";
  if (text.includes("ar") || text.includes("fund")) return "ar_riddle";
  if (text.includes("duell") || text.includes("gruppe")) return "social_challenge";
  return "unknown";
};

async function fetchChallengeRewardPreview(params: { userId: string; mission: ChallengeEconomyMission }) {
  const response = await fetch("/api/economy/reward-preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: params.userId,
      missionId: `challenge-${params.mission.id}`,
      sourceId: `challenge-${params.mission.id}`,
      sourceType: "mission",
      missionType: getMissionType(params.mission),
      requestedPoints: params.mission.rewardPoints,
      requestedXp: params.mission.rewardPoints,
      usage: { emittedToday: 0, userEarnedToday: 0, missionTypeEarnedToday: 0 },
      evidenceSummary: `Challenge reward preview: ${params.mission.title}.`,
      riskSummary: {
        proofQuality: "unknown",
        cooldownRisk: "unknown",
        patternRisk: "unknown",
        notes: ["Challenge reward preview before final server persistence."],
      },
    }),
  });

  if (!response.ok) return null;
  return (await response.json()) as {
    ok?: boolean;
    status?: "preview_allowed" | "manual_review" | "blocked";
    cappedPoints?: unknown;
    serverDraft?: { collection?: string };
  };
}

async function fetchChallengeCompletion(params: { userId: string; mission: ChallengeEconomyMission; requestedPoints: number }) {
  const response = await fetch("/api/economy/complete-mission", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: params.userId,
      missionId: `challenge-${params.mission.id}`,
      sourceId: `challenge-${params.mission.id}`,
      sourceType: "mission",
      missionType: getMissionType(params.mission),
      requestedPoints: params.requestedPoints,
      requestedXp: params.requestedPoints,
      usage: { emittedToday: 0, userEarnedToday: 0, missionTypeEarnedToday: 0 },
      evidenceSummary: `Challenge beta completion: ${params.mission.title}.`,
      completionEvidenceSummary: "Challenge beta bridge. Final server writes are not active yet.",
      riskSummary: {
        proofQuality: "unknown",
        cooldownRisk: "unknown",
        patternRisk: "unknown",
        notes: ["Challenge uses completion draft before final persistence."],
      },
    }),
  });

  if (!response.ok) return null;
  return (await response.json()) as {
    ok?: boolean;
    status?: unknown;
    approvedPointsPreview?: unknown;
    approvedXpPreview?: unknown;
    serverDrafts?: Array<{ collection?: string }>;
  };
}

async function fetchChallengeUserProjection(params: { userId: string; points: number; xp: number; level: number }) {
  try {
    const response = await fetch("/api/economy/user-projection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: params.userId, points: params.points, xp: params.xp, level: params.level }),
    });
    if (!response.ok) return null;
    return (await response.json()) as { ok?: boolean };
  } catch {
    return null;
  }
}

async function fetchChallengeBuddySync(params: { userId: string; mission: ChallengeEconomyMission; rewardPoints: number }) {
  try {
    const response = await fetch("/api/economy/buddy-sync-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: params.userId,
        missionId: `challenge-${params.mission.id}`,
        missionTitle: params.mission.title,
        missionType: "Challenge",
        rewardPoints: params.rewardPoints,
        source: "dailyMission",
      }),
    });
    if (!response.ok) return "Buddy-Sync-Draft nicht erreichbar.";
    const data = (await response.json()) as { ok?: boolean };
    return data.ok ? "Buddy-Sync-Preview serverseitig vorgemerkt." : "Buddy-Sync-Preview nicht bestaetigt.";
  } catch {
    return "Buddy-Sync-Preview im lokalen Fallback.";
  }
}

export async function fetchChallengeRewardCompletion(params: {
  userId: string;
  mission: ChallengeEconomyMission;
  currentPoints: number;
  currentXp: number;
  currentLevel: number;
}): Promise<ChallengeRewardResult> {
  const fallback: ChallengeRewardResult = {
    source: "local",
    status: "completion_ready",
    rewardPreviewStatus: "fallback",
    approvedPointsPreview: Math.max(0, params.mission.rewardPoints),
    approvedXpPreview: Math.max(0, params.mission.rewardPoints),
    projectedPoints: Math.max(0, params.currentPoints) + Math.max(0, params.mission.rewardPoints),
    projectedXp: Math.max(0, params.currentXp) + Math.max(0, params.mission.rewardPoints),
    buddySyncMessage: "Buddy-Sync lokal vorgemerkt.",
    draftCollections: [],
    message: "Challenge lokal vorgemerkt. Server-Pfade bleiben Zielpfad.",
  };

  try {
    const rewardPreview = await fetchChallengeRewardPreview({ userId: params.userId, mission: params.mission });
    if (!rewardPreview?.ok || rewardPreview.status === "blocked") {
      return rewardPreview?.status === "blocked"
        ? { ...fallback, source: "server", status: "completion_blocked", rewardPreviewStatus: "blocked", approvedPointsPreview: 0, approvedXpPreview: 0, message: "Reward-Preview blockiert diese Challenge." }
        : fallback;
    }

    if (rewardPreview.status === "manual_review") {
      return { ...fallback, source: "server", status: "manual_review_required", rewardPreviewStatus: "manual_review", approvedPointsPreview: 0, approvedXpPreview: 0, message: "Reward-Preview verlangt Review. Keine direkte Punktegutschrift." };
    }

    const requestedPoints = Math.max(0, Math.floor(asNumber(rewardPreview.cappedPoints, params.mission.rewardPoints)));
    const completion = await fetchChallengeCompletion({ userId: params.userId, mission: params.mission, requestedPoints });
    if (!completion?.ok) return fallback;

    if (completion.status !== "completion_ready" && completion.status !== "manual_review_required" && completion.status !== "completion_blocked") return fallback;

    const approvedPointsPreview = Math.max(0, Math.floor(asNumber(completion.approvedPointsPreview, fallback.approvedPointsPreview)));
    const approvedXpPreview = Math.max(0, Math.floor(asNumber(completion.approvedXpPreview, fallback.approvedXpPreview)));
    const projectedPoints = Math.max(0, params.currentPoints) + approvedPointsPreview;
    const projectedXp = Math.max(0, params.currentXp) + approvedXpPreview;
    const projection = await fetchChallengeUserProjection({ userId: params.userId, points: projectedPoints, xp: projectedXp, level: params.currentLevel });
    const buddySyncMessage = await fetchChallengeBuddySync({ userId: params.userId, mission: params.mission, rewardPoints: approvedPointsPreview });
    const draftCollections = [
      rewardPreview.serverDraft?.collection,
      ...(completion.serverDrafts ?? []).map((draft) => draft.collection),
      projection?.ok ? "userEconomyProjections" : undefined,
      "buddySyncPreview",
    ].filter((collection): collection is string => typeof collection === "string");

    return {
      source: "server",
      status: completion.status,
      rewardPreviewStatus: rewardPreview.status ?? "fallback",
      approvedPointsPreview,
      approvedXpPreview,
      projectedPoints,
      projectedXp,
      buddySyncMessage,
      draftCollections,
      message: "Challenge nutzt Reward-Preview, Completion, Projection und Buddy-Sync-Preview.",
    };
  } catch {
    return fallback;
  }
}
