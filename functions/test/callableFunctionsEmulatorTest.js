/*
  WellFit Callable Functions Emulator Test

  Zweck:
  Testet echte Callable Function HTTP-Endpunkte im Firebase Emulator:
  - seedDemoItemsAndNfc mit Admin-Claim erfolgreich
  - seedDemoItemsAndNfc ohne Admin-Claim verboten
  - validateNfcScan als normaler Nutzer erfolgreich
  - NFC Edge Cases: missing/unknown/revoked/inactive/duplicate/user-not-allowed/usage-limit
  - Transaktionaler NFC Duplicate-Schutz ueber nfcScanClaims
  - Magnifier Flow mit scanObject Capability
  - auditItemUse als normaler Nutzer erfolgreich
  - createTrackingSession / recordTrackingProof als serverautorisierter Tracking-Ersatzpfad
  - createMissionBuddyEvent als serverautorisierter Buddy-Event-Ersatzpfad

  Voraussetzung:
  Terminal 1:
    cd /var/www/WellFit-now
    npm run emulators

  Terminal 2:
    cd /var/www/WellFit-now/functions
    npm run callable:emulator
*/

const admin = require("firebase-admin");

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
  if (!condition) {
    throw new Error(message);
  }
}

function decodeJwtPayload(token) {
  const [, payload] = token.split(".");
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
}

async function safeDeleteUser(uid) {
  try {
    await auth.deleteUser(uid);
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      throw error;
    }
  }
}

async function resetDemoCollections() {
  const collections = [
    "itemDefinitions",
    "nfcTags",
    "nfcScanEvents",
    "nfcScanClaims",
    "userInventory",
    "buddyCapabilities",
    "capabilityUnlockEvents",
    "buddyItemUseEvents",
    "trackingSessions",
    "trackingProofEvents",
    "missionBuddyEvents",
  ];

  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).limit(500).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}

