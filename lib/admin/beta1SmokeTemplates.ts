export type Beta1SmokeMissionTemplate = {
  title: string;
  type: string;
  rewardXp: number;
  childAllowed: boolean;
};

export type Beta1SmokeCheckpointTemplate = {
  title: string;
  regionId: "vienna" | "lower-austria";
  locationId: string;
};

export type Beta1SmokeGlitchTemplate = {
  regionId: "vienna" | "lower-austria";
  locationIds: string[];
  windowStart: string;
  windowEnd: string;
  multiplierCap: number;
  maxParticipants: number;
  reason: string;
};

export type Beta1SmokeXpAdjustTemplate = {
  ownerUserId: string;
  delta: number;
  reason: string;
  idempotencyKey: string;
};

export const BETA1_SMOKE_MISSION_TEMPLATE: Beta1SmokeMissionTemplate = {
  title: "Beta1 Vienna Walk Quest 01",
  type: "movement",
  rewardXp: 120,
  childAllowed: true,
};

export const BETA1_SMOKE_CHECKPOINT_TEMPLATE: Beta1SmokeCheckpointTemplate = {
  title: "Stephansplatz Intro Point",
  regionId: "vienna",
  locationId: "vienna-demo-01",
};

export const BETA1_SMOKE_GLITCH_TEMPLATE: Beta1SmokeGlitchTemplate = {
  regionId: "lower-austria",
  locationIds: ["lower-austria-demo-01", "lower-austria-demo-02"],
  windowStart: "2026-06-01T09:00:00Z",
  windowEnd: "2026-06-01T09:10:00Z",
  multiplierCap: 3,
  maxParticipants: 50,
  reason: "beta1 smoke event",
};

export const BETA1_SMOKE_XP_ADJUST_TEMPLATE: Beta1SmokeXpAdjustTemplate = {
  ownerUserId: "beta1-tester-user-01",
  delta: 25,
  reason: "beta1 smoke validation",
  idempotencyKey: "beta1-smoke-xp-01",
};
