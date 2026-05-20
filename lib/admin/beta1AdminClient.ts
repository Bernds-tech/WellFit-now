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
} from "./beta1AdminTypes";

function sanitizeAdminError(error: unknown): string {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
  if (code.includes("permission-denied")) return "Keine Berechtigung für diese Admin-Aktion.";
  if (code.includes("unauthenticated")) return "Bitte einloggen, um Admin-Aktionen auszuführen.";
  return "Admin-Aktion fehlgeschlagen.";
}

async function callAdmin<TInput>(name: string, input: TInput): Promise<AdminCallableResult> {
  try {
    const callable = httpsCallable<TInput, AdminCallableResult>(getFunctions(), name);
    const result = await callable(input);
    return result.data;
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
};
