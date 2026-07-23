const { FieldValue } = require("firebase-admin/firestore");
const catalog = require("../config/beta1-challenge-missions.json");
const {
  requireAdmin,
  optionalString,
  writeAudit,
} = require("./beta1Runtime");

const ALLOWED_CATEGORIES = new Set([
  "Sport & Bewegung",
  "Fitness & Klarheit",
  "Wissen & Klarheit",
  "Geschicklichkeit",
  "AR & Erlebnis",
  "Wellness & Mindset",
]);
const ALLOWED_DISPLAY_TYPES = new Set(["Bewegung", "Workout", "Abenteuer"]);
const ALLOWED_SERVER_TYPES = new Set(["movement", "workout", "learning", "skill", "ar", "wellness"]);
const REQUIRED_COMPLETION_POLICY = "once-per-mission-per-user";
const REQUIRED_EVIDENCE_TYPE = "challenge-user-confirmation";

function validateChallengeCatalog(HttpsError) {
  if (!catalog || !Array.isArray(catalog.missions) || catalog.missions.length !== 6) {
    throw new HttpsError("failed-precondition", "Beta-1 Challenge-Katalog muss genau sechs Missionen enthalten.");
  }
  if (catalog.completionPolicy !== REQUIRED_COMPLETION_POLICY) {
    throw new HttpsError("failed-precondition", "Beta-1 Challenge-Katalog hat keine sichere Abschlussgrenze.");
  }

  const ids = new Set();
  for (const mission of catalog.missions) {
    const missionId = optionalString(mission.missionId, 160);
    const title = optionalString(mission.title, 120);
    const description = optionalString(mission.description, 600);
    const levelRecommendation = optionalString(mission.levelRecommendation, 20);
    const movementGoal = optionalString(mission.movementGoal, 80);
    const rewardXp = Number(mission.rewardXp);
    if (!missionId || !title || !description || !levelRecommendation || !movementGoal) {
      throw new HttpsError("failed-precondition", "Challenge-Katalog enthaelt unvollstaendige Pflichtfelder.");
    }
    if (ids.has(missionId)) {
      throw new HttpsError("failed-precondition", `Challenge-Katalog enthaelt doppelte ID: ${missionId}`);
    }
    ids.add(missionId);
    if (!Number.isInteger(rewardXp) || rewardXp < 1 || rewardXp > 150) {
      throw new HttpsError("failed-precondition", `Ungueltige WFXP-Hoehe fuer ${missionId}.`);
    }
    if (!ALLOWED_CATEGORIES.has(mission.category)) {
      throw new HttpsError("failed-precondition", `Ungueltige Kategorie fuer ${missionId}.`);
    }
    if (!ALLOWED_DISPLAY_TYPES.has(mission.displayType)) {
      throw new HttpsError("failed-precondition", `Ungueltiger Display-Typ fuer ${missionId}.`);
    }
    if (!ALLOWED_SERVER_TYPES.has(mission.type)) {
      throw new HttpsError("failed-precondition", `Ungueltiger Server-Typ fuer ${missionId}.`);
    }
    if (
      mission.childAllowed !== false
      || mission.reviewRequired !== true
      || mission.evidenceType !== REQUIRED_EVIDENCE_TYPE
    ) {
      throw new HttpsError("failed-precondition", `Unsichere Beta-1 Kataloggrenze fuer ${missionId}.`);
    }
  }
  return catalog.missions;
}

function publicChallengeMission(mission) {
  return {
    missionId: mission.missionId,
    title: mission.title,
    rewardXp: mission.rewardXp,
    category: mission.category,
    description: mission.description,
    displayType: mission.displayType,
    type: mission.type,
    levelRecommendation: mission.levelRecommendation,
    movementGoal: mission.movementGoal,
    childAllowed: false,
    evidenceType: REQUIRED_EVIDENCE_TYPE,
    reviewRequired: true,
    completionPolicy: REQUIRED_COMPLETION_POLICY,
    status: "published",
    noMonetaryValue: true,
    tokenAuthorized: false,
    cashoutAllowed: false,
  };
}

function registerBeta1ChallengeMissionCatalog(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.adminEnsureChallengeMissionCatalog = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const missions = validateChallengeCatalog(HttpsError);
    const batch = db.batch();
    const reconciledAt = new Date().toISOString();

    for (const mission of missions) {
      const missionRef = db.collection("missions").doc(mission.missionId);
      batch.set(missionRef, {
        missionId: mission.missionId,
        catalogId: catalog.catalogId,
        catalogVersion: catalog.version,
        title: mission.title,
        type: mission.type,
        displayType: mission.displayType,
        category: mission.category,
        description: mission.description,
        levelRecommendation: mission.levelRecommendation,
        movementGoal: mission.movementGoal,
        rewardXp: mission.rewardXp,
        childAllowed: false,
        status: "published",
        completionPolicy: REQUIRED_COMPLETION_POLICY,
        evidencePolicy: {
          reviewRequired: true,
          allowedEvidenceTypes: [REQUIRED_EVIDENCE_TYPE],
          rawMediaRequired: false,
        },
        currency: "WFXP",
        noMonetaryValue: true,
        tokenAuthorized: false,
        cashoutAllowed: false,
        updatedAt: FieldValue.serverTimestamp(),
        catalogReconciledAt: reconciledAt,
        createdAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    await batch.commit();
    await writeAudit(db, {
      actorUserId,
      actionType: "challenge-mission-catalog-ensured",
      targetType: "missionCatalog",
      targetId: catalog.catalogId,
      metadata: {
        catalogVersion: catalog.version,
        missionCount: missions.length,
        childAllowed: false,
        reviewRequired: true,
        completionPolicy: REQUIRED_COMPLETION_POLICY,
      },
    });

    return {
      accepted: true,
      catalogId: catalog.catalogId,
      catalogVersion: catalog.version,
      completionPolicy: REQUIRED_COMPLETION_POLICY,
      count: missions.length,
      currency: "WFXP",
      noMonetaryValue: true,
      tokenAuthorized: false,
      cashoutAllowed: false,
      missions: missions.map(publicChallengeMission),
    };
  });
}

module.exports = {
  registerBeta1ChallengeMissionCatalog,
  validateChallengeCatalog,
  publicChallengeMission,
  REQUIRED_COMPLETION_POLICY,
  REQUIRED_EVIDENCE_TYPE,
};
