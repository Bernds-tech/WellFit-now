import type { BuilderWorkPackage } from "@/lib/admin/beta1AdminTypes";

export type BuilderQueueBucket = "waiting" | "next_up" | "active" | "blocked" | "repair_required" | "completed" | "paused" | "proposed" | "cancelled" | "unknown";

export function getBuilderWorkPackageExecutionOrder(item: BuilderWorkPackage): number {
  const executionOrder = Number(item.executionOrder ?? item.sequenceNumber ?? 0);
  return Number.isFinite(executionOrder) ? executionOrder : 0;
}

export function getBuilderQueueBucket(item: BuilderWorkPackage): BuilderQueueBucket {
  const status = String(item.status || "").toLowerCase();
  if (status === "approved_waiting") return "waiting";
  if (status === "next_up") return "next_up";
  if (status === "active_metadata_only") return "active";
  if (["blocked_by_existing_active_work", "blocked_by_failed_checks", "blocked_by_stale_base", "blocked_by_guard", "blocked_by_missing_github_credentials", "blocked_by_protected_files", "blocked_by_reapproval_required"].includes(status)) return "blocked";
  if (status === "repair_required") return "repair_required";
  if (status === "completed_metadata_only") return "completed";
  if (status === "paused_by_owner") return "paused";
  if (status === "proposed") return "proposed";
  if (status === "cancelled") return "cancelled";
  return "unknown";
}

export function buildBuilderQueueCounts(items: BuilderWorkPackage[]) {
  const counts: Record<BuilderQueueBucket, number> & { total: number } = { total: items.length, waiting: 0, next_up: 0, active: 0, blocked: 0, repair_required: 0, completed: 0, paused: 0, proposed: 0, cancelled: 0, unknown: 0 };
  items.forEach((item) => { counts[getBuilderQueueBucket(item)] += 1; });
  return counts;
}

export function sortBuilderWorkPackagesForDisplay(items: BuilderWorkPackage[]): BuilderWorkPackage[] {
  return [...items].sort((a, b) => {
    const orderDiff = getBuilderWorkPackageExecutionOrder(a) - getBuilderWorkPackageExecutionOrder(b);
    if (orderDiff !== 0) return orderDiff;
    return String(a.workPackageId || "").localeCompare(String(b.workPackageId || ""));
  });
}

export function buildVisibleBuilderWorkPackages(items: BuilderWorkPackage[]): BuilderWorkPackage[] {
  return sortBuilderWorkPackagesForDisplay(items);
}

export function isNextUpWorkPackage(item: BuilderWorkPackage, nextUpWorkPackageId?: string | null): boolean {
  const itemId = String(item.workPackageId || "");
  return itemId.length > 0 && itemId === String(nextUpWorkPackageId || "");
}

export function isNextUpMissingFromSnapshotList(items: BuilderWorkPackage[], nextUpWorkPackageId?: string | null): boolean {
  const nextUpId = String(nextUpWorkPackageId || "");
  if (!nextUpId) return false;
  return !items.some((item) => String(item.workPackageId || "") === nextUpId);
}

export function getBuilderPrPrepareButtonReason(item: BuilderWorkPackage, nextUpWorkPackageId?: string | null, adminCallableAuthReady = true): string {
  const status = String(item.status || "").toLowerCase();
  if (!adminCallableAuthReady) return "Admin-Auth fehlt";
  if (!item.workPackageId) return "Work Package ID fehlt";
  if (!isNextUpWorkPackage(item, nextUpWorkPackageId)) return "Wartet auf vorheriges Work Package";
  if (status !== "next_up") return "Nur next_up kann Branch/PR vorbereiten.";
  if (item.reapprovalRequired === true) return "Reapproval erforderlich";
  if (item.ownerApproved !== true || item.ownerDecisionPersistent !== true || item.approvedForSerialExecution !== true) return "Owner-/Serial-Freigabe fehlt";
  return "";
}

export function buildBuilderWorkPackageDebug(items: BuilderWorkPackage[], renderedItems: BuilderWorkPackage[], nextUpWorkPackageId?: string | null, countTotal?: number) {
  const snapshotListCount = items.length;
  const renderedCardCount = renderedItems.length;
  const snapshotCountTotal = Number(countTotal ?? snapshotListCount);
  return {
    nextUpWorkPackageId: String(nextUpWorkPackageId || ""),
    snapshotListCount,
    renderedCardCount,
    snapshotCountTotal,
    nextUpMissingFromSnapshotList: isNextUpMissingFromSnapshotList(items, nextUpWorkPackageId),
    renderedCountMismatch: snapshotListCount !== renderedCardCount,
    snapshotTotalMismatch: snapshotCountTotal !== snapshotListCount,
  };
}
