#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const statusSource = readFileSync("lib/admin/agentCenterStatus.ts", "utf8");
const uiSource = readFileSync("app/admin/agent-center/AgentCenterInteractive.tsx", "utf8");

for (const expected of [
  "pending_approval",
  "approved",
  "rejected",
  "blocked",
  "revision_requested",
  "synced_to_task_proposal",
]) {
  assert.match(statusSource, new RegExp(`status === "${expected}"`), `server inbox status ${expected} is handled explicitly`);
  assert.match(uiSource, new RegExp(expected), `server inbox UI includes ${expected}`);
}

assert.match(uiSource, /activeCountSource:\s*\"server_inbox\"/, "activeCountSource exposes server_inbox as an explicit source");
assert.match(uiSource, /buildServerInboxCounts\(serverInboxRows\)/, "server counters are derived from serverInboxRows");
const serverTabsBlock = uiSource.slice(uiSource.indexOf("SERVER_FILTER_KEYS.map"), uiSource.indexOf("FILTER_KEYS.map"));
assert.doesNotMatch(serverTabsBlock, /data\.stats\[key\]/, "server tab counters must not use legacy data.stats");

const getBucket = (row) => {
  const status = typeof row.status === "string" ? row.status.toLowerCase() : "";
  if (status === "pending_approval") return "pending_approval";
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  if (status === "blocked") return "blocked";
  if (status === "revision_requested") return "revision_requested";
  if (status === "synced_to_task_proposal") return "synced_to_task_proposal";
  return "unknown";
};

const buildCounts = (rows) => rows.reduce((counts, row) => {
  counts[getBucket(row)] += 1;
  return counts;
}, {
  total: rows.length,
  pending_approval: 0,
  approved: 0,
  rejected: 0,
  blocked: 0,
  revision_requested: 0,
  synced_to_task_proposal: 0,
  unknown: 0,
});

const rows = [
  ...Array.from({ length: 7 }, (_, index) => ({ inboxId: `pending-${index}`, status: "pending_approval" })),
  { inboxId: "approved-0", status: "approved" },
  { inboxId: "approved-1", status: "APPROVED" },
  { inboxId: "blocked-0", status: "blocked" },
  { inboxId: "rejected-0", status: "rejected" },
  { inboxId: "revision-0", status: "revision_requested" },
  { inboxId: "synced-0", status: "synced_to_task_proposal" },
  { inboxId: "unknown-0", status: "paused" },
];

const counts = buildCounts(rows);
assert.equal(counts.total, 14, "14 server inbox rows are counted as total");
assert.equal(counts.pending_approval, 7, "pending_approval rows count in Server: wartet");
assert.equal(counts.approved, 2, "approved rows count in Server: freigegeben");
assert.equal(counts.blocked, 1, "blocked rows count in Server: blockiert");
assert.equal(counts.rejected, 1, "rejected rows count in Server: abgelehnt");
assert.equal(counts.revision_requested, 1, "revision_requested rows count in Server: Überarbeitung");
assert.equal(counts.synced_to_task_proposal, 1, "synced rows count in Server: Task Proposal erzeugt");
assert.equal(rows.filter((row) => getBucket(row) === "approved").length, 2, "approved rows stay visible in the approved server filter");

console.log("admin-center-server-inbox-counts-check: ok");
