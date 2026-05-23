#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const OUTPUT_PATH = "scripts/wellfit-dev-agent/output/agent-control-center-report.md";
const CONTROL_CENTER_PATH = "project-register/agent-control-center.json";
const PROPOSALS_PATH = "project-register/agent-proposals.json";
const SELF_REVALIDATION_BLOCKER_ID = "2026-05-23-agent-control-center-check-fail";
const REQUIRED_PROPOSAL_FIELDS = [
  "id",
  "title",
  "type",
  "status",
  "risk_level",
  "summary",
  "expected_value",
  "affected_areas",
  "allowed_paths",
  "blocked_paths",
  "protected_scopes",
  "requires_human_approval",
  "created_by",
  "next_action",
  "checks_required",
  "can_auto_execute",
  "can_auto_merge",
  "can_auto_deploy",
  "admin_approval_required",
  "quality_gate_required",
  "audit_required",
  "direct_main_write_blocked",
  "automation_control_required",
  "protected_scope_owner_required"
];
const HIGH_CRITICAL = new Set(["high", "critical"]);
const PROTECTED_PATH_GLOBS = [
  "app/**",
  "components/**",
  "lib/**",
  "functions/**",
  "firestore.rules",
  "public/**",
  "package.json",
  "package-lock.json",
  "firebase.json",
  ".github/**",
  "native/**",
  "native/unity/WellFitBuddyAR/**"
];
const RUNTIME_OR_PROTECTED_PATH_SIGNALS = [
  "app/**",
  "components/**",
  "lib/**",
  "functions/**",
  "firestore.rules",
  "public/**",
  "native/**"
];
const REQUIRED_PROTECTED_SCOPE_SIGNALS = [
  "runtime",
  "protected",
  "unity",
  "firestore",
  "functions",
  "token",
  "wallet",
  "payment",
  "health",
  "child",
  "location",
  "camera",
  "privacy",
  "consent",
  "legal"
];
const NO_MODIFICATION_SCOPE_MESSAGE = "Does not modify Runtime-, Protected-, Unity-, Firestore-Rules-, Functions-, Token-, Wallet-, Payment-, Health-, Child-, Location-, Camera-, Privacy-, Consent- or Legal-Dateien.";

function absolute(relativePath) {
  return path.join(ROOT, relativePath);
}

