import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { spawnSync } from "node:child_process";

function renderReportAndRead() {
  const run = spawnSync(process.execPath, ["scripts/wellfit-dev-agent/src/agent-control-center-check.mjs"], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  return fs.readFileSync("scripts/wellfit-dev-agent/output/agent-control-center-report.md", "utf8");
}

test("report removes legacy never-merge and never-deploy wording", () => {
  const report = renderReportAndRead();
  assert.equal(report.includes("Never merges PRs"), false);
  assert.equal(report.includes("Never deploys"), false);
});

test("report includes gated automation boundary wording", () => {
  const report = renderReportAndRead();
  assert.equal(report.includes("AGENT_CONTROL_CENTER_READY=true"), true);
  assert.equal(report.includes("Admin approval is the single human decision gate"), true);
  assert.equal(report.includes("Auto-Merge is gated by admin approval"), true);
  assert.equal(report.includes("Deploy is gated by admin approval"), true);
  assert.equal(report.includes("Never direct-writes main"), true);
  assert.equal(report.includes("Never bypasses quality gate"), true);
});

test("unrelated active merge/runner blocker keeps check failing", () => {
  const blockerPath = "project-register/quality-gate-known-blockers.json";
  const original = fs.readFileSync(blockerPath, "utf8");
  const parsed = JSON.parse(original);
  parsed.blockers.push({
    id: "test-unrelated-blocker",
    blockerId: "QG-TEST-UNRELATED",
    checkName: "synthetic",
    status: "active",
    blocksAutoMerge: true,
    blocksRealRunner: true
  });
  fs.writeFileSync(blockerPath, JSON.stringify(parsed, null, 2) + "\n", "utf8");
  try {
    const run = spawnSync(process.execPath, ["scripts/wellfit-dev-agent/src/agent-control-center-check.mjs"], { encoding: "utf8" });
    assert.notEqual(run.status, 0);
  } finally {
    fs.writeFileSync(blockerPath, original, "utf8");
  }
});


function isAutoMergeSafe(proposal) {
  const checksRequired = Array.isArray(proposal.checks_required) ? proposal.checks_required : [];
  return proposal.can_auto_merge !== true || (
    proposal.admin_approval_required === true
    && proposal.quality_gate_required === true
    && proposal.audit_required === true
    && proposal.direct_main_write_blocked === true
    && proposal.automation_control_required === true
    && proposal.protected_scope_owner_required === true
    && checksRequired.length > 0
  );
}

function isAutoDeploySafe(proposal) {
  if (proposal.can_auto_deploy !== true) return true;
  const checksRequired = Array.isArray(proposal.checks_required) ? proposal.checks_required : [];
  const policy = (proposal.deployment_policy && typeof proposal.deployment_policy === "object")
    ? proposal.deployment_policy
    : ((proposal.deploy_policy && typeof proposal.deploy_policy === "object") ? proposal.deploy_policy : null);
  const machineReadable = Boolean(policy);
  return proposal.admin_approval_required === true
    && proposal.quality_gate_required === true
    && proposal.audit_required === true
    && proposal.automation_control_required === true
    && proposal.direct_main_write_blocked === true
    && proposal.protected_scope_owner_required === true
    && checksRequired.length > 0
    && machineReadable
    && (policy.preview_supported === true || policy.preview === true)
    && (policy.staging_supported === true || policy.staging === true)
    && (policy.production_supported === true || policy.production === true)
    && policy.production_admin_approval_required === true
    && [false, true, "legacy_compat"].includes(policy.production_second_owner_approval_required)
    && policy.deploy_without_checks_allowed === false
    && policy.deploy_without_admin_approval_allowed === false;
}

test("auto-merge can pass with admin approval true and requires_human_approval false", () => {
  const proposal = {
    can_auto_merge: true,
    requires_human_approval: false,
    admin_approval_required: true,
    quality_gate_required: true,
    audit_required: true,
    direct_main_write_blocked: true,
    automation_control_required: true,
    protected_scope_owner_required: true,
    checks_required: ["Agent Control Center check"]
  };
  assert.equal(isAutoMergeSafe(proposal), true);
});

test("auto-merge fails without admin approval", () => {
  assert.equal(isAutoMergeSafe({ can_auto_merge: true, checks_required: ["x"] }), false);
});

test("auto-deploy fails without protected_scope_owner_required", () => {
  assert.equal(isAutoDeploySafe({ can_auto_deploy: true, admin_approval_required: true, quality_gate_required: true, audit_required: true, automation_control_required: true, direct_main_write_blocked: true, protected_scope_owner_required: false, checks_required: ["x"], deployment_policy: { preview_supported: true, staging_supported: true, production_supported: true, production_admin_approval_required: true, production_second_owner_approval_required: false, deploy_without_checks_allowed: false, deploy_without_admin_approval_allowed: false } }), false);
});

test("auto-deploy with freitext only owner approval fails", () => {
  assert.equal(isAutoDeploySafe({ can_auto_deploy: true, admin_approval_required: true, quality_gate_required: true, audit_required: true, automation_control_required: true, direct_main_write_blocked: true, protected_scope_owner_required: true, checks_required: ["x"], deploy_policy: "owner approval" }), false);
});

test("auto-deploy without machine-readable env policy fails", () => {
  assert.equal(isAutoDeploySafe({ can_auto_deploy: true, admin_approval_required: true, quality_gate_required: true, audit_required: true, automation_control_required: true, direct_main_write_blocked: true, protected_scope_owner_required: true, checks_required: ["x"], deployment_policy: { production_admin_approval_required: true } }), false);
});
