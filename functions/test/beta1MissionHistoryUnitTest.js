const {
  buildMissionHistoryEntries,
  historyStatus,
  missionCategory,
} = require("../lib/beta1MissionHistory");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run() {
  assert(missionCategory({ missionId: "daily-water-1500" }) === "daily", "Daily category must be inferred.");
  assert(missionCategory({ catalogId: "wellfit-beta1-weekly-missions" }) === "weekly", "Weekly catalog must be inferred.");
  assert(missionCategory({ missionId: "challenge-reaction-test" }) === "challenge", "Challenge category must be inferred.");
  assert(missionCategory({ missionId: "adventure-city-sprint" }) === "adventure", "Adventure category must be inferred.");

  assert(historyStatus({
    attempt: { status: "completed" },
    completion: { status: "completed", xpLedgerEventId: "ledger-complete" },
  }) === "completed", "Completed status requires the completion and ledger record.");
  assert(historyStatus({
    attempt: { status: "completed" },
    completion: { status: "completed" },
  }) === "server-inconsistent", "A completion without ledger evidence must not appear as completed.");
  assert(historyStatus({
    attempt: { status: "evidence-approved" },
    evidence: { reviewStatus: "approved" },
  }) === "review-approved", "Approved evidence must stay distinct from completion.");

  const attempts = [
    {
      id: "attempt-pending",
      attemptId: "attempt-pending",
      missionId: "challenge-reaction-test",
      status: "evidence-submitted",
      locationId: "private-location-id",
      createdAt: "2026-07-22T08:00:00.000Z",
      updatedAt: "2026-07-22T08:05:00.000Z",
    },
    {
      id: "attempt-approved",
      attemptId: "attempt-approved",
      missionId: "weekly-active-days-5",
      status: "evidence-approved",
      weekKey: "2026-W30",
      timeZone: "Europe/Vienna",
      createdAt: "2026-07-23T08:00:00.000Z",
      updatedAt: "2026-07-23T09:00:00.000Z",
    },
    {
      id: "attempt-adventure",
      attemptId: "attempt-adventure",
      missionId: "adventure-city-sprint",
      status: "started",
      accessAuthorized: true,
      accessLedgerEventId: "private-access-ledger",
      accessCostWfxp: 12,
      childProfileId: "private-child-id",
      locationId: "private-adventure-location",
      createdAt: "2026-07-24T08:00:00.000Z",
    },
    {
      id: "attempt-completed",
      attemptId: "attempt-completed",
      missionId: "daily-water-1500",
      status: "completed",
      dateKey: "2026-07-25",
      timeZone: "Europe/Vienna",
      createdAt: "2026-07-25T07:00:00.000Z",
      updatedAt: "2026-07-25T08:00:00.000Z",
    },
  ];
  const evidence = [
    {
      id: "evidence-pending",
      attemptId: "attempt-pending",
      missionId: "challenge-reaction-test",
      reviewStatus: "pending-server-review",
      storageRef: "private-storage-reference",
      metadata: { raw: "private-evidence" },
      createdAt: "2026-07-22T08:05:00.000Z",
    },
    {
      id: "evidence-approved",
      attemptId: "attempt-approved",
      missionId: "weekly-active-days-5",
      reviewStatus: "approved",
      reviewedAt: "2026-07-23T09:00:00.000Z",
    },
    {
      id: "evidence-complete",
      attemptId: "attempt-completed",
      missionId: "daily-water-1500",
      reviewStatus: "approved",
      reviewedAt: "2026-07-25T07:30:00.000Z",
    },
  ];
  const completions = [
    {
      id: "completion-completed",
      completionId: "completion-completed",
      attemptId: "attempt-completed",
      missionId: "daily-water-1500",
      status: "completed",
      rewardXp: 9,
      xpLedgerEventId: "private-xp-ledger",
      completedAt: "2026-07-25T08:00:00.000Z",
      dateKey: "2026-07-25",
      timeZone: "Europe/Vienna",
    },
  ];
  const missions = [
    { missionId: "challenge-reaction-test", title: "Reaction Test", catalogId: "wellfit-beta1-challenge-missions" },
    { missionId: "weekly-active-days-5", title: "Fünf aktive Tage", catalogId: "wellfit-beta1-weekly-missions" },
    { missionId: "adventure-city-sprint", title: "City Sprint", catalogId: "wellfit-beta1-adventure-missions" },
    { missionId: "daily-water-1500", title: "Wasserziel", catalogId: "wellfit-beta1-daily-missions" },
  ];

  const entries = buildMissionHistoryEntries({ attempts, evidence, completions, missions, limit: 10 });
  assert(entries.length === 4, "All four attempts must become one history entry each.");
  assert(entries[0].missionId === "daily-water-1500", "History must be sorted newest first.");

  const completed = entries.find((entry) => entry.missionId === "daily-water-1500");
  assert(completed.status === "completed", "Completed mission must be server-confirmed.");
  assert(completed.rewardXp === 9 && completed.ledgerRecorded === true, "Completed reward must come from the ledger-backed completion.");
  assert(completed.periodType === "day" && completed.periodKey === "2026-07-25", "Daily period must be projected.");

  const pending = entries.find((entry) => entry.missionId === "challenge-reaction-test");
  assert(pending.status === "review-pending", "Pending evidence must stay pending.");
  assert(pending.actionRequired === false && pending.rewardXp === 0, "Pending evidence must not claim a reward or resubmission requirement.");
  assert(pending.isLocationBound === true, "Challenge history must retain only a location-bound boolean.");

  const approved = entries.find((entry) => entry.missionId === "weekly-active-days-5");
  assert(approved.status === "review-approved" && approved.actionRequired === true, "Approved evidence must request the explicit completion step.");
  assert(approved.periodType === "week" && approved.periodKey === "2026-W30", "Weekly period must be projected.");

  const adventure = entries.find((entry) => entry.missionId === "adventure-city-sprint");
  assert(adventure.status === "started", "Paid Adventure access without evidence must remain started.");
  assert(adventure.accessDebited === true && adventure.accessCostWfxp === 12, "Adventure history must show the one-time internal access state.");
  assert(adventure.childProfile === true, "Child scope may be represented only as a boolean.");

  const serialized = JSON.stringify(entries);
  for (const forbidden of [
    "attempt-completed",
    "evidence-pending",
    "private-storage-reference",
    "private-evidence",
    "private-location-id",
    "private-adventure-location",
    "private-xp-ledger",
    "private-access-ledger",
    "private-child-id",
  ]) {
    assert(!serialized.includes(forbidden), `History projection leaked forbidden value: ${forbidden}`);
  }
  assert(entries.every((entry) => entry.historyId.startsWith("history_") && entry.entryAuthority === "server-read"), "History entries need opaque IDs and server-read authority.");
  assert(entries.every((entry) => entry.noMonetaryValue === true), "All entries must preserve the non-monetary WFXP boundary.");

  const limited = buildMissionHistoryEntries({ attempts, evidence, completions, missions, limit: 2 });
  assert(limited.length === 2, "Requested history limit must be enforced.");

  console.log("WellFit Beta 1 Mission History Unit Test erfolgreich.");
}

run();
