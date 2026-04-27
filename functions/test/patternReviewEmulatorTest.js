/*
  WellFit Mission Pattern Review Emulator Test

  Zweck:
  Testet den sicheren Pattern-/Rate-Limit-/Anti-Farming-Review-Stub:
  - reviewMissionPatterns schreibt missionPatternReviews
  - hohe Proof-Frequenz wird markiert
  - gleiche Device-/AppSession-Muster werden markiert
  - repeated NFC/Mission Patterns werden markiert
  - Pattern Review autorisiert keine Rewards, XP, Punkte, Token oder Mission Completion
  - Firestore Rules blockieren fremde Reads und direkte Client-Writes
*/

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
const { initializeTestEnvironment, assertSucceeds, assertFails } = require("@firebase/rules-unit-testing");

const PROJECT_ID = process.env.GCLOUD_PROJECT || "demo-no-project";
const FUNCTIONS_BASE_URL = process.env.FUNCTIONS_EMULATOR_URL || `http://127.0.0.1:5001/${PROJECT_ID}/us-central1`;
const AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
const FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";

process.env.FIREBASE_AUTH_EMULATOR_HOST = AUTH_EMULATOR_HOST;
process.env.FIRESTORE_EMULATOR_HOST = FIRESTORE_EMULATOR_HOST;

if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
const db = admin.firestore();
const auth = admin.auth();

function assert(condition, message) { if (!condition) throw new Error(message); }
function decodeJwtPayload(token) { const [, payload] = token.split("."); return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")); }

async function safeDeleteUser(uid) {
  try { await auth.deleteUser(uid); } catch (error) { if (error.code !== "auth/user-not-found") throw error; }
}

async function createAuthUser(uid) {
  await safeDeleteUser(uid);
  await auth.createUser({ uid, email: `${uid}@wellfit.test`, emailVerified: true });
  const customToken = await auth.createCustomToken(uid);
  const response = await fetch(`http://${AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-api-key`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: customToken, returnSecureToken: true }) });
  const json = await response.json();
  if (!response.ok || !json.idToken) throw new Error(`Auth Emulator signInWithCustomToken failed: ${JSON.stringify(json)}`);
  decodeJwtPayload(json.idToken);
  return json.idToken;
}

async function callCallable(functionName, idToken, data) {
  const response = await fetch(`${FUNCTIONS_BASE_URL}/${functionName}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` }, body: JSON.stringify({ data: data || {} }) });
  const rawText = await response.text();
  let json = {};
  try { json = rawText ? JSON.parse(rawText) : {}; } catch (error) { json = { parseError: error.message, rawText }; }
  return { status: response.status, ok: response.ok, json, rawText };
}

function getCallableResult(callResponse) { return callResponse.json && Object.prototype.hasOwnProperty.call(callResponse.json, "result") ? callResponse.json.result : null; }
function describeCall(callResponse) { return JSON.stringify({ status: callResponse.status, ok: callResponse.ok, json: callResponse.json, rawText: callResponse.rawText }); }

async function resetCollections() {
  const collections = ["trackingSessions", "trackingProofEvents", "nfcScanEvents", "missionBuddyEvents", "missionPatternReviews"];
  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).limit(500).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}

