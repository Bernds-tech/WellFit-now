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
for (const field of ["sourceDossierId", "dossierId", "title", "summary", "whatWillChange", "whySuggested", "wellFitBenefit", "userBenefit", "businessBenefit", "economyImpact", "riskSummary", "recommendation", "recommendationLabel", "recommendationText", "riskLevel", "allowedFiles", "blockedFiles", "requiredChecks", "executionContract", "allowedExecution", "forbiddenExecution", "executionEnvelope", "validationPlan", "rollbackPlan", "stopConditions", "targetEnvironment", "nextAutomaticSteps", "taskProposalPlan", "workerQueuePlan", "runnerJobPlan", "pickupContractPlan", "implementationPlan", "fileWritePlan", "branchPlan", "prPlan", "mergePlan", "deployPlan", "tokenPaymentBlockchainPlan", "nativePlan", "nextStep", "detailStatus", "missingCriticalDecisionFields"]) {
  assert(Object.prototype.hasOwnProperty.call(generatedFromString, field), `complete dossier must include ${field}`);
}
assert.equal(generatedFromString.detailStatus, "structured");
assert.deepEqual(generatedFromString.missingCriticalDecisionFields, []);
assert.equal(generatedFromString.recommendation, "approve");
assert.equal(generatedFromString.recommendationLabel, "Zur Zustimmung geeignet");
assert.match(generatedFromString.recommendationText, /automatisch nur die dort erlaubten Testseiten-Schritte/i, "approval recommendation must describe contract-limited auto progress");
assert.match(generatedFromString.economyImpact, /WFP \(interne Beta-Punkte; kein echtes Geld, kein Token, kein Cashout\)/, "WFP must be explained as internal beta points");
assert.match(generatedFromString.economyImpact, /XP \(Erfahrungspunkte fuer den Avatar\)/, "XP must be explained as avatar progress points");
assert.equal(generatedFromString.executionContract.mode, "single_owner_decision", "dossier must use single-owner decision mode");
assert.equal(generatedFromString.executionContract.ownerDecisionRequiredOnce, true, "owner decision is required once");
assert.equal(generatedFromString.allowedExecution.automaticProgressAllowed, true, "automatic progress can be enabled by the contract");
assert.equal(generatedFromString.allowedExecution.branchCreationAllowed, true, "branch creation can be allowed for test_main");
assert.equal(generatedFromString.allowedExecution.prCreationAllowed, true, "PR creation can be allowed for test_main");
assert.equal(generatedFromString.allowedExecution.mergeAllowed, true, "merge can be allowed for test_main");
assert.equal(generatedFromString.allowedExecution.deployAllowed, true, "deploy can be allowed for test_main");
assert.equal(generatedFromString.forbiddenExecution.nativeChangesAllowed, false, "native changes remain forbidden");
assert.equal(generatedFromString.forbiddenExecution.tokenPaymentBlockchainAllowed, false, "token/payment/blockchain remain forbidden");
assert.equal(generatedFromString.forbiddenExecution.productionLiveSiteDeployAllowed, false, "live production deploy remains forbidden");
for (const allowed of ["app/**", "functions/**", "firestore.rules", ".github/**"]) assert(generatedFromString.allowedFiles.includes(allowed), `${allowed} can be allowed by the envelope`);
assert(generatedFromString.blockedFiles.includes("native/**"), "native/** stays blocked");
assert.equal(generatedFromString.targetEnvironment, "test_main", "target environment must be test_main");
assert(generatedFromString.requiredChecks.length > 0, "required checks must be present");
assert(generatedFromString.stopConditions.length > 0, "stop conditions must be present");
assert.equal(generatedFromString.tokenPaymentBlockchainPlan, "forbidden", "token/payment/blockchain plan is forbidden");
assert.equal(generatedFromString.nativePlan, "forbidden", "native plan is forbidden");

