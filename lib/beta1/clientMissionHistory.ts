import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase";

export type MissionHistoryStatus = "started" | "review-pending" | "review-approved" | "rejected" | "needs-more-evidence" | "completed" | "server-inconsistent";
export type MissionHistoryCategory = "daily" | "weekly" | "challenge" | "adventure" | "mission";
export type MissionHistoryEntry = {
  historyId: string;
  missionId: string;
  title: string;
  category: MissionHistoryCategory;
  categoryLabel: string;
  icon: string;
  status: MissionHistoryStatus;
  reviewStatus: "pending-server-review" | "approved" | "rejected" | "needs-more-evidence" | null;
  actionRequired: boolean;
  serverAttentionRequired: boolean;
  occurredAt: string | null;
  completedAt: string | null;
  rewardXp: number;
  ledgerRecorded: boolean;
  periodType: "day" | "week" | "none";
  periodKey: string | null;
  timeZone: string | null;
  isLocationBound: boolean;
  accessDebited: boolean;
  accessCostWfxp: number;
  childProfile: boolean;
  source: "server-mission-history";
  entryAuthority: "server-read";
  noMonetaryValue: true;
};
export type MissionHistoryResult = {
  entries: MissionHistoryEntry[];
  count: number;
  requestedLimit: number;
  scanTruncated: boolean;
  generatedAt: string;
  historyVersion: string;
  progressAuthority: "server-read";
  noMonetaryValue: true;
};

type RawResponse = Record<string, unknown> & { entries?: unknown };
const statuses = new Set(["started", "review-pending", "review-approved", "rejected", "needs-more-evidence", "completed", "server-inconsistent"]);
const categories = new Set(["daily", "weekly", "challenge", "adventure", "mission"]);
const periods = new Set(["day", "week", "none"]);
const reviews = new Set(["pending-server-review", "approved", "rejected", "needs-more-evidence"]);
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
const text = (value: unknown, field: string) => {
  if (typeof value !== "string" || !value.trim()) throw new Error(`Ungültige Mission-History: ${field} fehlt.`);
  return value.trim();
};
const nullableText = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : null;
const count = (value: unknown) => Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;

function parseEntry(value: unknown): MissionHistoryEntry {
  if (!isRecord(value)) throw new Error("Ungültiger Mission-History-Eintrag.");
  const status = text(value.status, "status");
  const category = text(value.category, "category");
  const periodType = text(value.periodType, "periodType");
  const reviewStatus = nullableText(value.reviewStatus);
  if (!statuses.has(status) || !categories.has(category) || !periods.has(periodType) || (reviewStatus && !reviews.has(reviewStatus))) {
    throw new Error("Unbekannter Mission-History-Status oder -Typ.");
  }
  if (value.source !== "server-mission-history" || value.entryAuthority !== "server-read" || value.noMonetaryValue !== true) {
    throw new Error("Mission-History besitzt keine gültige Serverautorität.");
  }
  return {
    historyId: text(value.historyId, "historyId"),
    missionId: text(value.missionId, "missionId"),
    title: text(value.title, "title"),
    category: category as MissionHistoryCategory,
    categoryLabel: text(value.categoryLabel, "categoryLabel"),
    icon: text(value.icon, "icon"),
    status: status as MissionHistoryStatus,
    reviewStatus: reviewStatus as MissionHistoryEntry["reviewStatus"],
    actionRequired: value.actionRequired === true,
    serverAttentionRequired: value.serverAttentionRequired === true,
    occurredAt: nullableText(value.occurredAt),
    completedAt: nullableText(value.completedAt),
    rewardXp: count(value.rewardXp),
    ledgerRecorded: value.ledgerRecorded === true,
    periodType: periodType as MissionHistoryEntry["periodType"],
    periodKey: nullableText(value.periodKey),
    timeZone: nullableText(value.timeZone),
    isLocationBound: value.isLocationBound === true,
    accessDebited: value.accessDebited === true,
    accessCostWfxp: count(value.accessCostWfxp),
    childProfile: value.childProfile === true,
    source: "server-mission-history",
    entryAuthority: "server-read",
    noMonetaryValue: true,
  };
}

function errorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code ?? "") : "";
  const message = error instanceof Error ? error.message : "";
  const diagnostic = `${code} ${message}`.toLowerCase();
  if (diagnostic.includes("unauthenticated")) return "Bitte melde dich an, um deinen serverseitigen Missionsverlauf zu sehen.";
  if (diagnostic.includes("permission-denied")) return "Der Missionsverlauf konnte deinem Konto nicht sicher zugeordnet werden.";
  if (diagnostic.includes("network") || diagnostic.includes("unavailable")) return "Der sichere Missionsverlauf ist gerade nicht erreichbar.";
  return message || "Der serverseitige Missionsverlauf konnte nicht geladen werden.";
}

export async function fetchMissionHistory(limit = 50): Promise<MissionHistoryResult> {
  if (!auth.currentUser) throw new Error("Bitte melde dich an, um deinen serverseitigen Missionsverlauf zu sehen.");
  try {
    const requestedLimit = Math.min(Math.max(1, Math.floor(Number(limit) || 50)), 100);
    const callable = httpsCallable<{ limit: number }, RawResponse>(getFunctions(), "getMissionHistory");
    const { data } = await callable({ limit: requestedLimit });
    if (data.accepted !== true || data.progressAuthority !== "server-read" || data.noMonetaryValue !== true || data.tokenAuthorized === true || data.cashoutAllowed === true || data.realMoney === true || data.rawEvidenceIncluded !== false || data.rawLocationIncluded !== false || data.userIdentifiersIncluded !== false || data.recordIdentifiersIncluded !== false || data.writesPerformed !== false || !Array.isArray(data.entries)) {
      throw new Error("Ungültige serverseitige Mission-History-Projektion.");
    }
    return {
      entries: data.entries.map(parseEntry),
      count: count(data.count),
      requestedLimit: count(data.requestedLimit),
      scanTruncated: data.scanTruncated === true,
      generatedAt: text(data.generatedAt, "generatedAt"),
      historyVersion: text(data.historyVersion, "historyVersion"),
      progressAuthority: "server-read",
      noMonetaryValue: true,
    };
  } catch (error) {
    throw new Error(errorMessage(error), { cause: error });
  }
}
