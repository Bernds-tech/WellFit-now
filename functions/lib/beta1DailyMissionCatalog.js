const { FieldValue } = require("firebase-admin/firestore");
const catalog = require("../config/beta1-daily-missions.json");
const {
  requireAdmin,
  optionalString,
  writeAudit,
} = require("./beta1Runtime");

const ALLOWED_DIFFICULTIES = new Set(["Leicht", "Mittel", "Schwer"]);
const ALLOWED_DISPLAY_TYPES = new Set(["Bewegung", "Ernährung", "Workout", "Community", "Abenteuer"]);
const ALLOWED_SERVER_TYPES = new Set(["movement", "workout", "learning", "nutrition", "wellness"]);
const REQUIRED_COMPLETION_POLICY = "once-per-mission-per-vienna-day";

function validateCatalog(HttpsError) {
  if (!catalog || !Array.isArray(catalog.missions) || catalog.missions.length === 0) {
    throw new HttpsError("failed-precondition", "Beta-1 Tagesmissionskatalog fehlt oder ist leer.");
  }
  if (catalog.completionPolicy !== REQUIRED_COMPLETION_POLICY) {
    throw new HttpsError("failed-precondition", "Beta-1 Tagesmissionskatalog hat keine sichere Tagesabschlussgrenze.");
  }
  const ids = new Set();
  for (const mission of catalog.missions) {
    const missionId = optionalString(mission.missionId, 160);
    const title = optionalString(mission.title, 120);
    const description = optionalString(mission.description, 600);
    const duration = optionalString(mission.duration, 80);
    const rewardXp = Number(mission.rewardXp);
    if (!missionId || !title || !description || !duration) {
      throw new HttpsError("failed-precondition", "Tagesmissionskatalog enthaelt unvollstaendige Pflichtfelder.");
    }
    if (ids.has(missionId)) {
      throw new HttpsError("failed-precondition", `Tagesmissionskatalog enthaelt doppelte ID: ${missionId}`);
    }
    ids.add(missionId);
    if (!Number.isInteger(rewardXp) || rewardXp < 1 || rewardXp > 100) {
      throw new HttpsError("failed-precondition", `Ungueltige WFXP-Hoehe fuer ${missionId}.`);
    }
    if (!ALLOWED_DIFFICULTIES.has(mission.difficulty)) {
      throw new HttpsError("failed-precondition", `Ungueltige Schwierigkeit fuer ${missionId}.`);
    }
    if (!ALLOWED_DISPLAY_TYPES.has(mission.displayType)) {
      throw new HttpsError("failed-precondition", `Ungueltiger Display-Typ fuer ${missionId}.`);
    }
    if (!ALLOWED_SERVER_TYPES.has(mission.type)) {
      throw new HttpsError("failed-precondition", `Ungueltiger Server-Typ fuer ${missionId}.`);
    }
    if (mission.childAllowed !== false || mission.reviewRequired !== true || mission.evidenceType !== "daily-user-confirmation") {
      throw new HttpsError("failed-precondition", `Unsichere Beta-1 Kataloggrenze fuer ${missionId}.`);
    }
  }
  return catalog.missions;
}

function publicCatalogMission(mission) {
  return {
    missionId: mission.missionId,
    title: mission.title,
    rewardXp: mission.rewardXp,
    difficulty: mission.difficulty,
    description: mission.description,
    duration: mission.duration,
    displayType: mission.displayType,
    type: mission.type,
    childAllowed: false,
    evidenceType: "daily-user-confirmation",
    reviewRequired: true,
    completionPolicy: REQUIRED_COMPLETION_POLICY,
    status: "published",
    noMonetaryValue: true,
    tokenAuthorized: false,
    cashoutAllowed: false,
  };
}

function registerBeta1DailyMissionCatalog(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.adminEnsureDailyMissionCatalog = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const missions = validateCatalog(HttpsError);
    const batch = db.batch();
    const nowIso = new Date().toISOString();

    for (const mission of missions) {
      const missionRef = db.collection("missions").doc(mission.missionId);
      batch.set(missionRef, {
        missionId: mission.missionId,
        catalogId: catalog.catalogId,
        catalogVersion: catalog.version,
        title: mission.title,
        type: mission.type,
        displayType: mission.displayType,
        difficulty: mission.difficulty,
        description: mission.description,
        duration: mission.duration,
        rewardXp: mission.rewardXp,
        childAllowed: false,
        status: "published",
        completionPolicy: REQUIRED_COMPLETION_POLICY,
        evidencePolicy: {
          reviewRequired: true,
          allowedEvidenceTypes: ["daily-user-confirmation"],
          rawMediaRequired: false,
        },
        currency: "WFXP",
        noMonetaryValue: true,
        tokenAuthorized: false,
        cashoutAllowed: false,
        updatedAt: FieldValue.serverTimestamp(),
        catalogReconciledAt: nowIso,
        createdAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    await batch.commit();
    await writeAudit(db, {
      actorUserId,
      actionType: "daily-mission-catalog-ensured",
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
      missions: missions.map(publicCatalogMission),
    };
  });
}

module.exports = {
  registerBeta1DailyMissionCatalog,
  validateCatalog,
  publicCatalogMission,
};
