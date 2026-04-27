/*
  WellFit Mission Evidence Review Emulator Test

  Zweck:
  Testet den sicheren Evidence-/Anti-Cheat-Review-Stub:
  - reviewMissionEvidence schreibt missionEvidenceReviews
  - Evidence Review sammelt Tracking, Proof, Buddy, Context, Completion und RewardPreview
  - Evidence Review autorisiert keine Rewards, XP, Punkte, Token oder Mission Completion
  - Firestore Rules erlauben Owner-Read und blockieren fremde Reads sowie direkte Client-Writes
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
    "missionContextEvaluations",
    "missionCompletionEvaluations",
    "missionRewardPreviews",
    "missionEvidenceReviews",
  ];
  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).limit(500).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}

async function runRulesCheck(evidenceReviewId) {
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
    const aliceDb = testEnv.authenticatedContext("evidence-user").firestore();
    const bobDb = testEnv.authenticatedContext("other-user").firestore();

    await assertSucceeds(aliceDb.collection("missionEvidenceReviews").doc(evidenceReviewId).get());
    await assertFails(bobDb.collection("missionEvidenceReviews").doc(evidenceReviewId).get());
    await assertFails(aliceDb.collection("missionEvidenceReviews").doc("client_hack_evidence_review").set({
      evidenceReviewId: "client_hack_evidence_review",
      userId: "evidence-user",
      missionId: "demo_tree_clue_001",
      rewardAuthorized: true,
      xpAuthorized: true,
      pointsAuthorized: true,
      tokenAuthorized: true,
      missionCompletionAuthorized: true,
    }));
    await assertFails(aliceDb.collection("missionEvidenceReviews").doc(evidenceReviewId).update({
      rewardAuthorized: true,
      xpAuthorized: true,
      pointsAuthorized: true,
      tokenAuthorized: true,
      missionCompletionAuthorized: true,
    }));
  } finally {
    await testEnv.cleanup();
  }
}

async function run() {
  console.log("WellFit Mission Evidence Review Emulator Test startet...");
  await resetCollections();

  const userToken = await createAuthUser("evidence-user");
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
  const contextResult = getCallableResult(contextEvaluation);
  assert(contextEvaluation.ok, `evaluateMissionContext muss HTTP OK sein: ${describeCall(contextEvaluation)}`);

  const trackingSession = await callCallable("createTrackingSession", userToken, {
    missionId: "demo_tree_clue_001",
    source: "mobile",
    proofType: "motion",
    deviceId: "evidence-device-001",
  });
  const trackingSessionResult = getCallableResult(trackingSession);
  assert(trackingSession.ok, `createTrackingSession muss HTTP OK sein: ${describeCall(trackingSession)}`);

  const trackingProof = await callCallable("recordTrackingProof", userToken, {
    sessionId: trackingSessionResult.sessionId,
    proofType: "motion",
    status: "completed",
  });
  const trackingProofResult = getCallableResult(trackingProof);
  assert(trackingProof.ok, `recordTrackingProof muss HTTP OK sein: ${describeCall(trackingProof)}`);

  const buddyEvent = await callCallable("createMissionBuddyEvent", userToken, {
    missionId: "demo_tree_clue_001",
    buddyId: "default",
    eventType: "buddyActionCompleted",
    status: "completed",
    capabilityId: "climbUp",
  });
  const buddyEventResult = getCallableResult(buddyEvent);
  assert(buddyEvent.ok, `createMissionBuddyEvent muss HTTP OK sein: ${describeCall(buddyEvent)}`);

  const completionEvaluation = await callCallable("evaluateMissionCompletion", userToken, {
    missionId: "demo_tree_clue_001",
    trackingSessionId: trackingSessionResult.sessionId,
    trackingProofEventId: trackingProofResult.proofEventId,
    missionBuddyEventId: buddyEventResult.eventId,
  });
  const completionResult = getCallableResult(completionEvaluation);
  assert(completionEvaluation.ok, `evaluateMissionCompletion muss HTTP OK sein: ${describeCall(completionEvaluation)}`);

  const rewardPreview = await callCallable("missionRewardPreview", userToken, {
    missionId: "demo_tree_clue_001",
    missionType: "daily",
    contextEvaluationId: contextResult.evaluationId,
    completionEvaluationId: completionResult.evaluationId,
    requestedBaseReward: 20,
  });
  const rewardPreviewResult = getCallableResult(rewardPreview);
  assert(rewardPreview.ok, `missionRewardPreview muss HTTP OK sein: ${describeCall(rewardPreview)}`);

  const evidenceReview = await callCallable("reviewMissionEvidence", userToken, {
    missionId: "demo_tree_clue_001",
    trackingSessionId: trackingSessionResult.sessionId,
    trackingProofEventId: trackingProofResult.proofEventId,
    missionBuddyEventId: buddyEventResult.eventId,
    contextEvaluationId: contextResult.evaluationId,
    completionEvaluationId: completionResult.evaluationId,
    rewardPreviewId: rewardPreviewResult.previewId,
  });
  const evidenceReviewResult = getCallableResult(evidenceReview);
  assert(evidenceReview.ok, `reviewMissionEvidence muss HTTP OK sein: ${describeCall(evidenceReview)}`);
  assert(evidenceReviewResult.accepted === false, "Evidence Review darf nicht accepted=true liefern.");
  assert(evidenceReviewResult.rewardAuthorized === false, "Evidence Review darf keinen Reward autorisieren.");
  assert(evidenceReviewResult.xpAuthorized === false, "Evidence Review darf keine XP autorisieren.");
  assert(evidenceReviewResult.pointsAuthorized === false, "Evidence Review darf keine Punkte autorisieren.");
  assert(evidenceReviewResult.tokenAuthorized === false, "Evidence Review darf keine Token autorisieren.");
  assert(evidenceReviewResult.missionCompletionAuthorized === false, "Evidence Review darf keine Mission Completion autorisieren.");
  assert(evidenceReviewResult.evidenceCount >= 5, "Evidence Review muss mehrere Evidence-Typen zaehlen.");
  assert(evidenceReviewResult.evidenceTypes.includes("trackingSession"), "Evidence Review muss trackingSession enthalten.");
  assert(evidenceReviewResult.evidenceTypes.includes("trackingProof"), "Evidence Review muss trackingProof enthalten.");
  assert(evidenceReviewResult.evidenceTypes.includes("missionContextEvaluation"), "Evidence Review muss missionContextEvaluation enthalten.");
  assert(evidenceReviewResult.evidenceTypes.includes("missionCompletionEvaluation"), "Evidence Review muss missionCompletionEvaluation enthalten.");
  assert(evidenceReviewResult.evidenceTypes.includes("missionRewardPreview"), "Evidence Review muss missionRewardPreview enthalten.");

  const evidenceReviewDoc = await db.collection("missionEvidenceReviews").doc(evidenceReviewResult.evidenceReviewId).get();
  assert(evidenceReviewDoc.exists, "reviewMissionEvidence muss missionEvidenceReviews Dokument schreiben.");
  assert(evidenceReviewDoc.data().rewardAuthorized === false, "Evidence Review Dokument rewardAuthorized muss false sein.");
  assert(evidenceReviewDoc.data().tokenAuthorized === false, "Evidence Review Dokument tokenAuthorized muss false sein.");

  const emptyEvidenceReview = await callCallable("reviewMissionEvidence", userToken, {
    missionId: "demo_tree_clue_001",
  });
  const emptyResult = getCallableResult(emptyEvidenceReview);
  assert(emptyEvidenceReview.ok, `Leere Evidence Review soll HTTP OK sein: ${describeCall(emptyEvidenceReview)}`);
  assert(emptyResult.recommendation === "insufficient-evidence", "Leere Evidence Review muss insufficient-evidence liefern.");
  assert(emptyResult.rewardAuthorized === false, "Leere Evidence Review darf keinen Reward autorisieren.");

  const foreignEvidenceReview = await callCallable("reviewMissionEvidence", otherUserToken, {
    missionId: "demo_tree_clue_001",
    trackingSessionId: trackingSessionResult.sessionId,
  });
  assert(foreignEvidenceReview.status === 403 || foreignEvidenceReview.json.error, "Fremde Evidence muss blockiert werden.");

  await runRulesCheck(evidenceReviewResult.evidenceReviewId);

  console.log("WellFit Mission Evidence Review Emulator Test erfolgreich.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