async function seedPatternEvents() {
  const batch = db.batch();
  const userId = "pattern-user";
  const missionId = "demo_tree_clue_001";
  const deviceId = "pattern-device-001";
  const appSessionId = "pattern-session-001";

  for (let i = 0; i < 2; i += 1) {
    const ref = db.collection("trackingSessions").doc(`pattern_session_${i}`);
    batch.set(ref, { sessionId: ref.id, userId, missionId, source: "mobile", proofType: "motion", status: "proof-submitted", deviceId, appSessionId, serverValidationStatus: "proof-received", createdAt: admin.firestore.FieldValue.serverTimestamp() });
  }

  for (let i = 0; i < 7; i += 1) {
    const ref = db.collection("trackingProofEvents").doc(`pattern_proof_${i}`);
    batch.set(ref, { proofEventId: ref.id, userId, missionId, sessionId: "pattern_session_0", proofType: "motion", clientClaimStatus: "completed", deviceId, appSessionId, serverValidationStatus: "received", createdAt: admin.firestore.FieldValue.serverTimestamp() });
  }

  for (let i = 0; i < 4; i += 1) {
    const ref = db.collection("nfcScanEvents").doc(`pattern_nfc_${i}`);
    batch.set(ref, { scanEventId: ref.id, userId, missionId, tagId: "demo_nfc_rope_tree_001", publicCode: "WF-DEMO-ROPE-TREE-001", source: "nfc", status: i === 0 ? "validated" : "rejected", rejectionReason: i === 0 ? null : "duplicate-scan", deviceId, appSessionId, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  }

  for (let i = 0; i < 3; i += 1) {
    const ref = db.collection("missionBuddyEvents").doc(`pattern_buddy_${i}`);
    batch.set(ref, { eventId: ref.id, userId, missionId, eventType: "buddyActionCompleted", status: "completed", deviceId, appSessionId, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  }

  await batch.commit();
}

async function runRulesCheck(patternReviewId) {
  const rulesPath = path.join(__dirname, "..", "..", "firestore.rules");
  const rules = fs.readFileSync(rulesPath, "utf8");
  const testEnv = await initializeTestEnvironment({ projectId: PROJECT_ID, firestore: { rules, host: "127.0.0.1", port: 8080 } });
  try {
    const aliceDb = testEnv.authenticatedContext("pattern-user").firestore();
    const bobDb = testEnv.authenticatedContext("other-user").firestore();
    await assertSucceeds(aliceDb.collection("missionPatternReviews").doc(patternReviewId).get());
    await assertFails(bobDb.collection("missionPatternReviews").doc(patternReviewId).get());
    await assertFails(aliceDb.collection("missionPatternReviews").doc("client_hack_pattern_review").set({ patternReviewId: "client_hack_pattern_review", userId: "pattern-user", rewardAuthorized: true, xpAuthorized: true, pointsAuthorized: true, tokenAuthorized: true, missionCompletionAuthorized: true }));
    await assertFails(aliceDb.collection("missionPatternReviews").doc(patternReviewId).update({ rewardAuthorized: true, patternRiskScore: 0 }));
  } finally {
    await testEnv.cleanup();
  }
}

async function run() {
  console.log("WellFit Mission Pattern Review Emulator Test startet...");
  await resetCollections();
  await seedPatternEvents();

  const userToken = await createAuthUser("pattern-user");
  const otherUserToken = await createAuthUser("other-user");

  const patternReview = await callCallable("reviewMissionPatterns", userToken, { missionId: "demo_tree_clue_001", deviceId: "pattern-device-001", appSessionId: "pattern-session-001" });
  const result = getCallableResult(patternReview);
  assert(patternReview.ok, `reviewMissionPatterns muss HTTP OK sein: ${describeCall(patternReview)}`);
  assert(result.accepted === false, "Pattern Review darf nicht accepted=true liefern.");
  assert(result.rewardAuthorized === false, "Pattern Review darf keinen Reward autorisieren.");
  assert(result.xpAuthorized === false, "Pattern Review darf keine XP autorisieren.");
  assert(result.pointsAuthorized === false, "Pattern Review darf keine Punkte autorisieren.");
  assert(result.tokenAuthorized === false, "Pattern Review darf keine Token autorisieren.");
  assert(result.missionCompletionAuthorized === false, "Pattern Review darf keine Mission Completion autorisieren.");
  assert(result.flags.includes("high-frequency-proofs"), "Pattern Review muss high-frequency-proofs flaggen.");
  assert(result.flags.includes("high-frequency-nfc-scans"), "Pattern Review muss high-frequency-nfc-scans flaggen.");
  assert(result.flags.includes("repeated-same-nfc-target"), "Pattern Review muss repeated-same-nfc-target flaggen.");
  assert(result.flags.includes("repeated-rejected-nfc"), "Pattern Review muss repeated-rejected-nfc flaggen.");
  assert(result.flags.includes("same-device-event-burst"), "Pattern Review muss same-device-event-burst flaggen.");
  assert(result.flags.includes("same-app-session-event-burst"), "Pattern Review muss same-app-session-event-burst flaggen.");
  assert(result.recommendation === "manual-review-required", "Pattern Review muss manual-review-required liefern.");

  const doc = await db.collection("missionPatternReviews").doc(result.patternReviewId).get();
  assert(doc.exists, "reviewMissionPatterns muss missionPatternReviews Dokument schreiben.");
  assert(doc.data().rewardAuthorized === false, "Pattern Review Dokument rewardAuthorized muss false sein.");

  const foreign = await callCallable("reviewMissionPatterns", otherUserToken, { missionId: "demo_tree_clue_001", deviceId: "pattern-device-001", appSessionId: "pattern-session-001" });
  const foreignResult = getCallableResult(foreign);
  assert(foreign.ok, `Fremder Nutzer kann eigene leere Pattern Review ausfuehren: ${describeCall(foreign)}`);
  assert(foreignResult.eventCounts.totalEvents === 0, "Fremder Nutzer darf keine Pattern Events des anderen Nutzers sehen.");

  await runRulesCheck(result.patternReviewId);

  console.log("WellFit Mission Pattern Review Emulator Test erfolgreich.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
