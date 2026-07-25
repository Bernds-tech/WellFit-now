#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  MISSION_LIFECYCLE_STEPS,
  formatMissionDateKey,
  formatMissionTimeZone,
  getMissionStatusPresentation,
} from "../../lib/beta1/missionStatusPresentation.mjs";

function state(input) {
  return getMissionStatusPresentation(input);
}

assert.deepEqual(
  MISSION_LIFECYCLE_STEPS.map((step) => step.key),
  ["start", "evidence", "review", "reward"],
  "Der kanonische Ablauf muss Start, Bestätigung, Review und WFXP enthalten.",
);

const login = state({ ready: true, progressSource: "local" });
assert.equal(login.state, "login-required");
assert.equal(login.actionDisabled, true);
assert.equal(login.completedStepCount, 0);

const loading = state({ isAuthenticated: true, ready: false, progressSource: "local" });
assert.equal(loading.state, "loading");
assert.equal(loading.actionDisabled, true);

const unavailable = state({ isAuthenticated: true, ready: true, progressSource: "local" });
assert.equal(unavailable.state, "server-unavailable");
assert.equal(unavailable.refreshRecommended, true);
assert.equal(unavailable.actionDisabled, true);

const ready = state({ isAuthenticated: true, ready: true, progressSource: "server" });
assert.equal(ready.state, "ready");
assert.equal(ready.actionLabel, "Mission starten & bestätigen");
assert.equal(ready.completedStepCount, 0);
assert.equal(ready.actionDisabled, false);

const attempt = state({
  isAuthenticated: true,
  ready: true,
  progressSource: "server",
  isStarted: true,
});
assert.equal(attempt.state, "attempt-open");
assert.equal(attempt.canResume, true);
assert.equal(attempt.completedStepCount, 1);

const pending = state({
  isAuthenticated: true,
  ready: true,
  progressSource: "server",
  isStarted: true,
  reviewStatus: "pending-server-review",
});
assert.equal(pending.state, "review-pending");
assert.equal(pending.completedStepCount, 2);
assert.equal(pending.refreshRecommended, true);
assert.match(pending.detail, /keine WFXP/i);

const rejected = state({
  isAuthenticated: true,
  ready: true,
  progressSource: "server",
  isStarted: true,
  reviewStatus: "rejected",
});
assert.equal(rejected.state, "review-rejected");
assert.equal(rejected.actionLabel, "Bestätigung neu einreichen");
assert.match(rejected.detail, /weder ein zweiter Attempt noch eine doppelte Belohnung/i);

const needsMore = state({
  isAuthenticated: true,
  ready: true,
  progressSource: "server",
  isStarted: true,
  reviewStatus: "needs-more-evidence",
});
assert.equal(needsMore.state, "review-needs-more");
assert.equal(needsMore.canResume, true);

const approved = state({
  isAuthenticated: true,
  ready: true,
  progressSource: "server",
  isStarted: true,
  reviewStatus: "approved",
});
assert.equal(approved.state, "review-approved");
assert.equal(approved.completedStepCount, 3);
assert.match(approved.detail, /erst dieser Schritt schreibt WFXP/i);

const completed = state({
  isAuthenticated: true,
  ready: true,
  progressSource: "server",
  isStarted: true,
  isCompleted: true,
  reviewStatus: "approved",
});
assert.equal(completed.state, "completed");
assert.equal(completed.progress, 100);
assert.equal(completed.completedStepCount, 4);
assert.equal(completed.actionDisabled, true);

const processing = state({
  isAuthenticated: true,
  ready: true,
  progressSource: "server",
  isStarted: true,
  reviewStatus: "pending-server-review",
  actionBusy: true,
});
assert.equal(processing.state, "processing");
assert.equal(processing.actionDisabled, true);
assert.equal(processing.completedStepCount, 2, "Processing darf den erreichten Lifecycle-Fortschritt nicht verlieren.");
assert.match(processing.detail, /idempotent/i);

assert.equal(formatMissionDateKey("2026-07-25"), "25.07.2026");
assert.equal(formatMissionDateKey("invalid"), "invalid");
assert.equal(formatMissionTimeZone("Europe/Vienna"), "Europe/Vienna");
assert.equal(formatMissionTimeZone("America/Los_Angeles"), "America/Los Angeles");

console.log("WellFit mission status presentation unit tests erfolgreich.");