assert.equal(sourceAfter.recommendedApprovals.length, 2, "structured recommendedApprovals must remain in original source");
assert.equal(sourceAfter.recommendedApprovals[0].sourceDossierId, "PE-20260523-01");
assert.equal(sourceAfter.recommendedApprovals[0].whatWillChange, "Proposal-Dossier fuer saisonale Familienmissionen im Move+Learn Format.");

const researchMore = output.dossiers.find((dossier) => dossier.recommendation === "research_more");
assert(researchMore, "research_more dossier should exist");
assert.equal(researchMore.recommendationLabel, "Weiter pruefen");
assert.match(researchMore.recommendationText, /Weiter pruefen – noch nicht umsetzen/i, "research_more must be explained with a readable label/text");
assert.match(researchMore.recommendationText, /Es wird noch nichts in App, Funktionen, Standortlogik oder laufenden Produktlogik gebaut/i, "research_more must explicitly block implementation");
assert.match([researchMore.summary, researchMore.whySuggested, researchMore.riskSummary].join(" "), /AR-lite \(einfache AR-\/Umgebungsmission ohne volle Unity- oder Native-App-Abhaengigkeit\)|einfache AR-\/Umgebungsmissionen/i, "AR-lite must be explained or translated");
assert.match([researchMore.summary, researchMore.whySuggested].join(" "), /grobe Ortsbereiche|ohne praezise Standortverfolgung/i, "coarse location boundaries must be explained");
assert.match([researchMore.summary, researchMore.whySuggested].join(" "), /Unity-.*separaten AR-\/3D-Technikbereich/i, "Unity must be explained as a separate AR/3D area");
assert.match(researchMore.riskSummary, /Risiken durch tiefe Smartphone-\/App-Integration/i, "native risk must be explained");
assert(!/recommendationLabel|recommendationText/.test(JSON.stringify(sourceAfter)), "script must not mutate source with recommendation labels");

const missionDossier = output.dossiers.find((dossier) => dossier.sourceDossierId === "todolist/AGENT_MISSION_STORY_PROPOSALS.md");
assert(missionDossier, "mission story dossier should exist");
assert.match(missionDossier.economyImpact, /WFP \(interne Beta-Punkte; kein echtes Geld, kein Token, kein Cashout\)/, "mission WFP must be explained");
assert.match(missionDossier.economyImpact, /XP \(Erfahrungspunkte fuer Avatar-Fortschritt\)/, "mission XP must be explained");
assert.doesNotMatch(missionDossier.economyImpact, /WFP internal only|XP avatar progress|no token\/cashout\/payment/i, "mission economy terms should not stay English-only");

const incomplete = output.dossiers.find((dossier) => dossier.sourceDossierId === "todolist/AGENT_RESEARCH_SUMMARY_TEMPLATE.md");
assert(incomplete, "research template dossier should exist");
assert.equal(incomplete.detailStatus, "missing", "insufficient source content must stay incomplete");
assert.equal(incomplete.recommendation, "revise", "incomplete dossier must not be marked approve");
assert(incomplete.missingCriticalDecisionFields.length > 0, "incomplete dossier must not be approvable");

const scriptSource = await readFile("scripts/product-evolution/build-decision-dossiers.mjs", "utf8");
assert(!/child_process|firebase deploy|git merge|gh pr merge|approve[A-Z]?\w*\(/i.test(scriptSource), "script must not add runner/deploy/merge/automatic approval behavior");
const sensitiveOutputKeys = Object.keys(output);
assert(sensitiveOutputKeys.every((key) => !new Set(["uid", "email", "accessToken", "refreshToken", "idToken", "secret", "token"]).has(key)), "debug/output keys must not contain UID, e-mail, tokens or secrets");
const serializedOutput = JSON.stringify(output);
assert(!/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(serializedOutput), "output must not contain e-mail addresses");
assert(!/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(serializedOutput), "output must not contain e-mail addresses");
assert(!/accessToken|refreshToken|idToken/i.test(serializedOutput), "output must not contain auth tokens");
assert(output.dossiers.every((dossier) => dossier.forbiddenExecution?.secretsAllowedInDebug === false), "debug secrets must be explicitly forbidden");

console.log("product evolution dossier author tests passed");
