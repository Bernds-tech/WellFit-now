const {
  calculateBetaOperationsSnapshot,
  normalizedWindowDays,
  percentage,
  percentile,
} = require("../lib/beta1OperationsMetrics");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function doc(id, data) {
  return { id, data };
}

function onboarding(userId, completedAt, analyticsOptIn = false) {
  return doc(userId, {
    userId,
    ownerUserId: userId,
    status: "completed",
    completedAt,
    consentSummary: { anonymousAnalytics: analyticsOptIn },
  });
}

function run() {
  assert(normalizedWindowDays(7) === 7, "7-day window must be accepted.");
  assert(normalizedWindowDays(99) === 14, "Unknown window must fall back to 14 days.");
  assert(percentage(2, 4) === 50, "Percentage calculation is incorrect.");
  assert(percentile([1, 3, 2, 10], 0.5) === 2.5, "Median is incorrect.");
  assert(percentile([1, 3, 2, 10], 0.9) === 10, "P90 is incorrect.");

  const accounts = Array.from({ length: 6 }, (_, index) => onboarding(
    `unit-user-${index + 1}`,
    "2026-07-17T08:00:00.000Z",
    index < 3,
  ));

  const attempts = [
    doc("a1", { attemptId: "a1", ownerUserId: "unit-user-1", createdAt: "2026-07-17T09:00:00.000Z" }),
    doc("a2", { attemptId: "a2", ownerUserId: "unit-user-2", createdAt: "2026-07-17T09:10:00.000Z" }),
    doc("a3", { attemptId: "a3", ownerUserId: "unit-user-3", createdAt: "2026-07-17T09:20:00.000Z" }),
    doc("a4", { attemptId: "a4", ownerUserId: "unit-user-4", createdAt: "2026-07-17T09:30:00.000Z" }),
    doc("a5", { attemptId: "a5", ownerUserId: "unit-user-5", createdAt: "2026-07-18T10:00:00.000Z" }),
  ];

  const buddyActions = [1, 2, 3, 4].map((userNumber) => doc(`d1-${userNumber}`, {
    ownerUserId: `unit-user-${userNumber}`,
    status: "completed",
    completedAt: "2026-07-18T12:00:00.000Z",
  }));

  const evidence = [
    doc("e1", {
      attemptId: "a1",
      ownerUserId: "unit-user-1",
      reviewStatus: "approved",
      createdAt: "2026-07-20T08:00:00.000Z",
      reviewedAt: "2026-07-20T10:00:00.000Z",
    }),
    doc("e2", {
      attemptId: "a2",
      ownerUserId: "unit-user-2",
      reviewStatus: "rejected",
      createdAt: "2026-07-20T09:00:00.000Z",
      reviewedAt: "2026-07-20T13:00:00.000Z",
    }),
    doc("e3", {
      attemptId: "a3",
      ownerUserId: "unit-user-3",
      reviewStatus: "pending-server-review",
      createdAt: "2026-07-21T09:00:00.000Z",
    }),
  ];

  const completions = [1, 2, 3, 4].map((userNumber) => doc(`c${userNumber}`, {
    completionId: `c${userNumber}`,
    attemptId: `a${userNumber}`,
    ownerUserId: `unit-user-${userNumber}`,
    status: "completed",
    completedAt: "2026-07-24T15:00:00.000Z",
  }));

  const snapshot = calculateBetaOperationsSnapshot({
    now: new Date("2026-07-25T12:00:00.000Z"),
    windowDays: 14,
    collections: {
      onboarding: accounts,
      attempts,
      evidence,
      completions,
      buddyActions,
      ledger: [
        doc("l1", { ownerUserId: "unit-user-1", delta: 10, createdAt: "2026-07-24T15:01:00.000Z" }),
        doc("l2", { ownerUserId: "unit-user-2", delta: 20, createdAt: "2026-07-24T15:01:00.000Z" }),
        doc("l3", { ownerUserId: "unit-user-3", delta: -5, createdAt: "2026-07-24T15:01:00.000Z" }),
      ],
      safetyReports: [
        doc("s1", { status: "submitted", createdAt: "2026-07-23T10:00:00.000Z" }),
      ],
      exportJobs: [
        doc("x1", { status: "failed", failedAt: "2026-07-22T10:00:00.000Z" }),
      ],
      lifecycles: [
        doc("life1", { status: "deletion-blocked" }),
      ],
      patternReviews: [
        doc("p1", { recommendation: "manual-review-required", createdAt: "2026-07-22T10:00:00.000Z" }),
        doc("p2", { recommendation: "pattern-watchlist", createdAt: "2026-07-22T11:00:00.000Z" }),
      ],
      cooldownReviews: [
        doc("k1", { cooldownStatus: "hard-cooldown-recommended", createdAt: "2026-07-22T12:00:00.000Z" }),
        doc("k2", { cooldownStatus: "soft-cooldown-recommended", createdAt: "2026-07-22T13:00:00.000Z" }),
      ],
    },
  });

  assert(snapshot.accepted === true, "Snapshot must be accepted.");
  assert(snapshot.accounts.initializedTotal === 6, "Initialized account count is incorrect.");
  assert(snapshot.accounts.analyticsOptInTotal === 3, "Analytics opt-in count is incorrect.");
  assert(snapshot.accounts.activationEligibleAccounts === 6, "Activation denominator is incorrect.");
  assert(snapshot.accounts.activatedWithin24Hours === 4, "Activation count is incorrect.");
  assert(snapshot.accounts.activationRatePercent === 66.7, "Activation rate is incorrect.");
  assert(snapshot.retention.d1.suppressed === false, "D1 cohort must not be suppressed.");
  assert(snapshot.retention.d1.retainedAccounts === 5, "D1 retained count is incorrect.");
  assert(snapshot.retention.d1.ratePercent === 83.3, "D1 retention rate is incorrect.");
  assert(snapshot.retention.d7.retainedAccounts === 4, "D7 retained count is incorrect.");
  assert(snapshot.retention.d7.ratePercent === 66.7, "D7 retention rate is incorrect.");
  assert(snapshot.missions.starts === 5, "Mission starts are incorrect.");
  assert(snapshot.missions.evidenceSubmissions === 3, "Evidence submissions are incorrect.");
  assert(snapshot.missions.evidenceSubmissionRatePercent === 60, "Evidence rate is incorrect.");
  assert(snapshot.missions.completions === 4, "Completions are incorrect.");
  assert(snapshot.missions.completionRatePercent === 80, "Completion rate is incorrect.");
  assert(snapshot.evidence.pendingTotal === 1, "Pending evidence count is incorrect.");
  assert(snapshot.evidence.approvalRatePercent === 50, "Approval rate is incorrect.");
  assert(snapshot.evidence.medianReviewHours === 3, "Median review latency is incorrect.");
  assert(snapshot.evidence.p90ReviewHours === 4, "P90 review latency is incorrect.");
  assert(snapshot.economy.grantedInWindow === 30, "WFXP grant sum is incorrect.");
  assert(snapshot.operations.knownFailureSignals === 2, "Failure signal count is incorrect.");
  assert(snapshot.operations.riskSignalsInWindow === 4, "Risk signal count is incorrect.");
  assert(snapshot.daily.find((entry) => entry.dateKey === "2026-07-24").engagedUsers === 4, "Daily engaged users are incorrect.");

  const serialized = JSON.stringify(snapshot);
  assert(!serialized.includes("unit-user-1"), "Snapshot must not return user identifiers.");
  assert(!serialized.includes("@wellfit"), "Snapshot must not return email addresses.");
  assert(snapshot.privacy.returnsUserIdentifiers === false, "Privacy declaration must exclude user IDs.");
  assert(snapshot.economy.noMonetaryValue === true && snapshot.economy.cashoutAllowed === false, "Economy boundary is incorrect.");

  const suppressed = calculateBetaOperationsSnapshot({
    now: new Date("2026-07-25T12:00:00.000Z"),
    windowDays: 14,
    collections: {
      onboarding: accounts.slice(0, 4),
      attempts: [],
      evidence: [],
      completions: [],
      buddyActions: [],
      ledger: [],
      safetyReports: [],
      exportJobs: [],
      lifecycles: [],
      patternReviews: [],
      cooldownReviews: [],
    },
  });
  assert(suppressed.retention.d1.suppressed === true, "Small retention cohorts must be suppressed.");
  assert(suppressed.retention.d1.ratePercent === null, "Suppressed retention must not expose a rate.");

  console.log("WellFit Beta 1 Operations Metrics Unit Test successful.");
}

run();
