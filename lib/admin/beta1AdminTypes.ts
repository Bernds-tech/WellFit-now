export type AdminCallableResult = {
  accepted: boolean;
  message?: string;
  status?: string;
  missionId?: string;
  checkpointId?: string;
  glitchEventId?: string;
  reportId?: string;
  wallet?: unknown;
};

export type AdminCreateMissionInput = { title: string; type?: string; rewardXp: number; childAllowed: boolean; reason?: string };
export type AdminUpdateMissionInput = { missionId: string; title?: string; type?: string; rewardXp?: number; childAllowed?: boolean; reason?: string };
export type AdminPublishMissionInput = { missionId: string };
export type AdminCreateCheckpointInput = { title: string; regionId: string; locationId?: string; childAllowed?: boolean };
export type AdminScheduleGlitchInput = { regionId: string; locationIds: string[]; windowStart: string; windowEnd: string; multiplierCap: number; maxParticipants: number; reason?: string };
export type AdminCancelGlitchInput = { glitchEventId: string; reason: string };
export type AdminReviewSafetyReportInput = { reportId: string; decision: string; reason: string };
export type AdminAdjustXpInput = { ownerUserId: string; delta: number; reason: string; idempotencyKey?: string };


export type AgentPrHandoffInput = { executionId: string; branchName: string; title: string; summary: string };
export type AgentExecutionActionInput = { executionId: string; reason?: string };
