import { getFunctions, httpsCallable } from "firebase/functions";
import type {
  AdminAdjustXpInput,
  AdminCallableResult,
  AdminCancelGlitchInput,
  AdminCreateCheckpointInput,
  AdminCreateMissionInput,
  AdminPublishMissionInput,
  AdminReviewSafetyReportInput,
  AdminScheduleGlitchInput,
  AdminUpdateMissionInput,
  AgentExecutionActionInput,
  AgentHandoffPromptCopiedInput,
  AgentHandoffPromptGenerateInput,
  AgentHandoffPromptGetInput,
  AgentPrHandoffInput,
  AgentWorkerQueueActionInput,
  AgentWorkerQueueChecksInput,
  AgentWorkerQueueCreateInput,
  AgentAutomationPolicyInput,
} from "./beta1AdminTypes";

function sanitizeAdminError(error: unknown): string {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
  if (code.includes("permission-denied")) return "Keine Berechtigung für diese Admin-Aktion.";
  if (code.includes("unauthenticated")) return "Bitte einloggen, um Admin-Aktionen auszuführen.";
  return "Admin-Aktion fehlgeschlagen.";
}

function sanitizeAdminResult(result: AdminCallableResult): AdminCallableResult {
  if (result.accepted) return { ...result, message: undefined };
  return { accepted: false, message: "Admin-Aktion fehlgeschlagen. Bitte Eingaben prüfen oder erneut versuchen." };
}

async function callAdmin<TInput>(name: string, input: TInput): Promise<AdminCallableResult> {
  try {
    const callable = httpsCallable<TInput, AdminCallableResult>(getFunctions(), name);
    const result = await callable(input);
    return sanitizeAdminResult(result.data);
  } catch (error) {
    return { accepted: false, message: sanitizeAdminError(error) };
  }
}

export const beta1AdminClient = {
  adminCreateMission: (input: AdminCreateMissionInput) => callAdmin("adminCreateMission", input),
  adminUpdateMission: (input: AdminUpdateMissionInput) => callAdmin("adminUpdateMission", input),
  adminPublishMission: (input: AdminPublishMissionInput) => callAdmin("adminPublishMission", input),
  adminCreateCheckpoint: (input: AdminCreateCheckpointInput) => callAdmin("adminCreateCheckpoint", input),
  adminScheduleGlitchEvent: (input: AdminScheduleGlitchInput) => callAdmin("adminScheduleGlitchEvent", input),
  cancelGlitchEvent: (input: AdminCancelGlitchInput) => callAdmin("cancelGlitchEvent", input),
  adminReviewSafetyReport: (input: AdminReviewSafetyReportInput) => callAdmin("adminReviewSafetyReport", { reportId: input.reportId, status: input.decision, reviewNote: input.reason }),
  adminAdjustXp: (input: AdminAdjustXpInput) => callAdmin("adminAdjustXp", input),
  prepareAgentTaskPrHandoff: (input: AgentPrHandoffInput) => callAdmin("prepareAgentTaskPrHandoff", { executionId: input.executionId, branchName: input.branchName, title: input.title, summary: input.summary }),
  markAgentTaskHandoffCreated: (input: AgentExecutionActionInput) => callAdmin("markAgentTaskHandoffCreated", { executionId: input.executionId }),
  blockAgentTaskExecution: (input: AgentExecutionActionInput) => callAdmin("blockAgentTaskExecution", { executionId: input.executionId, reason: input.reason }),
  listAgentTaskExecutions: (status?: string) => callAdmin("listAgentTaskExecutions", status ? { status } : {}),
  generateAgentTaskCodexPrompt: (input: AgentHandoffPromptGenerateInput) => callAdmin("generateAgentTaskCodexPrompt", input),
  getAgentTaskCodexPrompt: (input: AgentHandoffPromptGetInput) => callAdmin("getAgentTaskCodexPrompt", input),
  markAgentTaskCodexPromptCopied: (input: AgentHandoffPromptCopiedInput) => callAdmin("markAgentTaskCodexPromptCopied", input),
  listAgentTaskHandoffPrompts: (executionId?: string) => callAdmin("listAgentTaskHandoffPrompts", executionId ? { executionId } : {}),
  createAgentWorkerQueueItem: (input: AgentWorkerQueueCreateInput) => callAdmin("createAgentWorkerQueueItem", input),
  claimAgentWorkerQueueItem: (input: AgentWorkerQueueActionInput) => callAdmin("claimAgentWorkerQueueItem", { workerQueueId: input.workerQueueId }),
  updateAgentWorkerQueueStatus: (input: AgentWorkerQueueActionInput) => callAdmin("updateAgentWorkerQueueStatus", { workerQueueId: input.workerQueueId, workerStatus: input.workerStatus }),
  recordAgentWorkerQueueChecks: (input: AgentWorkerQueueChecksInput) => callAdmin("recordAgentWorkerQueueChecks", input),
  markAgentWorkerPrPrepared: (input: AgentWorkerQueueActionInput) => callAdmin("markAgentWorkerPrPrepared", { workerQueueId: input.workerQueueId, prRef: input.prRef }),
  blockAgentWorkerQueueItem: (input: AgentWorkerQueueActionInput) => callAdmin("blockAgentWorkerQueueItem", { workerQueueId: input.workerQueueId, reason: input.reason }),
  listAgentWorkerQueueItems: (status?: string) => callAdmin("listAgentWorkerQueueItems", status ? { status } : {}),
  getAgentWorkerQueueItem: (workerQueueId: string) => callAdmin("getAgentWorkerQueueItem", { workerQueueId }),
  createAgentAutomationPolicy: (input: AgentAutomationPolicyInput) => callAdmin("createAgentAutomationPolicy", input),
  requestAgentAutoMerge: (input: AgentAutomationPolicyInput) => callAdmin("requestAgentAutoMerge", input),
  getAgentAutomationPolicy: (policyId: string) => callAdmin("getAgentAutomationPolicy", { policyId }),
  listAgentAutomationPolicies: (status?: string) => callAdmin("listAgentAutomationPolicies", status ? { status } : {}),
};
