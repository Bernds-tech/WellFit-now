export type ProjectionBridgeStatus = "temporary_client_projection" | "server_projection_target" | "server_only_ready";

export type EconomyProjectionTarget = {
  id: string;
  currentCollection: string;
  currentClientWrites: string[];
  targetCollection: "userEconomyProjections";
  targetDocumentId: string;
  targetStatus: ProjectionBridgeStatus;
  sourceEvents: string[];
  uiConsumers: string[];
  removalGate: string;
};

export type EconomyProjectionMigrationStep = {
  id: string;
  title: string;
  status: "prepared" | "blocked_by_mvp_bridge" | "future";
  description: string;
};

export const economyProjectionTargets: EconomyProjectionTarget[] = [
  {
    id: "user-balance-projection",
    currentCollection: "users/{userId}",
    currentClientWrites: ["points", "xp", "level", "stepsToday", "lastMissionCompletedAt"],
    targetCollection: "userEconomyProjections",
    targetDocumentId: "{userId}_balance",
    targetStatus: "server_projection_target",
    sourceEvents: ["mission_completion", "reward_grant", "correction", "points_sink"],
    uiConsumers: ["app/dashboard", "app/missionen/tagesmissionen", "app/punkte-shop"],
    removalGate: "Dashboard and Tagesmissionen read server projection before firestore.rules denies these user fields.",
  },
  {
    id: "avatar-state-projection",
    currentCollection: "users/{userId}",
    currentClientWrites: ["avatar.energy", "avatar.hunger", "avatar.level", "avatar.lastSpendPreview"],
    targetCollection: "userEconomyProjections",
    targetDocumentId: "{userId}_avatar",
    targetStatus: "server_projection_target",
    sourceEvents: ["mission_completion", "buddy_food_sink", "capability_unlock", "correction"],
    uiConsumers: ["app/dashboard", "app/buddy", "app/mobile/buddy"],
    removalGate: "Buddy food and avatar state use server sink/projection before avatar economy fields are denied.",
  },
  {
    id: "daily-mission-state-projection",
    currentCollection: "userDailyMissionState/{userId}_{date}",
    currentClientWrites: ["startedMissionIds", "completedMissionIds", "goalCompleted", "xp", "dailyGoal"],
    targetCollection: "userEconomyProjections",
    targetDocumentId: "{userId}_daily_{date}",
    targetStatus: "server_projection_target",
    sourceEvents: ["mission_started", "mission_completion", "daily_goal_projection", "correction"],
    uiConsumers: ["app/missionen/tagesmissionen"],
    removalGate: "Daily mission UI reads projected state before owner writes are removed from userDailyMissionState.",
  },
  {
    id: "streak-level-projection",
    currentCollection: "userDailyStreaks/{userId} + userLevels/{userId}",
    currentClientWrites: ["currentStreak", "longestStreak", "lastCompletedDate", "xp", "level"],
    targetCollection: "userEconomyProjections",
    targetDocumentId: "{userId}_progress",
    targetStatus: "server_projection_target",
    sourceEvents: ["mission_completion", "daily_goal_completed", "xp_grant", "correction"],
    uiConsumers: ["app/missionen/tagesmissionen", "app/dashboard"],
    removalGate: "Streak and level are derived from server-authorized mission completion events.",
  },
];

export const economyProjectionMigrationSteps: EconomyProjectionMigrationStep[] = [
  {
    id: "projection-targets-documented",
    title: "Projection targets documented",
    status: "prepared",
    description: "Temporary client projections are mapped to userEconomyProjections target documents.",
  },
  {
    id: "api-dry-run-bundles",
    title: "API dry-run bundles",
    status: "prepared",
    description: "Completion and spend APIs return server draft bundles but do not write final Firestore records yet.",
  },
  {
    id: "client-read-switch",
    title: "Client read switch",
    status: "blocked_by_mvp_bridge",
    description: "Dashboard and daily missions still need the temporary local/Firebase bridge until projections can be read safely.",
  },
  {
    id: "rules-hardening",
    title: "Rules hardening",
    status: "future",
    description: "After server projection reads are active, client writes for points, XP, level, avatar, streaks and daily state can be denied.",
  },
];

export function summarizeEconomyProjectionPlan() {
  return {
    mode: "internal_points_beta_projection_plan",
    finalClientAuthority: false,
    tokenized: false,
    targetCollection: "userEconomyProjections",
    writeEnabledNow: false,
    targets: economyProjectionTargets.map((target) => ({
      id: target.id,
      currentCollection: target.currentCollection,
      targetCollection: target.targetCollection,
      targetDocumentId: target.targetDocumentId,
      currentClientWrites: target.currentClientWrites,
      sourceEvents: target.sourceEvents,
      removalGate: target.removalGate,
    })),
    steps: economyProjectionMigrationSteps,
  };
}
