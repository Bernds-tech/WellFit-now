/*
  WellFit Mission Completion Emulator Test

  Zweck:
  Testet sichere Mission-Kontext-, Mission-Completion- und Reward-Preview-Stubs:
  - evaluateMissionContext schreibt missionContextEvaluations
  - Context Evaluation autorisiert keine Rewards oder Mission Completion
  - evaluateMissionCompletion schreibt missionCompletionEvaluations
  - Completion Evaluation akzeptiert keine finale Completion
  - Evaluation autorisiert keine Rewards, XP oder Punkte
  - missionRewardPreview schreibt nur eine Simulation und autorisiert keine Rewards, XP, Punkte oder Token
  - Fremde Tracking-Sessions werden blockiert
  - Firestore Rules blockieren direkte Client-Writes auf Evaluation- und Preview-Collections
*/

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} = require("@firebase/rules-unit-testing");

const PROJECT_ID = process.env.GCLOUD_PROJECT || "demo-no-project";
const FUNCTIONS_BASE_URL = process.env.FUNCTIONS_EMULATOR_URL || `http://127.0.0.1:5001/${PROJECT_ID}/us-central1`;
const AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
const FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";

process.env.FIREBASE_AUTH_EMULATOR_HOST = AUTH_EMULATOR_HOST;
process.env.FIRESTORE_EMULATOR_HOST = FIRESTORE_EMULATOR_HOST;

if (!admin.apps.length) {
  admin.initializeApp({ projectId: PROJECT_ID });
}

const db = admin.firestore();
const auth = admin.auth();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function decodeJwtPayload(token) {
  const [, payload] = token.split(".");
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
}

async function safeDeleteUser(uid) {
  try {
    await auth.deleteUser(uid);
  } catch (error) {
    if (error.code !== "auth/user-not-found") throw error;
  }
}

async function createAuthUser(uid) {
  await safeDeleteUser(uid);
  await auth.createUser({ uid, email: `${uid}@wellfit.test`, emailVerified: true });
  const customToken = await auth.createCustomToken(uid);
  const response = await fetch(`http://${AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-api-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  });
  const json = await response.json();
  if (!response.ok || !json.idToken) {
    throw new Error(`Auth Emulator signInWithCustomToken failed: ${JSON.stringify(json)}`);
  }
  decodeJwtPayload(json.idToken);
  return json.idToken;
}

async function callCallable(functionName, idToken, data) {
  const response = await fetch(`${FUNCTIONS_BASE_URL}/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ data: data || {} }),
  });
  const rawText = await response.text();
  let json = {};
  try {
    json = rawText ? JSON.parse(rawText) : {};
  } catch (error) {
    json = { parseError: error.message, rawText };
  }
  return { status: response.status, ok: response.ok, json, rawText };
}

function getCallableResult(callResponse) {
  if (callResponse.json && Object.prototype.hasOwnProperty.call(callResponse.json, "result")) {
    return callResponse.json.result;
  }
  return null;
}

function describeCall(callResponse) {
  return JSON.stringify({ status: callResponse.status, ok: callResponse.ok, json: callResponse.json, rawText: callResponse.rawText });
}

async function resetCollections() {
  const collections = [
    "trackingSessions",
    "trackingProofEvents",
    "missionBuddyEvents",
    "nfcScanEvents",
    "missionContextEvaluations",
    "missionCompletionEvaluations",
    "missionRewardPreviews",
    "missionRewardEvents",
    "missionRewardPolicies",
    "systemReserveSnapshots",
  ];
  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).limit(500).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}

