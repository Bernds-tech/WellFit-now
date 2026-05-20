import type {
  AdminAdjustXpInput,
  AdminCancelGlitchInput,
  AdminCreateCheckpointInput,
  AdminCreateMissionInput,
  AdminPublishMissionInput,
  AdminReviewSafetyReportInput,
  AdminScheduleGlitchInput,
} from "./beta1AdminTypes";

const MISSION_TYPES = new Set(["movement", "learning", "family", "nutrition", "playground", "culture", "active_break", "beta_test"]);
const GLITCH_REGIONS = new Set(["vienna", "wien", "lower-austria", "lower_austria", "niederoesterreich", "niederösterreich"]);
const SAFETY_DECISIONS = new Set(["reviewed", "dismissed", "action_required", "unsafe_location", "blocked"]);

const isInteger = (v: number) => Number.isInteger(v);
const isIsoDate = (v: string) => !Number.isNaN(Date.parse(v));

function requiredString(value: string, min: number, max: number, label: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return `${label} ist erforderlich.`;
  if (trimmed.length < min || trimmed.length > max) return `${label} muss zwischen ${min} und ${max} Zeichen lang sein.`;
  return null;
}

export function validateMissionCreate(input: AdminCreateMissionInput): string | null {
  return (
    requiredString(input.title, 3, 120, "title") ||
    (!MISSION_TYPES.has(String(input.type || "").trim()) ? "type ist ungültig." : null) ||
    (!isInteger(input.rewardXp) || input.rewardXp < 0 || input.rewardXp > 500 ? "rewardXp muss ein Integer zwischen 0 und 500 sein." : null) ||
    (typeof input.childAllowed !== "boolean" ? "childAllowed muss true oder false sein." : null)
  );
}

export function validateMissionPublish(input: AdminPublishMissionInput): string | null {
  return requiredString(input.missionId, 3, 160, "missionId");
}

export function validateCheckpointCreate(input: AdminCreateCheckpointInput): string | null {
  return requiredString(input.title, 3, 120, "title") || requiredString(input.regionId, 2, 80, "regionId") || (input.locationId && input.locationId.trim().length > 160 ? "locationId darf maximal 160 Zeichen lang sein." : null);
}

export function validateGlitchSchedule(input: AdminScheduleGlitchInput): string | null {
  if (!GLITCH_REGIONS.has(input.regionId.trim().toLowerCase())) return "regionId ist für Beta-1 nicht erlaubt.";
  if (!Array.isArray(input.locationIds) || input.locationIds.length < 1 || input.locationIds.length > 10) return "locationIds benötigt 1 bis 10 Einträge.";
  if (input.locationIds.some((id) => !id.trim() || id.trim().length > 160)) return "Jede locationId muss 1 bis 160 Zeichen enthalten.";
  if (!isIsoDate(input.windowStart) || !isIsoDate(input.windowEnd)) return "windowStart und windowEnd müssen gültige ISO-Datumswerte sein.";
  const start = Date.parse(input.windowStart);
  const end = Date.parse(input.windowEnd);
  if (end <= start) return "windowEnd muss nach windowStart liegen.";
  if (end - start > 10 * 60 * 1000) return "Die Glitch-Dauer darf maximal 10 Minuten betragen.";
  if (!isInteger(input.multiplierCap) || input.multiplierCap < 1 || input.multiplierCap > 10) return "multiplierCap muss ein Integer zwischen 1 und 10 sein.";
  if (!isInteger(input.maxParticipants) || input.maxParticipants < 1 || input.maxParticipants > 50) return "maxParticipants muss ein Integer zwischen 1 und 50 sein.";
  return requiredString(String(input.reason || ""), 5, 240, "reason");
}

export function validateGlitchCancel(input: AdminCancelGlitchInput): string | null {
  return requiredString(input.glitchEventId, 3, 160, "glitchEventId") || requiredString(input.reason, 5, 240, "reason");
}

export function validateSafetyReview(input: AdminReviewSafetyReportInput): string | null {
  return requiredString(input.reportId, 3, 160, "reportId") || (!SAFETY_DECISIONS.has(input.decision.trim()) ? "decision ist ungültig." : null) || requiredString(input.reason, 5, 240, "reason");
}

export function validateXpAdjust(input: AdminAdjustXpInput): string | null {
  return (
    requiredString(input.ownerUserId, 3, 160, "ownerUserId") ||
    (!isInteger(input.delta) || input.delta < -1000 || input.delta > 1000 || input.delta === 0 ? "delta muss ein Integer zwischen -1000 und 1000 sein und darf nicht 0 sein." : null) ||
    requiredString(input.reason, 5, 240, "reason") ||
    (input.idempotencyKey && input.idempotencyKey.trim().length > 180 ? "idempotencyKey darf maximal 180 Zeichen lang sein." : null)
  );
}
