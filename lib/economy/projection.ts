import type { LedgerEvent } from "./ledger";

export type UserEconomyProjection = {
  pointsBalance: number;
  xpBalance: number;
  streakBalance: number;
  eventCount: number;
  lastEventAt?: string;
};

const isActiveLedgerEvent = (event: LedgerEvent) => {
  return event.status !== "voided" && event.status !== "rejected" && event.status !== "preview_only";
};

export const createEmptyUserEconomyProjection = (): UserEconomyProjection => ({
  pointsBalance: 0,
  xpBalance: 0,
  streakBalance: 0,
  eventCount: 0,
});

export const projectUserEconomyFromLedger = (events: LedgerEvent[]): UserEconomyProjection => {
  return events.reduce<UserEconomyProjection>((projection, event) => {
    if (!isActiveLedgerEvent(event)) {
      return projection;
    }

    return {
      pointsBalance: Math.max(0, projection.pointsBalance + (event.pointsDelta ?? 0)),
      xpBalance: Math.max(0, projection.xpBalance + (event.xpDelta ?? 0)),
      streakBalance: Math.max(0, projection.streakBalance + (event.streakDelta ?? 0)),
      eventCount: projection.eventCount + 1,
      lastEventAt: event.createdAt,
    };
  }, createEmptyUserEconomyProjection());
};

export const summarizeLedgerEventsForDisplay = (events: LedgerEvent[]) => {
  const projection = projectUserEconomyFromLedger(events);
  const manualReviewCount = events.filter((event) => event.status === "manual_review").length;
  const correctionCount = events.filter((event) => event.eventType === "ledger_correction").length;

  return {
    ...projection,
    manualReviewCount,
    correctionCount,
    hasReviewItems: manualReviewCount > 0,
    hasCorrections: correctionCount > 0,
  };
};