async function runRulesCheck({ contextEvaluationId, completionEvaluationId, rewardPreviewId }) {
  const rulesPath = path.join(__dirname, "..", "..", "firestore.rules");
  const rules = fs.readFileSync(rulesPath, "utf8");
  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: "127.0.0.1",
      port: 8080,
    },
  });

  try {
    const aliceDb = testEnv.authenticatedContext("mission-user").firestore();
    const bobDb = testEnv.authenticatedContext("other-user").firestore();

    await assertSucceeds(aliceDb.collection("missionContextEvaluations").doc(contextEvaluationId).get());
    await assertFails(bobDb.collection("missionContextEvaluations").doc(contextEvaluationId).get());
    await assertFails(aliceDb.collection("missionContextEvaluations").doc("client_hack_context").set({
      evaluationId: "client_hack_context",
      userId: "mission-user",
      missionId: "demo_tree_clue_001",
      recommendation: "context-ok-for-review",
      rewardAuthorized: true,
      missionCompletionAuthorized: true,
    }));
    await assertFails(aliceDb.collection("missionContextEvaluations").doc(contextEvaluationId).update({
      recommendation: "context-ok-for-review",
      rewardAuthorized: true,
      missionCompletionAuthorized: true,
    }));

    await assertSucceeds(aliceDb.collection("missionCompletionEvaluations").doc(completionEvaluationId).get());
    await assertFails(bobDb.collection("missionCompletionEvaluations").doc(completionEvaluationId).get());
    await assertFails(aliceDb.collection("missionCompletionEvaluations").doc("client_hack_eval").set({
      evaluationId: "client_hack_eval",
      userId: "mission-user",
      missionId: "demo_tree_clue_001",
      accepted: true,
      rewardAuthorized: true,
      missionCompletionAuthorized: true,
    }));
    await assertFails(aliceDb.collection("missionCompletionEvaluations").doc(completionEvaluationId).update({
      accepted: true,
      rewardAuthorized: true,
      missionCompletionAuthorized: true,
    }));

    await assertSucceeds(aliceDb.collection("missionRewardPreviews").doc(rewardPreviewId).get());
    await assertFails(bobDb.collection("missionRewardPreviews").doc(rewardPreviewId).get());
    await assertFails(aliceDb.collection("missionRewardPreviews").doc("client_hack_preview").set({
      previewId: "client_hack_preview",
      userId: "mission-user",
      missionId: "demo_tree_clue_001",
      rewardAuthorized: true,
      xpAuthorized: true,
      pointsAuthorized: true,
      tokenAuthorized: true,
    }));
    await assertFails(aliceDb.collection("missionRewardPreviews").doc(rewardPreviewId).update({
      rewardAuthorized: true,
      xpAuthorized: true,
      pointsAuthorized: true,
      tokenAuthorized: true,
    }));

    await assertSucceeds(aliceDb.collection("missionRewardPolicies").doc("public_policy_placeholder").get());
    await assertFails(aliceDb.collection("missionRewardPolicies").doc("client_hack_policy").set({
      policyId: "client_hack_policy",
      rewardAuthorized: true,
    }));
    await assertFails(aliceDb.collection("systemReserveSnapshots").doc("client_hack_reserve").set({
      snapshotId: "client_hack_reserve",
      rewardPoolAvailable: 999999,
    }));
    await assertFails(aliceDb.collection("missionRewardEvents").doc("client_hack_reward_event").set({
      rewardEventId: "client_hack_reward_event",
      userId: "mission-user",
      internalPointsGranted: 999999,
    }));
  } finally {
    await testEnv.cleanup();
  }
}