async function createAuthUser(uid, adminClaim) {
  await safeDeleteUser(uid);
  await auth.createUser({ uid, email: `${uid}@wellfit.test`, emailVerified: true });
  if (adminClaim) {
    await auth.setCustomUserClaims(uid, { admin: true });
  }
  const customToken = await auth.createCustomToken(uid, adminClaim ? { admin: true } : undefined);
  const response = await fetch(`http://${AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-api-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  });
  const json = await response.json();
  if (!response.ok || !json.idToken) {
    throw new Error(`Auth Emulator signInWithCustomToken failed: ${JSON.stringify(json)}`);
  }
  const decoded = decodeJwtPayload(json.idToken);
  if (adminClaim) {
    assert(decoded.admin === true, `Admin ID token enthaelt keinen admin Claim: ${JSON.stringify(decoded)}`);
  }
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
  return JSON.stringify({
    status: callResponse.status,
    ok: callResponse.ok,
    json: callResponse.json,
    rawText: callResponse.rawText,
  });
}

async function assertRejectedScan({ token, publicCode, missionId, expectedReason, label }) {
  const response = await callCallable("validateNfcScan", token, { publicCode, missionId });
  const result = getCallableResult(response);
  assert(response.ok, `${label} response soll HTTP OK sein: ${describeCall(response)}`);
  assert(result && result.accepted === false, `${label} muss accepted=false liefern.`);
  assert(result.rejectionReason === expectedReason, `${label} muss ${expectedReason} liefern, erhalten: ${JSON.stringify(result)}`);
  return result;
}

async function countInventoryItems(userId, itemId) {
  const snapshot = await db.collection("userInventory")
    .where("ownerUserId", "==", userId)
    .where("itemId", "==", itemId)
    .get();
  return snapshot.size;
}

async function countClaims(userId, tagId, missionId) {
  const snapshot = await db.collection("nfcScanClaims")
    .where("userId", "==", userId)
    .where("tagId", "==", tagId)
    .where("missionId", "==", missionId)
    .get();
  return snapshot.size;
}

async function run() {
  console.log("WellFit Callable Functions Emulator Test startet...");
  await resetDemoCollections();

  const adminToken = await createAuthUser("callable-admin", true);
  const userToken = await createAuthUser("callable-user", false);
  const otherUserToken = await createAuthUser("callable-other-user", false);

  const normalSeed = await callCallable("seedDemoItemsAndNfc", userToken, {});
  assert(normalSeed.status === 403 || normalSeed.json.error, "Normaler Nutzer darf seedDemoItemsAndNfc nicht ausfuehren.");

  const adminSeed = await callCallable("seedDemoItemsAndNfc", adminToken, {});
  const adminSeedResult = getCallableResult(adminSeed);
  assert(adminSeed.ok, `Admin Seed muss HTTP OK sein: ${describeCall(adminSeed)}`);
  assert(adminSeedResult && adminSeedResult.accepted === true, "Admin Seed muss accepted=true liefern.");
  assert(adminSeedResult.itemDefinitions === 3, "Admin Seed muss 3 Item-Definitionen anlegen.");
  assert(adminSeedResult.nfcTags === 2, "Admin Seed muss 2 NFC-Tags anlegen.");

  await assertRejectedScan({ token: userToken, publicCode: "", missionId: "demo_tree_clue_001", expectedReason: "missing-public-code", label: "Fehlender NFC Code" });
  await assertRejectedScan({ token: userToken, publicCode: "UNKNOWN-CODE", missionId: "demo_tree_clue_001", expectedReason: "tag-not-found", label: "Unbekannter NFC Code" });

  await db.collection("nfcTags").doc("demo_nfc_revoked_001").set({ publicCode: "WF-DEMO-REVOKED-001", purpose: "grantItem", status: "revoked", linkedItemId: "rope_001", linkedCapabilityId: "climbUp", linkedMissionId: "demo_tree_clue_001", usageLimit: 100, usageCount: 0 });
  await assertRejectedScan({ token: userToken, publicCode: "WF-DEMO-REVOKED-001", missionId: "demo_tree_clue_001", expectedReason: "tag-revoked", label: "Revoked NFC Tag" });

  await db.collection("nfcTags").doc("demo_nfc_inactive_001").set({ publicCode: "WF-DEMO-INACTIVE-001", purpose: "grantItem", status: "inactive", linkedItemId: "rope_001", linkedCapabilityId: "climbUp", linkedMissionId: "demo_tree_clue_001", usageLimit: 100, usageCount: 0 });
  await assertRejectedScan({ token: userToken, publicCode: "WF-DEMO-INACTIVE-001", missionId: "demo_tree_clue_001", expectedReason: "tag-not-active", label: "Inactive NFC Tag" });

  await db.collection("nfcTags").doc("demo_nfc_user_locked_001").set({ publicCode: "WF-DEMO-USER-LOCKED-001", purpose: "grantItem", status: "active", linkedItemId: "rope_001", linkedCapabilityId: "climbUp", linkedMissionId: "demo_tree_clue_001", usageLimit: 100, usageCount: 0, allowedUserIds: ["callable-user"] });
  await assertRejectedScan({ token: otherUserToken, publicCode: "WF-DEMO-USER-LOCKED-001", missionId: "demo_tree_clue_001", expectedReason: "user-not-allowed", label: "Falscher Nutzer" });

  await db.collection("nfcTags").doc("demo_nfc_limit_reached_001").set({ publicCode: "WF-DEMO-LIMIT-001", purpose: "grantItem", status: "active", linkedItemId: "rope_001", linkedCapabilityId: "climbUp", linkedMissionId: "demo_tree_clue_001", usageLimit: 1, usageCount: 1 });
  await assertRejectedScan({ token: userToken, publicCode: "WF-DEMO-LIMIT-001", missionId: "demo_tree_clue_001", expectedReason: "usage-limit-reached", label: "Usage Limit erreicht" });

  const nfcScan = await callCallable("validateNfcScan", userToken, { publicCode: "WF-DEMO-ROPE-TREE-001", missionId: "demo_tree_clue_001", deviceId: "callable-test-device-001", appSessionId: "callable-test-session-001" });
  const nfcResult = getCallableResult(nfcScan);
  assert(nfcScan.ok, `validateNfcScan muss HTTP OK sein: ${describeCall(nfcScan)}`);
  assert(nfcResult.accepted === true, "validateNfcScan muss accepted=true liefern.");
  assert(nfcResult.claimId, "validateNfcScan muss claimId liefern.");
  assert(nfcResult.grantedItemId === "rope_001", "validateNfcScan muss rope_001 vergeben.");
  assert(nfcResult.grantedCapabilityId === "climbUp", "validateNfcScan muss climbUp freischalten.");
  assert(await countClaims("callable-user", "demo_nfc_rope_tree_001", "demo_tree_clue_001") === 1, "Erfolgreicher NFC Scan muss genau einen Claim erzeugen.");

  const inventorySnapshot = await db.collection("userInventory").where("ownerUserId", "==", "callable-user").where("itemId", "==", "rope_001").get();
  assert(!inventorySnapshot.empty, "Callable NFC Scan muss userInventory rope_001 erzeugen.");

  const capabilityDoc = await db.collection("buddyCapabilities").doc("callable-user_default_climbUp").get();
  assert(capabilityDoc.exists, "Callable NFC Scan muss buddyCapabilities climbUp erzeugen.");
  assert(capabilityDoc.data().unlocked === true, "Callable NFC Scan muss climbUp unlocked=true setzen.");

  const duplicate = await assertRejectedScan({ token: userToken, publicCode: "WF-DEMO-ROPE-TREE-001", missionId: "demo_tree_clue_001", expectedReason: "duplicate-scan", label: "Duplicate Scan" });
  assert(duplicate.tagId === "demo_nfc_rope_tree_001", "Duplicate Scan muss Tag-ID zurueckgeben.");
  assert(await countInventoryItems("callable-user", "rope_001") === 1, "Duplicate Scan darf kein zweites rope_001 vergeben.");
  assert(await countClaims("callable-user", "demo_nfc_rope_tree_001", "demo_tree_clue_001") === 1, "Duplicate Scan darf keinen zweiten Claim erzeugen.");

  const magnifierScan = await callCallable("validateNfcScan", userToken, { publicCode: "WF-DEMO-MAGNIFIER-LEAF-001", missionId: "demo_leaf_quiz_001", deviceId: "callable-test-device-002", appSessionId: "callable-test-session-002" });
  const magnifierResult = getCallableResult(magnifierScan);
  assert(magnifierScan.ok, `Magnifier Flow muss HTTP OK sein: ${describeCall(magnifierScan)}`);
  assert(magnifierResult.accepted === true, "Magnifier Flow muss accepted=true liefern.");
  assert(magnifierResult.claimId, "Magnifier Flow muss claimId liefern.");
  assert(magnifierResult.grantedItemId === "magnifier_001", "Magnifier Flow muss magnifier_001 vergeben.");
  assert(magnifierResult.grantedCapabilityId === "scanObject", "Magnifier Flow muss scanObject freischalten.");
  const scanObjectDoc = await db.collection("buddyCapabilities").doc("callable-user_default_scanObject").get();
  assert(scanObjectDoc.exists, "Magnifier Flow muss buddyCapabilities scanObject erzeugen.");
  assert(scanObjectDoc.data().unlocked === true, "Magnifier Flow muss scanObject unlocked=true setzen.");

  const audit = await callCallable("auditItemUse", userToken, { buddyId: "default", inventoryItemId: inventorySnapshot.docs[0].id, itemId: "rope_001", capabilityId: "climbUp", missionId: "demo_tree_clue_001", arSessionId: "callable-ar-session-001", status: "completed" });
  const auditResult = getCallableResult(audit);
  assert(audit.ok, `auditItemUse muss HTTP OK sein: ${describeCall(audit)}`);
  assert(auditResult.accepted === true, "auditItemUse muss accepted=true liefern.");
  assert(auditResult.eventId, "auditItemUse muss eventId liefern.");

  const trackingSession = await callCallable("createTrackingSession", userToken, { missionId: "demo_tree_clue_001", source: "mobile", proofType: "motion", deviceId: "tracking-device-001", appSessionId: "tracking-app-session-001" });
  const trackingSessionResult = getCallableResult(trackingSession);
  assert(trackingSession.ok, `createTrackingSession muss HTTP OK sein: ${describeCall(trackingSession)}`);
  assert(trackingSessionResult.accepted === true, "createTrackingSession muss accepted=true liefern.");
  assert(trackingSessionResult.sessionId, "createTrackingSession muss sessionId liefern.");
  const trackingDoc = await db.collection("trackingSessions").doc(trackingSessionResult.sessionId).get();
  assert(trackingDoc.exists, "createTrackingSession muss trackingSessions Dokument schreiben.");
  assert(trackingDoc.data().userId === "callable-user", "trackingSessions userId muss callable-user sein.");
  assert(trackingDoc.data().rewardAuthorized === false, "Tracking Session darf keinen Reward autorisieren.");
  assert(trackingDoc.data().missionCompletionAuthorized === false, "Tracking Session darf keine Mission Completion autorisieren.");

  const trackingProof = await callCallable("recordTrackingProof", userToken, { sessionId: trackingSessionResult.sessionId, proofType: "motion", status: "completed", deviceId: "tracking-device-001" });
  const trackingProofResult = getCallableResult(trackingProof);
  assert(trackingProof.ok, `recordTrackingProof muss HTTP OK sein: ${describeCall(trackingProof)}`);
  assert(trackingProofResult.accepted === true, "recordTrackingProof muss accepted=true liefern.");
  assert(trackingProofResult.proofEventId, "recordTrackingProof muss proofEventId liefern.");
  const proofDoc = await db.collection("trackingProofEvents").doc(trackingProofResult.proofEventId).get();
  assert(proofDoc.exists, "recordTrackingProof muss trackingProofEvents Dokument schreiben.");
  assert(proofDoc.data().rewardAuthorized === false, "Tracking Proof darf keinen Reward autorisieren.");
  assert(proofDoc.data().missionCompletionAuthorized === false, "Tracking Proof darf keine Mission Completion autorisieren.");

  const otherUserProof = await callCallable("recordTrackingProof", otherUserToken, { sessionId: trackingSessionResult.sessionId, proofType: "motion" });
  assert(otherUserProof.status === 403 || otherUserProof.json.error, "Fremder Nutzer darf Tracking Proof nicht fuer fremde Session schreiben.");

  const buddyEvent = await callCallable("createMissionBuddyEvent", userToken, { missionId: "demo_tree_clue_001", buddyId: "default", eventType: "buddyActionRequested", status: "requested", itemId: "rope_001", capabilityId: "climbUp", messageKey: "buddy.climb.requested" });
  const buddyEventResult = getCallableResult(buddyEvent);
  assert(buddyEvent.ok, `createMissionBuddyEvent muss HTTP OK sein: ${describeCall(buddyEvent)}`);
  assert(buddyEventResult.accepted === true, "createMissionBuddyEvent muss accepted=true liefern.");
  assert(buddyEventResult.eventId, "createMissionBuddyEvent muss eventId liefern.");
  const buddyEventDoc = await db.collection("missionBuddyEvents").doc(buddyEventResult.eventId).get();
  assert(buddyEventDoc.exists, "createMissionBuddyEvent muss missionBuddyEvents Dokument schreiben.");
  assert(buddyEventDoc.data().userId === "callable-user", "missionBuddyEvents userId muss callable-user sein.");
  assert(buddyEventDoc.data().rewardAuthorized === false, "Buddy Event darf keinen Reward autorisieren.");
  assert(buddyEventDoc.data().missionCompletionAuthorized === false, "Buddy Event darf keine Mission Completion autorisieren.");

  const invalidTrackingSession = await callCallable("createTrackingSession", userToken, { source: "mobile", proofType: "motion" });
  assert(invalidTrackingSession.status === 400 || invalidTrackingSession.json.error, "createTrackingSession ohne missionId muss abgelehnt werden.");

  const wrongMission = await callCallable("validateNfcScan", userToken, { publicCode: "WF-DEMO-ROPE-TREE-001", missionId: "wrong_mission" });
  const wrongMissionResult = getCallableResult(wrongMission);
  assert(wrongMission.ok, `wrong mission response soll HTTP OK sein: ${describeCall(wrongMission)}`);
  assert(wrongMissionResult.accepted === false, "Falsche Mission muss accepted=false liefern.");
  assert(wrongMissionResult.rejectionReason === "mission-mismatch", "Falsche Mission muss mission-mismatch liefern.");

  console.log("WellFit Callable Functions Emulator Test erfolgreich.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
