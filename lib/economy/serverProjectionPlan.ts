export type ProjectionBridgeStatus = "temporary_client_projection" | "server_projection_target" | "server_only_ready";
export type ProjectionReadTarget = "userEconomyProjections" | "getDailyMissionProgress";

export type EconomyProjectionTarget = {
  id: string;
  currentCollection: string;
  currentClientWrites: string[];
  targetCollection: ProjectionReadTarget;
  targetDocumentId: string;
  targetStatus: ProjectionBridgeStatus;
  sourceEvents: string[];
  uiConsumers: string[];
  removalGate: string;
};

export type EconomyProjectionMigrationStep = {
  id: string;
  title: string;
  status: "completed" | "prepared" | "blocked_by_mvp_bridge" | "future";
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
    uiConsumers: ["app/dashboard", "app/punkte-shop", "remaining legacy screens"],
    removalGate: "Audit all remaining users/{userId} economy writers before removing the repository-wide compatibility fields.",
  },
  {
    id: "avatar-state-projection",
    currentCollection: "users/{userId}",
    currentClientWrites: ["avatar.energy", "avatar.hunger", "avatar.level", "avatar.lastSpendPreview"],
    targetCollection: "userEconomyProjections",
    targetDocumentId: "{userId}_avatar",
    targetStatus: "server_projection_target",
    sourceEvents: ["mission_completion", "buddy_food_sink", "capability_unlock", "correction"],
    uiConsumers: ["app/buddy", "app/mobile/buddy", "remaining legacy screens"],
    removalGate: "Buddy care is migrated, but all other avatar consumers must use userAvatars/server projections before the users bridge is removed.",
  },
  {
    id: "daily-mission-state-projection",
    currentCollection: "userDailyMissionState/{userId}_{date}",
    currentClientWrites: [],
    targetCollection: "getDailyMissionProgress",
    targetDocumentId: "derived: userDailyMissionState preferences + missionAttempts + missionCompletions",
    targetStatus: "server_only_ready",
    sourceEvents: ["mission_attempt", "mission_evidence", "mission_completion", "daily_preference_update"],
    uiConsumers: ["app/missionen/tagesmissionen"],
    removalGate: "Completed: UI uses authenticated callables and Firestore client writes are denied.",
  },
  {
    id: "streak-level-projection",
    currentCollection: "userDailyStreaks/{userId} + userLevels/{userId}",
    currentClientWrites: [],
    targetCollection: "getDailyMissionProgress",
    targetDocumentId: "derived: missionCompletions + xpWallets/{userId}.lifetimeEarned",
    targetStatus: "server_only_ready",
    sourceEvents: ["mission_completion", "daily_goal_completed", "xp_grant", "correction"],
    uiConsumers: ["app/missionen/tagesmissionen"],
    removalGate: "Completed: streak and level are server-derived and legacy collection writes are denied.",
  },
];

export const economyProjectionMigrationSteps: EconomyProjectionMigrationStep[] = [
  {
    id: "projection-targets-documented",
    title: "Projection targets documented",
    status: "completed",
    description: "Temporary client projections are mapped to their current server read targets.",
  },
  {
    id: "daily-client-read-switch",
    title: "Daily mission client read switch",
    status: "completed",
    description: "Daily missions read preferences, attempts, review state, completions, streak and level through authenticated Beta-1 callables.",
  },
  {
    id: "daily-rules-hardening",
    title: "Daily mission rules hardening",
    status: "completed",
    description: "Clients may read their own legacy daily projection records but cannot create, update or delete them.",
  },
  {
    id: "remaining-users-bridge",
    title: "Remove remaining users economy bridge",
    status: "blocked_by_mvp_bridge",
    description: "Other repository screens still need migration before points, XP, level and avatar compatibility fields can be removed from users/{userId}.",
  },
];

export function summarizeEconomyProjectionPlan() {
  return {
    mode: "internal_points_beta_projection_plan",
    finalClientAuthority: false,
    tokenized: false,
    targetCollection: "mixed_server_read_models",
    writeEnabledNow: false,
    dailyMissionWritesHardened: true,
    usersEconomyBridgeStillActive: true,
    targets: economyProjectionTargets.map((target) => ({
      id: target.id,
      currentCollection: target.currentCollection,
      targetCollection: target.targetCollection,
      targetDocumentId: target.targetDocumentId,
      targetStatus: target.targetStatus,
      currentClientWrites: target.currentClientWrites,
      sourceEvents: target.sourceEvents,
      removalGate: target.removalGate,
    })),
    steps: economyProjectionMigrationSteps,
  };
}