async function run() {
  console.log("WellFit Mission Completion Emulator Test startet...");
  await resetCollections();

  const userToken = await createAuthUser("mission-user");
  const otherUserToken = await createAuthUser("other-user");

  const contextEvaluation = await callCallable("evaluateMissionContext", userToken, {
    missionId: "demo_tree_clue_001",
    ageBand: "child",
    dayType: "school-day",
    timeWindow: "afternoon",
    parentMode: "enabled",
    gpsSafetyStatus: "inside-radius",
    proofQuality: "medium",
    estimatedMinutes: 15,
    radiusMeters: 40,
  });
  const contextEvaluationResult = getCallableResult(contextEvaluation);
  assert(contextEvaluation.ok, `evaluateMissionContext muss HTTP OK sein: ${describeCall(contextEvaluation)}`);
  assert(contextEvaluationResult.accepted === false, "Context Evaluation darf nicht accepted=true liefern.");
  assert(contextEvaluationResult.rewardAuthorized === false, "Context Evaluation darf keinen Reward autorisieren.");
  assert(contextEvaluationResult.missionCompletionAuthorized === false, "Context Evaluation darf keine Mission Completion autorisieren.");
  assert(contextEvaluationResult.recommendation === "context-ok-for-review", "Sicherer Child-Kontext soll context-ok-for-review liefern.");
  assert(contextEvaluationResult.safetyScore >= 80, "Sicherer Child-Kontext soll hohen Safety Score liefern.");

  const riskyContextEvaluation = await callCallable("evaluateMissionContext", userToken, {
    missionId: "demo_tree_clue_001",
    ageBand: "child",
    dayType: "school-day",
    timeWindow: "night",
    parentMode: "not-required",
    gpsSafetyStatus: "outside-radius",
    proofQuality: "none",
    estimatedMinutes: 60,
    radiusMeters: 1000,
  });
  const riskyContextResult = getCallableResult(riskyContextEvaluation);
  assert(riskyContextEvaluation.ok, `Risky evaluateMissionContext muss HTTP OK sein: ${describeCall(riskyContextEvaluation)}`);
  assert(riskyContextResult.recommendation === "reject-or-parent-review", "Riskanter Child-Kontext muss reject-or-parent-review liefern.");
  assert(riskyContextResult.flags.includes("parent-mode-required"), "Riskanter Kontext muss parent-mode-required flaggen.");
  assert(riskyContextResult.flags.includes("night-not-safe-for-child"), "Riskanter Kontext muss night-not-safe-for-child flaggen.");
  assert(riskyContextResult.flags.includes("outside-radius"), "Riskanter Kontext muss outside-radius flaggen.");

  const contextDoc = await db.collection("missionContextEvaluations").doc(contextEvaluationResult.evaluationId).get();
  assert(contextDoc.exists, "Context Evaluation muss missionContextEvaluations Dokument schreiben.");
  assert(contextDoc.data().rewardAuthorized === false, "Context Evaluation Dokument darf keinen Reward autorisieren.");
  assert(contextDoc.data().missionCompletionAuthorized === false, "Context Evaluation Dokument darf keine Mission Completion autorisieren.");

  const trackingSession = await callCallable("createTrackingSession", userToken, {
    missionId: "demo_tree_clue_001",
    source: "mobile",
    proofType: "motion",
    deviceId: "mission-completion-device-001",
  });
  const trackingSessionResult = getCallableResult(trackingSession);
  assert(trackingSession.ok, `createTrackingSession muss HTTP OK sein: ${describeCall(trackingSession)}`);
  assert(trackingSessionResult.accepted === true, "Tracking Session muss accepted=true liefern.");

  const trackingProof = await callCallable("recordTrackingProof", userToken, {
    sessionId: trackingSessionResult.sessionId,
    proofType: "motion",
    status: "completed",
  });
  const trackingProofResult = getCallableResult(trackingProof);
  assert(trackingProof.ok, `recordTrackingProof muss HTTP OK sein: ${describeCall(trackingProof)}`);
  assert(trackingProofResult.accepted === true, "Tracking Proof muss accepted=true liefern.");

  const buddyEvent = await callCallable("createMissionBuddyEvent", userToken, {
    missionId: "demo_tree_clue_001",
    buddyId: "default",
    eventType: "buddyActionCompleted",
    status: "completed",
    capabilityId: "climbUp",
  });
  const buddyEventResult = getCallableResult(buddyEvent);
  assert(buddyEvent.ok, `createMissionBuddyEvent muss HTTP OK sein: ${describeCall(buddyEvent)}`);
  assert(buddyEventResult.accepted === true, "Buddy Event muss accepted=true liefern.");

  const evaluation = await callCallable("evaluateMissionCompletion", userToken, {
    missionId: "demo_tree_clue_001",
    trackingSessionId: trackingSessionResult.sessionId,
    trackingProofEventId: trackingProofResult.proofEventId,
    missionBuddyEventId: buddyEventResult.eventId,
  });
  const evaluationResult = getCallableResult(evaluation);
  assert(evaluation.ok, `evaluateMissionCompletion muss HTTP OK sein: ${describeCall(evaluation)}`);
  assert(evaluationResult.accepted === false, "Evaluation darf Mission Completion noch nicht akzeptieren.");
  assert(evaluationResult.rewardAuthorized === false, "Evaluation darf keinen Reward autorisieren.");
  assert(evaluationResult.missionCompletionAuthorized === false, "Evaluation darf keine Mission Completion autorisieren.");
  assert(evaluationResult.evidenceCount === 3, "Evaluation muss drei Evidence-Referenzen zaehlen.");
  assert(evaluationResult.rejectionReason === "manual-review-required", "Evaluation muss manual-review-required liefern.");

  const evaluationDoc = await db.collection("missionCompletionEvaluations").doc(evaluationResult.evaluationId).get();
  assert(evaluationDoc.exists, "Evaluation muss missionCompletionEvaluations Dokument schreiben.");
  assert(evaluationDoc.data().accepted === false, "Evaluation-Dokument accepted muss false sein.");
  assert(evaluationDoc.data().rewardAuthorized === false, "Evaluation-Dokument rewardAuthorized muss false sein.");
  assert(evaluationDoc.data().missionCompletionAuthorized === false, "Evaluation-Dokument missionCompletionAuthorized muss false sein.");

  const rewardPreview = await callCallable("missionRewardPreview", userToken, {
    missionId: "demo_tree_clue_001",
    missionType: "daily",
    contextEvaluationId: contextEvaluationResult.evaluationId,
    completionEvaluationId: evaluationResult.evaluationId,
    requestedBaseReward: 20,
  });
  const rewardPreviewResult = getCallableResult(rewardPreview);
  assert(rewardPreview.ok, `missionRewardPreview muss HTTP OK sein: ${describeCall(rewardPreview)}`);
  assert(rewardPreviewResult.accepted === false, "RewardPreview darf nicht accepted=true liefern.");
  assert(rewardPreviewResult.rewardAuthorized === false, "RewardPreview darf keinen Reward autorisieren.");
  assert(rewardPreviewResult.xpAuthorized === false, "RewardPreview darf keine XP autorisieren.");
  assert(rewardPreviewResult.pointsAuthorized === false, "RewardPreview darf keine Punkte autorisieren.");
  assert(rewardPreviewResult.tokenAuthorized === false, "RewardPreview darf keine Token autorisieren.");
  assert(rewardPreviewResult.missionCompletionAuthorized === false, "RewardPreview darf keine Mission Completion autorisieren.");
  assert(rewardPreviewResult.estimatedTokenEquivalent === null, "RewardPreview darf kein Token-Equivalent setzen.");

  const rewardPreviewDoc = await db.collection("missionRewardPreviews").doc(rewardPreviewResult.previewId).get();
  assert(rewardPreviewDoc.exists, "RewardPreview muss missionRewardPreviews Dokument schreiben.");
  assert(rewardPreviewDoc.data().rewardAuthorized === false, "RewardPreview-Dokument rewardAuthorized muss false sein.");
  assert(rewardPreviewDoc.data().xpAuthorized === false, "RewardPreview-Dokument xpAuthorized muss false sein.");
  assert(rewardPreviewDoc.data().pointsAuthorized === false, "RewardPreview-Dokument pointsAuthorized muss false sein.");
  assert(rewardPreviewDoc.data().tokenAuthorized === false, "RewardPreview-Dokument tokenAuthorized muss false sein.");

  const foreignEvaluation = await callCallable("evaluateMissionCompletion", otherUserToken, {
    missionId: "demo_tree_clue_001",
    trackingSessionId: trackingSessionResult.sessionId,
  });
  assert(foreignEvaluation.status === 403 || foreignEvaluation.json.error, "Fremde Tracking-Session muss blockiert werden.");

  const foreignRewardPreview = await callCallable("missionRewardPreview", otherUserToken, {
    missionId: "demo_tree_clue_001",
    contextEvaluationId: contextEvaluationResult.evaluationId,
    completionEvaluationId: evaluationResult.evaluationId,
    requestedBaseReward: 20,
  });
  assert(foreignRewardPreview.status === 403 || foreignRewardPreview.json.error, "Fremde RewardPreview muss blockiert werden.");

  const emptyEvaluation = await callCallable("evaluateMissionCompletion", userToken, {
    missionId: "demo_tree_clue_001",
  });
  const emptyEvaluationResult = getCallableResult(emptyEvaluation);
  assert(emptyEvaluation.ok, `Leere Evaluation soll HTTP OK sein: ${describeCall(emptyEvaluation)}`);
  assert(emptyEvaluationResult.accepted === false, "Leere Evaluation darf nicht akzeptiert werden.");
  assert(emptyEvaluationResult.rejectionReason === "insufficient-evidence", "Leere Evaluation muss insufficient-evidence liefern.");

  await runRulesCheck({
    contextEvaluationId: contextEvaluationResult.evaluationId,
    completionEvaluationId: evaluationResult.evaluationId,
    rewardPreviewId: rewardPreviewResult.previewId,
  });

  console.log("WellFit Mission Completion Emulator Test erfolgreich.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
