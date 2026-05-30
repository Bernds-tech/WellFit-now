import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildDecisionDossiers } from "./build-decision-dossiers.mjs";

const sourceBefore = JSON.parse(await readFile("project-register/agent-product-evolution-first-run-output.json", "utf8"));
const output = await buildDecisionDossiers({ write: false });
const sourceAfter = JSON.parse(await readFile("project-register/agent-product-evolution-first-run-output.json", "utf8"));

assert.deepEqual(sourceAfter, sourceBefore, "script must not mutate the first-run source file");
assert.deepEqual(Object.keys(output), ["createdAt", "sourceRef", "dossiers"], "output schema must stay limited to createdAt/sourceRef/dossiers");
assert.equal(output.sourceRef, "project-register/agent-product-evolution-first-run-output.json");
assert(Array.isArray(output.dossiers), "decision dossiers must be an array");
assert(output.dossiers.length >= 5, "string generatedDossiers must become structured dossiers");

const generatedFromString = output.dossiers.find((dossier) => dossier.sourceDossierId === "todolist/AGENT_PRODUCT_OPPORTUNITY_PROPOSALS.md");
assert(generatedFromString, "string generatedDossier path should be converted into a dossier object");
for (const field of ["sourceDossierId", "dossierId", "title", "summary", "whatWillChange", "whySuggested", "wellFitBenefit", "userBenefit", "businessBenefit", "economyImpact", "riskSummary", "recommendation", "riskLevel", "allowedFiles", "blockedFiles", "requiredChecks", "nextStep", "detailStatus", "missingCriticalDecisionFields"]) {
  assert(Object.prototype.hasOwnProperty.call(generatedFromString, field), `complete dossier must include ${field}`);
}
assert.equal(generatedFromString.detailStatus, "structured");
assert.deepEqual(generatedFromString.missingCriticalDecisionFields, []);
assert.equal(generatedFromString.recommendation, "approve");

assert.equal(sourceAfter.recommendedApprovals.length, 2, "structured recommendedApprovals must remain in original source");
assert.equal(sourceAfter.recommendedApprovals[0].sourceDossierId, "PE-20260523-01");
assert.equal(sourceAfter.recommendedApprovals[0].whatWillChange, "Proposal-Dossier fuer saisonale Familienmissionen im Move+Learn Format.");

const incomplete = output.dossiers.find((dossier) => dossier.sourceDossierId === "todolist/AGENT_RESEARCH_SUMMARY_TEMPLATE.md");
assert(incomplete, "research template dossier should exist");
assert.equal(incomplete.detailStatus, "missing", "insufficient source content must stay incomplete");
assert.equal(incomplete.recommendation, "revise", "incomplete dossier must not be marked approve");
assert(incomplete.missingCriticalDecisionFields.length > 0, "incomplete dossier must not be approvable");

const scriptSource = await readFile("scripts/product-evolution/build-decision-dossiers.mjs", "utf8");
assert(!/child_process|firebase deploy|git merge|gh pr merge|approve[A-Z]?\w*\(/i.test(scriptSource), "script must not add runner/deploy/merge/automatic approval behavior");
const sensitiveOutputKeys = Object.keys(output);
assert(sensitiveOutputKeys.every((key) => !new Set(["uid", "email", "accessToken", "refreshToken", "idToken", "secret", "token"]).has(key)), "debug/output keys must not contain UID, e-mail, tokens or secrets");

console.log("product evolution dossier author tests passed");
