/*
  WellFit Mission Cooldown Callable Emulator Test

  Zweck:
  Testet reviewMissionCooldowns als echte Callable Function:
  - schreibt missionCooldownReviews
  - erkennt hohe Proof-/NFC-/Mission-/Device-/AppSession-Frequenz
  - erlaubt Owner-Read
  - blockiert fremde Reads und direkte Client-Writes
  - autorisiert keine Rewards, XP, Punkte, Token oder Mission Completion
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
  const collections = ["trackingSessions", "trackingProofEvents", "nfcScanEvents", "missionBuddyEvents", "missionCooldownReviews"];
  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).limit(500).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}

async function seedCooldownEvents() {
  const batch = db.batch();
  const userId = "cooldown-user";
  const missionId = "demo_tree_clue_001";
  const deviceId = "cooldown-device-001";
  const appSessionId = "cooldown-session-001";

  for (let i = 0; i < 2; i += 1) {
    const ref = db.collection("trackingSessions").doc(`cooldown_session_${i}`);
    batch.set(ref, { sessionId: ref.id, userId, missionId, deviceId, appSessionId, status: "proof-submitted", createdAt: admin.firestore.FieldValue.serverTimestamp() });
  }
  for (let i = 0; i < 9; i += 1) {
    const ref = db.collection("trackingProofEvents").doc(`cooldown_proof_${i}`);
    batch.set(ref, { proofEventId: ref.id, userId, missionId, deviceId, appSessionId, proofType: "motion", serverValidationStatus: "received", createdAt: admin.firestore.FieldValue.serverTimestamp() });
  }
  for (let i = 0; i < 6; i += 1) {
    const ref = db.collection("nfcScanEvents").doc(`cooldown_nfc_${i}`);
    batch.set(ref, { scanEventId: ref.id, userId, missionId, deviceId, appSessionId, status: i === 0 ? "validated" : "rejected", rejectionReason: i === 0 ? null : "duplicate-scan", createdAt: admin.firestore.FieldValue.serverTimestamp() });
  }
  for (let i = 0; i < 3; i += 1) {
    const ref = db.collection("missionBuddyEvents").doc(`cooldown_buddy_${i}`);
    batch.set(ref, { eventId: ref.id, userId, missionId, deviceId, appSessionId, status: "completed", createdAt: admin.firestore.FieldValue.serverTimestamp() });
  }

  await batch.commit();
}

async function runRulesCheck(cooldownReviewId) {
  const rulesPath = path.join(__dirname, "..", "..", "firestore.rules");
  const rules = fs.readFileSync(rulesPath, "utf8");
  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules, host: "127.0.0.1", port: 8080 },
  });
  try {
    const aliceDb = testEnv.authenticatedContext("cooldown-user").firestore();
    const bobDb = testEnv.authenticatedContext("other-user").firestore();
    await assertSucceeds(aliceDb.collection("missionCooldownReviews").doc(cooldownReviewId).get());
    await assertFails(bobDb.collection("missionCooldownReviews").doc(cooldownReviewId).get());
    await assertFails(aliceDb.collection("missionCooldownReviews").doc("client_hack_cooldown").set({
      cooldownReviewId: "client_hack_cooldown",
      userId: "cooldown-user",
      rewardAuthorized: true,
      xpAuthorized: true,
      pointsAuthorized: true,
      tokenAuthorized: true,
      missionCompletionAuthorized: true,
    }));
    await assertFails(aliceDb.collection("missionCooldownReviews").doc(cooldownReviewId).update({
      cooldownRiskScore: 0,
      rewardAuthorized: true,
    }));
  } finally {
    await testEnv.cleanup();
  }
}

async function run() {
  console.log("WellFit Mission Cooldown Callable Emulator Test startet...");
  await resetCollections();
  await seedCooldownEvents();

  const userToken = await createAuthUser("cooldown-user");
  const otherUserToken = await createAuthUser("other-user");

  const response = await callCallable("reviewMissionCooldowns", userToken, {
    missionId: "demo_tree_clue_001",
    deviceId: "cooldown-device-001",
    appSessionId: "cooldown-session-001",
  });
  const result = getCallableResult(response);

  assert(response.ok, `reviewMissionCooldowns muss HTTP OK sein: ${describeCall(response)}`);
  assert(result.accepted === false, "Cooldown Review darf nicht accepted=true liefern.");
  assert(result.cooldownStatus === "hard-cooldown-recommended", "Cooldown Review muss hard-cooldown-recommended liefern.");
  assert(result.flags.includes("proof-hard-cooldown"), "proof-hard-cooldown muss gesetzt sein.");
  assert(result.flags.includes("nfc-hard-cooldown"), "nfc-hard-cooldown muss gesetzt sein.");
  assert(result.flags.includes("mission-hard-cooldown"), "mission-hard-cooldown muss gesetzt sein.");
  assert(result.flags.includes("device-hard-cooldown"), "device-hard-cooldown muss gesetzt sein.");
  assert(result.flags.includes("app-session-hard-cooldown"), "app-session-hard-cooldown muss gesetzt sein.");
  assert(result.rewardAuthorized === false, "Cooldown Review darf keinen Reward autorisieren.");
  assert(result.xpAuthorized === false, "Cooldown Review darf keine XP autorisieren.");
  assert(result.pointsAuthorized === false, "Cooldown Review darf keine Punkte autorisieren.");
  assert(result.tokenAuthorized === false, "Cooldown Review darf keine Token autorisieren.");
  assert(result.missionCompletionAuthorized === false, "Cooldown Review darf keine Mission Completion autorisieren.");

  const doc = await db.collection("missionCooldownReviews").doc(result.cooldownReviewId).get();
  assert(doc.exists, "reviewMissionCooldowns muss missionCooldownReviews Dokument schreiben.");
  assert(doc.data().rewardAuthorized === false, "Cooldown Review Dokument rewardAuthorized muss false sein.");

  const otherResponse = await callCallable("reviewMissionCooldowns", otherUserToken, {
    missionId: "demo_tree_clue_001",
    deviceId: "cooldown-device-001",
    appSessionId: "cooldown-session-001",
  });
  const otherResult = getCallableResult(otherResponse);
  assert(otherResponse.ok, `Fremder Nutzer kann eigene leere Cooldown Review ausfuehren: ${describeCall(otherResponse)}`);
  assert(otherResult.eventCounts.totalEvents === 0, "Fremder Nutzer darf keine Cooldown Events des anderen Nutzers sehen.");

  await runRulesCheck(result.cooldownReviewId);

  console.log("WellFit Mission Cooldown Callable Emulator Test erfolgreich.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
