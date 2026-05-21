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
export type AgentHandoffPromptGenerateInput = { executionId: string; commitMessage?: string; prTitle?: string };
export type AgentHandoffPromptGetInput = { handoffPromptId: string };
export type AgentHandoffPromptCopiedInput = { handoffPromptId: string };
export type AgentWorkerQueueCreateInput = { executionId: string; handoffPromptId: string; workerMode?: "manual_codex" | "supervised_agent" | "automated_low_risk_planned" };
export type AgentWorkerQueueActionInput = { workerQueueId: string; reason?: string; prRef?: string; workerStatus?: string };
export type AgentWorkerQueueChecksInput = { workerQueueId: string; checks: Array<{ command: string; result: "pass" | "fail" | "blocked" | "skipped"; summary?: string; timestamp?: string }> };
export type AgentAutomationPolicyInput = { workerQueueId?: string; policyId?: string; environment?: "preview" | "staging" | "production"; reason?: string; secondApproval?: boolean };
