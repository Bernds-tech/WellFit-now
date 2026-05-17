#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, "scripts", "wellfit-dev-agent", "wellfit-agent.config.json");

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
}

function warn(message) {
  console.warn(`WARN: ${message}`);
}

function info(message) {
  console.log(`OK: ${message}`);
}

function readConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    fail(`Missing config at ${CONFIG_PATH}`);
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  } catch (error) {
    fail(`Invalid JSON config: ${error.message}`);
    return null;
  }
}

function normalize(value) {
  return String(value).trim().toLowerCase();
}

function validateIdentityGate(config) {
  if (!config.identityGate?.enabled) {
    fail("identityGate.enabled must be true.");
    return;
  }

  if (!config.identityGate.requiredQuestion?.includes("Coder")) {
    fail("identityGate.requiredQuestion must explicitly ask for the Coder role.");
  } else {
    info("identity gate requires coder identification.");
  }

  if (config.identityGate.rejectUnknownIdentity !== true) {
    fail("identityGate.rejectUnknownIdentity must be true.");
  } else {
    info("unknown coder identities are rejected.");
  }
}

function validateCoderRegistry(config) {
  const coders = config.coderAssignment?.coders ?? [];

  if (!config.coderAssignment?.enabled) {
    fail("coderAssignment.enabled must be true.");
  }

  if (!config.coderAssignment?.dynamicRegistry) {
    fail("coderAssignment.dynamicRegistry must be true for scalability.");
  }

  if (coders.length < 1) {
    fail("At least one coder must be registered.");
    return;
  }

  const ids = new Set();
  const displayNames = new Set();
  const selfNames = new Set();

  for (const coder of coders) {
    if (!coder.id) fail("Coder missing id.");
    if (!coder.displayName) fail(`Coder ${coder.id ?? "unknown"} missing displayName.`);
    if (!coder.role) fail(`Coder ${coder.id ?? "unknown"} missing role.`);
    if (!Array.isArray(coder.selfNames) || coder.selfNames.length === 0) {
      fail(`Coder ${coder.id ?? "unknown"} must define selfNames.`);
    }
    if (!Array.isArray(coder.focusKeywords) || coder.focusKeywords.length === 0) {
      warn(`Coder ${coder.id ?? "unknown"} has no focusKeywords.`);
    }

    const idKey = normalize(coder.id);
    const displayKey = normalize(coder.displayName);

    if (ids.has(idKey)) fail(`Duplicate coder id: ${coder.id}`);
    ids.add(idKey);

    if (displayNames.has(displayKey)) fail(`Duplicate coder displayName: ${coder.displayName}`);
    displayNames.add(displayKey);

    for (const selfName of coder.selfNames ?? []) {
      const selfNameKey = normalize(selfName);
      if (selfNames.has(selfNameKey)) fail(`Duplicate coder selfName: ${selfName}`);
      selfNames.add(selfNameKey);
    }
  }

  info(`coder registry contains ${coders.length} coder(s).`);
}

function validateTodoMutationPolicy(config) {
  const policy = config.todoMutationPolicy;

  if (!policy?.enabled) {
    fail("todoMutationPolicy.enabled must be true.");
    return;
  }

  if (policy.allowDeleteTodoEntries !== false) {
    fail("todoMutationPolicy.allowDeleteTodoEntries must be false.");
  }

  if (policy.allowDeleteRoadmapSections !== false) {
    fail("todoMutationPolicy.allowDeleteRoadmapSections must be false.");
  }

  const allowed = new Set(policy.allowedMutations ?? []);
  const requiredAllowed = [
    "changeStatusMarker",
    "changePriority",
    "appendClarification",
    "appendNewTask",
    "moveToBacklogWithMarker",
  ];

  for (const mutation of requiredAllowed) {
    if (!allowed.has(mutation)) fail(`todoMutationPolicy.allowedMutations missing ${mutation}.`);
  }

  const blocked = new Set(config.blockedAutonomousActions ?? []);
  for (const action of ["deleteTodoEntries", "deleteRoadmapSections"]) {
    if (!blocked.has(action)) fail(`blockedAutonomousActions must include ${action}.`);
  }

  info("ToDo/Roadmap no-delete policy is configured.");
}

function validateWritePolicy(config) {
  const policy = config.writePolicy ?? {};
  const scopedBuildMode = policy.allowedAutonomousWriteMode === "single_agent_docs_register_build";

  if (policy.canDeployProduction !== false) fail("writePolicy.canDeployProduction must be false.");

  if (scopedBuildMode) {
    if (policy.canModifyCode !== true) fail("single_agent_docs_register_build requires writePolicy.canModifyCode true for scoped governance artifacts.");
    if (policy.canCreateBranch !== true) fail("single_agent_docs_register_build requires writePolicy.canCreateBranch true.");
    if (policy.canCreatePullRequest !== true) fail("single_agent_docs_register_build requires writePolicy.canCreatePullRequest true.");
    if (!Array.isArray(policy.allowedWriteScopes) || policy.allowedWriteScopes.length === 0) fail("single_agent_docs_register_build requires allowedWriteScopes.");
    if (!Array.isArray(policy.forbiddenWriteScopes) || policy.forbiddenWriteScopes.length === 0) fail("single_agent_docs_register_build requires forbiddenWriteScopes.");
  } else {
    if (policy.canModifyCode !== false) warn("Dry-run MVP should keep writePolicy.canModifyCode false unless scoped autonomy is active.");
    if (policy.canCreatePullRequest !== false) warn("Dry-run MVP should keep writePolicy.canCreatePullRequest false unless scoped autonomy is active.");
  }

  info("write policy checked.");
}

function main() {
  const config = readConfig();
  if (!config) return;

  validateIdentityGate(config);
  validateCoderRegistry(config);
  validateTodoMutationPolicy(config);
  validateWritePolicy(config);

  if (process.exitCode && process.exitCode !== 0) {
    console.error("WellFit agent config validation failed.");
    return;
  }

  console.log("WellFit agent config validation successful.");
}

main();
