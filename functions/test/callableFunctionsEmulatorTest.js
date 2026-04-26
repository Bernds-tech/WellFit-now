/*
  WellFit Callable Functions Emulator Test

  Zweck:
  Testet echte Callable Function HTTP-Endpunkte im Firebase Emulator:
  - seedDemoItemsAndNfc mit Admin-Claim erfolgreich
  - seedDemoItemsAndNfc ohne Admin-Claim verboten
  - validateNfcScan als normaler Nutzer erfolgreich
  - auditItemUse als normaler Nutzer erfolgreich

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
    "userInventory",
    "buddyCapabilities",
    "capabilityUnlockEvents",
    "buddyItemUseEvents",
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

async function run() {
  console.log("WellFit Callable Functions Emulator Test startet...");
  await resetDemoCollections();

  const adminToken = await createAuthUser("callable-admin", true);
  const userToken = await createAuthUser("callable-user", false);

  const normalSeed = await callCallable("seedDemoItemsAndNfc", userToken, {});
  assert(normalSeed.status === 403 || normalSeed.json.error, "Normaler Nutzer darf seedDemoItemsAndNfc nicht ausfuehren.");

  const adminSeed = await callCallable("seedDemoItemsAndNfc", adminToken, {});
  const adminSeedResult = getCallableResult(adminSeed);
  assert(adminSeed.ok, `Admin Seed muss HTTP OK sein: ${describeCall(adminSeed)}`);
  assert(adminSeedResult && adminSeedResult.accepted === true, "Admin Seed muss accepted=true liefern.");
  assert(adminSeedResult.itemDefinitions === 3, "Admin Seed muss 3 Item-Definitionen anlegen.");
  assert(adminSeedResult.nfcTags === 2, "Admin Seed muss 2 NFC-Tags anlegen.");

  const nfcScan = await callCallable("validateNfcScan", userToken, {
    publicCode: "WF-DEMO-ROPE-TREE-001",
    missionId: "demo_tree_clue_001",
    deviceId: "callable-test-device-001",
    appSessionId: "callable-test-session-001",
  });
  const nfcResult = getCallableResult(nfcScan);
  assert(nfcScan.ok, `validateNfcScan muss HTTP OK sein: ${describeCall(nfcScan)}`);
  assert(nfcResult.accepted === true, "validateNfcScan muss accepted=true liefern.");
  assert(nfcResult.grantedItemId === "rope_001", "validateNfcScan muss rope_001 vergeben.");
  assert(nfcResult.grantedCapabilityId === "climbUp", "validateNfcScan muss climbUp freischalten.");

  const inventorySnapshot = await db.collection("userInventory")
    .where("ownerUserId", "==", "callable-user")
    .where("itemId", "==", "rope_001")
    .get();
  assert(!inventorySnapshot.empty, "Callable NFC Scan muss userInventory rope_001 erzeugen.");

  const capabilityDoc = await db.collection("buddyCapabilities").doc("callable-user_default_climbUp").get();
  assert(capabilityDoc.exists, "Callable NFC Scan muss buddyCapabilities climbUp erzeugen.");
  assert(capabilityDoc.data().unlocked === true, "Callable NFC Scan muss climbUp unlocked=true setzen.");

  const audit = await callCallable("auditItemUse", userToken, {
    buddyId: "default",
    inventoryItemId: inventorySnapshot.docs[0].id,
    itemId: "rope_001",
    capabilityId: "climbUp",
    missionId: "demo_tree_clue_001",
    arSessionId: "callable-ar-session-001",
    status: "completed",
  });
  const auditResult = getCallableResult(audit);
  assert(audit.ok, `auditItemUse muss HTTP OK sein: ${describeCall(audit)}`);
  assert(auditResult.accepted === true, "auditItemUse muss accepted=true liefern.");
  assert(auditResult.eventId, "auditItemUse muss eventId liefern.");

  const wrongMission = await callCallable("validateNfcScan", userToken, {
    publicCode: "WF-DEMO-ROPE-TREE-001",
    missionId: "wrong_mission",
  });
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
