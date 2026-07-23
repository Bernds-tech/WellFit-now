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

async function createAuthUser(uid, adminClaim) {
  await safeDeleteUser(uid);
  await auth.createUser({ uid, email: `${uid}@wellfit.test`, emailVerified: true });
  const agentRoleByUid = {
    "agent-owner": "owner",
    "agent-supervisor": "agent_supervisor",
    "agent-operator": "admin_operator",
    "agent-readonly": "readonly_observer",
  };
  const customClaims = { ...(adminClaim ? { admin: true } : {}), ...(agentRoleByUid[uid] ? { agentRole: agentRoleByUid[uid] } : {}) };
  if (Object.keys(customClaims).length) await auth.setCustomUserClaims(uid, customClaims);
  const customToken = await auth.createCustomToken(uid, Object.keys(customClaims).length ? customClaims : undefined);
  const response = await fetch(`http://${AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-api-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  });
  const json = await response.json();
  if (!response.ok || !json.idToken) throw new Error(`Auth Emulator signInWithCustomToken failed: ${JSON.stringify(json)}`);
  const decoded = decodeJwtPayload(json.idToken);
  if (adminClaim) assert(decoded.admin === true, `Admin ID token enthaelt keinen admin Claim: ${JSON.stringify(decoded)}`);
  if (agentRoleByUid[uid]) assert(decoded.agentRole === agentRoleByUid[uid], `Admin ID token enthaelt keinen agentRole Claim: ${JSON.stringify(decoded)}`);
  return json.idToken;
}

async function callCallable(functionName, idToken, data) {
  const response = await fetch(`${FUNCTIONS_BASE_URL}/${functionName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
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
  return callResponse.json && Object.prototype.hasOwnProperty.call(callResponse.json, "result") ? callResponse.json.result : null;
}

function describeCall(callResponse) {
  return JSON.stringify({ status: callResponse.status, ok: callResponse.ok, json: callResponse.json, rawText: callResponse.rawText });
}

async function resetBeta1Collections() {
  const collections = [
    "familyAccounts", "childProfiles", "guardianChildLinks", "parentalConsents", "missions", "missionAttempts", "missionEvidence", "missionCompletions",
    "trackingSessions", "trackingProofEvents", "missionBuddyEvents", "missionContextEvaluations", "missionCompletionEvaluations", "missionRewardPreviews", "missionEvidenceReviews", "missionPatternReviews", "missionCooldownReviews", "missionRewardEvents",
    "userCalendarSettings", "userDailyMissionState", "userDailyStreaks", "userLevels", "xpWallets", "xpLedgerEvents", "ledgerEvents", "auditEvents", "adminActions", "itemDefinitions", "shopItems", "shopPurchaseIntents", "shopPurchaseEvents", "userInventory", "userAvatars", "buddyCareActions",
    "missionLocations", "adventureAccessEvents", "checkpoints", "checkpointScores", "checkpointMayors", "mayorShareEvents", "glitchEvents", "glitchParticipants", "glitchBoostWindows", "glitchSafetyRules", "safetyReports",
  ];
  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).limit(500).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}

async function seedBeta1RuntimeData() {
  await db.collection("shopItems").doc("beta_shoes").set({ shopItemId: "beta_shoes", itemDefinitionId: "shoes_001", priceWfxp: 20, category: "cosmetic", childAllowed: true, status: "published" });
  await db.collection("shopItems").doc("adult_item").set({ shopItemId: "adult_item", itemDefinitionId: "adult_001", priceWfxp: 20, category: "cosmetic", childAllowed: false, status: "published" });
}

module.exports = {
  PROJECT_ID,
  FIRESTORE_EMULATOR_HOST,
  db,
  admin,
  assert,
  createAuthUser,
  callCallable,
  getCallableResult,
  describeCall,
  resetBeta1Collections,
  seedBeta1RuntimeData,
};