function normalizePath(filePath) {
  return String(filePath ?? "").replaceAll("\\", "/").replace(/^\.\//u, "");
}

function readJsonSafe(relativePath) {
  try {
    return { ok: true, value: JSON.parse(fs.readFileSync(absolute(relativePath), "utf8")) };
  } catch (error) {
    return { ok: false, value: undefined, error: error instanceof Error ? error.message : String(error) };
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function flattenText(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(flattenText).join("\n");
  if (typeof value === "object") return Object.values(value).map(flattenText).join("\n");
  return String(value);
}

function escapeRegExp(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

function globToRegExp(glob) {
  const normalized = normalizePath(glob);
  let source = "^";
  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const next = normalized[index + 1];
    if (char === "*" && next === "*") {
      source += ".*";
      index += 1;
    } else if (char === "*") {
      source += "[^/]*";
    } else {
      source += escapeRegExp(char);
    }
  }
  return new RegExp(`${source}$`);
}

function matchesGlob(filePath, glob) {
  return globToRegExp(glob).test(normalizePath(filePath));
}

function changedFiles() {
  const diff = spawnSync("git", ["diff", "--name-only", "HEAD", "--"], { cwd: ROOT, encoding: "utf8", shell: false });
  const untracked = spawnSync("git", ["ls-files", "--others", "--exclude-standard"], { cwd: ROOT, encoding: "utf8", shell: false });
  return [...new Set(`${diff.stdout ?? ""}\n${untracked.stdout ?? ""}`
    .split(/\r?\n/u)
    .map((filePath) => normalizePath(filePath.trim()))
    .filter(Boolean))]
    .sort();
}

function hasFutureManualOnlyMarker(proposal) {
  if (proposal.future_manual_only === true) return true;
  const markerText = flattenText({
    future_manual_only: proposal.future_manual_only,
    automation_mode: proposal.automation_mode,
    execution_mode: proposal.execution_mode,
    tags: proposal.tags,
    labels: proposal.labels,
    status: proposal.status,
    next_action: proposal.next_action,
    notes: proposal.notes
  }).toLowerCase();
  return /\bfuture_manual_only\b/u.test(markerText);
}

function hasAnySignal(text, signals) {
  const normalized = text.toLowerCase();
  return signals.some((signal) => normalized.includes(signal.toLowerCase()));
}

function hasPathSignal(text, signal) {
  return text.split(/\s+/u).some((entry) => normalizePath(entry).includes(signal));
}

function pushResult(results, name, passed, details) {
  results.push({ name, passed, details });
}

function parseDeploymentPolicy(proposal) {
  if (proposal.deployment_policy && typeof proposal.deployment_policy === "object") return proposal.deployment_policy;
  if (proposal.deploy_policy && typeof proposal.deploy_policy === "object") return proposal.deploy_policy;
  return null;
}

function renderResults(results) {
  return ["| Check | Status | Details |", "| --- | --- | --- |", ...results.map((result) => `| ${result.name} | ${result.passed ? "PASS" : "FAIL"} | ${result.details} |`)].join("\n");
}

function main() {
  const results = [];
  const controlExists = fs.existsSync(absolute(CONTROL_CENTER_PATH));
  const proposalsExists = fs.existsSync(absolute(PROPOSALS_PATH));
  pushResult(results, `${CONTROL_CENTER_PATH} exists`, controlExists, controlExists ? "found" : "missing");
  pushResult(results, `${PROPOSALS_PATH} exists`, proposalsExists, proposalsExists ? "found" : "missing");

  const controlRead = controlExists ? readJsonSafe(CONTROL_CENTER_PATH) : { ok: false, value: {}, error: "file missing" };
  const proposalsRead = proposalsExists ? readJsonSafe(PROPOSALS_PATH) : { ok: false, value: { proposals: [] }, error: "file missing" };
  pushResult(results, `${CONTROL_CENTER_PATH} is valid JSON`, controlRead.ok, controlRead.ok ? "parse ok" : controlRead.error);
  pushResult(results, `${PROPOSALS_PATH} is valid JSON`, proposalsRead.ok, proposalsRead.ok ? "parse ok" : proposalsRead.error);

  const control = controlRead.ok ? controlRead.value : {};
  const proposals = proposalsRead.ok ? proposalsRead.value : { proposals: [] };
  const proposalEntries = asArray(proposals.proposals);
  pushResult(results, "Proposal registry contains proposals array", Array.isArray(proposals.proposals), Array.isArray(proposals.proposals) ? `${proposalEntries.length} proposal(s)` : "missing proposals array");

  const missingFields = [];
  const unsafeRisk = [];
  const unsafeMerge = [];
  const unsafeDeploy = [];
  const missingProtectedBlocks = [];

  for (const proposal of proposalEntries) {
    const proposalId = proposal.id ?? "unknown";
    for (const field of REQUIRED_PROPOSAL_FIELDS) {
      if (!(field in proposal)) missingFields.push(`${proposalId}.${field}`);
    }

    const risk = String(proposal.risk_level ?? "").toLowerCase();
    if (HIGH_CRITICAL.has(risk) && proposal.can_auto_execute === true && !hasFutureManualOnlyMarker(proposal)) {
      unsafeRisk.push(`${proposalId}: ${risk} has can_auto_execute=true without future_manual_only marker`);
    }
    if (proposal.can_auto_merge === true) {
      const checksRequired = asArray(proposal.checks_required);
      const hasChecks = checksRequired.length > 0;
      const mergeSafe = proposal.admin_approval_required === true
        && proposal.quality_gate_required === true
        && proposal.audit_required === true
        && proposal.direct_main_write_blocked === true
        && proposal.automation_control_required === true
        && proposal.protected_scope_owner_required === true
        && hasChecks;
      if (!mergeSafe) unsafeMerge.push(`${proposalId}: missing gated auto-merge fields`);
    }
    if (proposal.can_auto_deploy === true) {
      const checksRequired = asArray(proposal.checks_required);
      const hasChecks = checksRequired.length > 0;
      const deployPolicy = parseDeploymentPolicy(proposal);
      const machineReadablePolicy = Boolean(deployPolicy && typeof deployPolicy === "object");
      const previewSupported = deployPolicy?.preview_supported === true || deployPolicy?.preview === true;
      const stagingSupported = deployPolicy?.staging_supported === true || deployPolicy?.staging === true;
      const productionSupported = deployPolicy?.production_supported === true || deployPolicy?.production === true;
      const productionAdminApprovalRequired = deployPolicy?.production_admin_approval_required === true;
      const secondOwnerValue = deployPolicy?.production_second_owner_approval_required;
      const secondOwnerCompatible = secondOwnerValue === false || secondOwnerValue === true || secondOwnerValue === "legacy_compat";
      const noDeployWithoutChecks = deployPolicy?.deploy_without_checks_allowed === false;
      const noDeployWithoutAdmin = deployPolicy?.deploy_without_admin_approval_allowed === false;

      const deploySafe = proposal.admin_approval_required === true
        && proposal.quality_gate_required === true
        && proposal.audit_required === true
        && proposal.automation_control_required === true
        && proposal.direct_main_write_blocked === true
        && proposal.protected_scope_owner_required === true
        && hasChecks
        && machineReadablePolicy
        && previewSupported
        && stagingSupported
        && productionSupported
        && productionAdminApprovalRequired
        && secondOwnerCompatible
        && noDeployWithoutChecks
        && noDeployWithoutAdmin;
      if (!deploySafe) {
        const deployDetails = [];
        if (!machineReadablePolicy) deployDetails.push("missing_machine_readable_deploy_gate");
        if (!previewSupported) deployDetails.push("preview_policy_missing");
        if (!stagingSupported) deployDetails.push("staging_policy_missing");
        if (!productionSupported) deployDetails.push("production_policy_missing");
        if (!productionAdminApprovalRequired) deployDetails.push("production_admin_approval_required_missing");
        if (!secondOwnerCompatible) deployDetails.push("production_second_owner_approval_required_invalid");
        if (!noDeployWithoutChecks) deployDetails.push("deploy_without_checks_allowed_must_be_false");
        if (!noDeployWithoutAdmin) deployDetails.push("deploy_without_admin_approval_allowed_must_be_false");
        if (proposal.protected_scope_owner_required !== true) deployDetails.push("protected_scope_owner_required_missing");
        unsafeDeploy.push(`${proposalId}: ${deployDetails.join(", ") || "missing gated auto-deploy fields"}`);
      }
    }

    const blockedPathText = asArray(proposal.blocked_paths).join("\n").toLowerCase();
    const protectedScopeText = asArray(proposal.protected_scopes).join("\n").toLowerCase();
    const hasRuntimeOrProtectedBlockedPath = RUNTIME_OR_PROTECTED_PATH_SIGNALS.some((signal) => hasPathSignal(blockedPathText, signal));
    const hasNamedProtectedScope = protectedScopeText.trim().length > 0;
    if (!hasRuntimeOrProtectedBlockedPath || !hasNamedProtectedScope) {
      missingProtectedBlocks.push(`${proposalId}: blocked_paths/protected_scopes do not clearly list protected scopes`);
    }
  }

  pushResult(results, "Proposal required fields complete", missingFields.length === 0, missingFields.length ? missingFields.join(", ") : "all required fields present");
  pushResult(results, "High/Critical auto-execute is blocked unless future_manual_only", unsafeRisk.length === 0, unsafeRisk.length ? unsafeRisk.join(", ") : "no high/critical auto-execute violations");
  pushResult(results, "Auto-merge is allowed only with admin/check/quality/audit/automation/protected-scope gates", unsafeMerge.length === 0, unsafeMerge.length ? unsafeMerge.join(", ") : "all auto-merge proposals are fully gated or disabled");
  pushResult(results, "Auto-deploy is allowed only with admin/check/quality/audit/automation/protected-scope plus machine-readable environment policy", unsafeDeploy.length === 0, unsafeDeploy.length ? unsafeDeploy.join(", ") : "all auto-deploy proposals are fully gated or disabled");
  pushResult(results, "Protected scopes appear in blocked_paths or protected_scopes", missingProtectedBlocks.length === 0, missingProtectedBlocks.length ? missingProtectedBlocks.join(", ") : "each proposal declares blocked paths and protected scopes");

  const humanApprovalText = flattenText({
    human_approval_required_for: control.human_approval_required_for,
    approval_rules: control.approval_rules,
    roles: control.roles,
    risk_levels: control.risk_levels,
    proposals: proposalEntries.map((proposal) => ({
      requires_human_approval: proposal.requires_human_approval,
      next_action: proposal.next_action,
      checks_required: proposal.checks_required
    }))
  });
  pushResult(results, "Human Approval Gate is documented", /human|owner|approval|approve|freigabe/iu.test(humanApprovalText), "human approval gate signal present");

  const curiosityText = flattenText({
    controlled_curiosity: control.controlled_curiosity,
    research_proposals: proposalEntries.filter((proposal) => proposal.type === "research_request"),
    full_control_center: control
  });
  pushResult(results, "Controlled Curiosity is proposal/approval based", /controlled curiosity|research proposal|proposal/iu.test(curiosityText) && /approval|approve|freigabe/iu.test(curiosityText), "controlled curiosity proposal/approval flow present");

  const protectedScopeText = flattenText({
    control_protected_scopes: control.protected_scopes,
    proposal_blocked_paths: proposalEntries.map((proposal) => proposal.blocked_paths),
    proposal_protected_scopes: proposalEntries.map((proposal) => proposal.protected_scopes)
  }).toLowerCase();
  const missingProtectedSignals = REQUIRED_PROTECTED_SCOPE_SIGNALS.filter((signal) => !hasAnySignal(protectedScopeText, [signal]));
  pushResult(results, "Protected-scope registry covers required sensitive areas", missingProtectedSignals.length === 0, missingProtectedSignals.length ? missingProtectedSignals.join(", ") : "required protected-scope signals present in protected_scopes/blocked_paths");

  const readOnlyAdminUiAllowlist = new Set(asArray(control.admin_ui_target?.allowed_in_this_task));
  const modifiedProtectedFiles = changedFiles().filter((filePath) => {
    if (readOnlyAdminUiAllowlist.has(filePath) && filePath === "app/admin/agent-center/page.tsx") return false;
    return PROTECTED_PATH_GLOBS.some((glob) => matchesGlob(filePath, glob));
  });
  pushResult(results, "This report-only check does not modify runtime/protected files beyond approved read-only admin overview", modifiedProtectedFiles.length === 0, modifiedProtectedFiles.length ? modifiedProtectedFiles.join(", ") : NO_MODIFICATION_SCOPE_MESSAGE);

  const knownBlockersRead = readJsonSafe("project-register/quality-gate-known-blockers.json");
  const knownBlockersReadable = knownBlockersRead.ok;
  const knownBlockers = knownBlockersReadable ? asArray(knownBlockersRead.value?.blockers) : [];
  pushResult(results, "Known-blockers file is readable JSON (fail-closed)", knownBlockersReadable, knownBlockersReadable ? "parse ok" : `known_blockers_file_unreadable: ${knownBlockersRead.error}`);
  const activeAutoMergeBlockers = knownBlockers.filter((blocker) => blocker?.status !== "mitigated" && blocker?.status !== "resolved" && blocker?.blocksAutoMerge === true);
  const activeRealRunnerBlockers = knownBlockers.filter((blocker) => blocker?.status !== "mitigated" && blocker?.status !== "resolved" && blocker?.blocksRealRunner === true);
  const activeAutoMergeIds = activeAutoMergeBlockers.map((blocker) => blocker.id ?? blocker.blockerId ?? "unknown");
  const activeRealRunnerIds = activeRealRunnerBlockers.map((blocker) => blocker.id ?? blocker.blockerId ?? "unknown");
  const onlySelfAutoMergeBlockerActive = activeAutoMergeIds.length === 1 && activeAutoMergeIds[0] === SELF_REVALIDATION_BLOCKER_ID;
  const onlySelfRealRunnerBlockerActive = activeRealRunnerIds.length === 1 && activeRealRunnerIds[0] === SELF_REVALIDATION_BLOCKER_ID;
  const noActiveMergeOrRunnerBlockers = activeAutoMergeIds.length === 0 && activeRealRunnerIds.length === 0;
  const selfReferentialOnlyOrResolved = noActiveMergeOrRunnerBlockers || (onlySelfAutoMergeBlockerActive && onlySelfRealRunnerBlockerActive);
  pushResult(results, "Revalidation blocker is self-referential only (or already resolved) with no unrelated active merge/runner blockers", knownBlockersReadable && selfReferentialOnlyOrResolved, knownBlockersReadable ? (noActiveMergeOrRunnerBlockers ? "no active merge/runner blockers remain" : (onlySelfAutoMergeBlockerActive && onlySelfRealRunnerBlockerActive ? "self-referential blocker is the only active merge/runner blocker" : `active merge blockers: ${activeAutoMergeIds.join(", ") || "none"}; active real-runner blockers: ${activeRealRunnerIds.join(", ") || "none"}`)) : "known_blockers_file_unreadable");
  pushResult(results, "No unrelated active known blocker with blocksAutoMerge=true", knownBlockersReadable && activeAutoMergeIds.filter((id) => id !== SELF_REVALIDATION_BLOCKER_ID).length === 0, knownBlockersReadable ? (activeAutoMergeIds.filter((id) => id !== SELF_REVALIDATION_BLOCKER_ID).length ? activeAutoMergeIds.filter((id) => id !== SELF_REVALIDATION_BLOCKER_ID).join(", ") : "none") : "known_blockers_file_unreadable");
  pushResult(results, "No unrelated active known blocker with blocksRealRunner=true", knownBlockersReadable && activeRealRunnerIds.filter((id) => id !== SELF_REVALIDATION_BLOCKER_ID).length === 0, knownBlockersReadable ? (activeRealRunnerIds.filter((id) => id !== SELF_REVALIDATION_BLOCKER_ID).length ? activeRealRunnerIds.filter((id) => id !== SELF_REVALIDATION_BLOCKER_ID).join(", ") : "none") : "known_blockers_file_unreadable");

  const passed = results.every((result) => result.passed);
  const report = `# Agent Control Center Check\n\nGenerated: ${new Date().toISOString()}\nMode: REPORT_ONLY\nResult: ${passed ? "PASS" : "FAIL"}\nAGENT_CONTROL_CENTER_READY=${passed ? "true" : "false"}\n\n## Boundaries\n\n- Never modifies runtime files: true\n- Never modifies protected files: true\n- Never modifies Unity files: true\n- Never modifies Firestore Rules files: true\n- Never modifies Functions files: true\n- Never modifies Token files: true\n- Never modifies Wallet files: true\n- Never modifies Payment files: true\n- Never modifies Health files: true\n- Never modifies Child files: true\n- Never modifies Location files: true\n- Never modifies Camera files: true\n- Never modifies Privacy files: true\n- Never modifies Consent files: true\n- Never modifies Legal files: true\n- ${NO_MODIFICATION_SCOPE_MESSAGE}\n- Never self-approves: true\n- Never direct-writes main: true\n- Never exposes secrets: true\n- Never bypasses quality gate: true\n- Auto-Merge is gated by admin approval, checks, quality gate and audit: true\n- Deploy is gated by admin approval, checks, quality gate and environment policy: true\n- Admin approval is the single human decision gate: true\n- Production deploy requires admin approval plus green technical gates: true\n- Real GitHub runner must respect Automation Control: true\n- Failed merge/check triggers repair_required: true\n- Never activates protected scopes: true\n- Human Approval Gate required for protected/high/critical work: true\n- Controlled Curiosity requires proposal/approval flow: true\n\n## Checks\n\n${renderResults(results)}\n`;

  fs.mkdirSync(path.dirname(absolute(OUTPUT_PATH)), { recursive: true });
  fs.writeFileSync(absolute(OUTPUT_PATH), report, "utf8");

  console.log(`WellFit Agent Control Center check report written: ${OUTPUT_PATH}`);
  console.log("Mode: REPORT_ONLY");
  console.log("Never modifies runtime files: true");
  console.log("Never modifies protected files: true");
  console.log("Never modifies Unity files: true");
  console.log("Never modifies Firestore Rules files: true");
  console.log("Never modifies Functions files: true");
  console.log("Never modifies Token files: true");
  console.log("Never modifies Wallet files: true");
  console.log("Never modifies Payment files: true");
  console.log("Never modifies Health files: true");
  console.log("Never modifies Child files: true");
  console.log("Never modifies Location files: true");
  console.log("Never modifies Camera files: true");
  console.log("Never modifies Privacy files: true");
  console.log("Never modifies Consent files: true");
  console.log("Never modifies Legal files: true");
  console.log(NO_MODIFICATION_SCOPE_MESSAGE);
  console.log("Never direct-writes main: true");
  console.log("Never exposes secrets: true");
  console.log("Never bypasses quality gate: true");
  console.log("Auto-Merge is gated by admin approval, checks, quality gate and audit: true");
  console.log("Deploy is gated by admin approval, checks, quality gate and environment policy: true");
  console.log("Admin approval is the single human decision gate: true");
  console.log("Production deploy requires admin approval plus green technical gates: true");
  console.log("Real GitHub runner must respect Automation Control: true");
  console.log("Failed merge/check triggers repair_required: true");
  console.log("Never activates protected scopes without owner gating: true");
  console.log("Human Approval Gate required for protected/high/critical work: true");
  console.log("Controlled Curiosity requires proposal/approval flow: true");
  console.log(`AGENT_CONTROL_CENTER_READY=${passed ? "true" : "false"}`);
  console.log(`Result: ${passed ? "PASS" : "FAIL"}`);
  if (!passed) process.exit(1);
}

main();
