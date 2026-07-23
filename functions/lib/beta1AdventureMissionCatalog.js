const { FieldValue } = require("firebase-admin/firestore");
const catalog = require("../config/beta1-adventure-missions.json");
const {
  requireAdmin,
  optionalString,
  writeAudit,
} = require("./beta1Runtime");

const ALLOWED_CATEGORIES = new Set(["Museen", "Parks & Städte", "Tierparks", "Burgen & Natur"]);
const ALLOWED_DISPLAY_TYPES = new Set(["Bewegung", "Abenteuer"]);
const ALLOWED_SERVER_TYPES = new Set(["movement", "learning", "ar"]);
const REQUIRED_COMPLETION_POLICY = "once-per-mission-per-user";
const REQUIRED_ACCESS_POLICY = "one-time-wfxp-access-per-user";
const REQUIRED_LOCATION_POLICY = "nearby-published-location";
const REQUIRED_EVIDENCE_TYPE = "adventure-user-confirmation";

function asStringList(value, maxItems = 10, maxLength = 120) {
  return Array.isArray(value)
    ? value.map((item) => optionalString(item, maxLength)).filter(Boolean).slice(0, maxItems)
    : [];
}

function validateAdventureCatalog(HttpsError) {
  if (!catalog || !Array.isArray(catalog.missions) || catalog.missions.length !== 4) {
    throw new HttpsError("failed-precondition", "Beta-1 Abenteuerkatalog muss genau vier Missionen enthalten.");
  }
  if (
    catalog.completionPolicy !== REQUIRED_COMPLETION_POLICY
    || catalog.accessPolicy !== REQUIRED_ACCESS_POLICY
    || catalog.locationPolicy !== REQUIRED_LOCATION_POLICY
    || Number(catalog.startRadiusMeters) !== 500
  ) {
    throw new HttpsError("failed-precondition", "Beta-1 Abenteuerkatalog hat keine sichere Zugangs-, Orts- und Abschlussgrenze.");
  }

  const ids = new Set();
  for (const mission of catalog.missions) {
    const missionId = optionalString(mission.missionId, 160);
    const title = optionalString(mission.title, 120);
    const shortLabel = optionalString(mission.shortLabel, 40);
    const description = optionalString(mission.description, 600);
    const rewardXp = Number(mission.rewardXp);
    const accessCostWfxp = Number(mission.accessCostWfxp);
    const locationTypes = asStringList(mission.locationTypes);
    const milestones = asStringList(mission.milestones, 10, 240);
    if (!missionId || !title || !shortLabel || !description || locationTypes.length === 0 || milestones.length === 0) {
      throw new HttpsError("failed-precondition", "Abenteuerkatalog enthaelt unvollstaendige Pflichtfelder.");
    }
    if (ids.has(missionId)) {
      throw new HttpsError("failed-precondition", `Abenteuerkatalog enthaelt doppelte ID: ${missionId}`);
    }
    ids.add(missionId);
    if (!Number.isInteger(rewardXp) || rewardXp < 1 || rewardXp > 300) {
      throw new HttpsError("failed-precondition", `Ungueltige WFXP-Belohnung fuer ${missionId}.`);
    }
    if (!Number.isInteger(accessCostWfxp) || accessCostWfxp < 0 || accessCostWfxp > 50) {
      throw new HttpsError("failed-precondition", `Ungueltiger WFXP-Zugangspreis fuer ${missionId}.`);
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

function publicAdventureMission(mission) {
  return {
    missionId: mission.missionId,
    title: mission.title,
    shortLabel: mission.shortLabel,
    rewardXp: mission.rewardXp,
    accessCostWfxp: mission.accessCostWfxp,
    category: mission.category,
    description: mission.description,
    displayType: mission.displayType,
    type: mission.type,
    locationTypes: asStringList(mission.locationTypes),
    milestones: asStringList(mission.milestones, 10, 240),
    childAllowed: false,
    evidenceType: REQUIRED_EVIDENCE_TYPE,
    reviewRequired: true,
    completionPolicy: REQUIRED_COMPLETION_POLICY,
    accessPolicy: REQUIRED_ACCESS_POLICY,
    locationPolicy: REQUIRED_LOCATION_POLICY,
    startRadiusMeters: 500,
    status: "published",
    noMonetaryValue: true,
    tokenAuthorized: false,
    cashoutAllowed: false,
  };
}

function registerBeta1AdventureMissionCatalog(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.adminEnsureAdventureMissionCatalog = onCall(async (request) => {
    const actorUserId = requireAdmin(request, HttpsError);
    const missions = validateAdventureCatalog(HttpsError);
    const batch = db.batch();
    const reconciledAt = new Date().toISOString();

    for (const mission of missions) {
      const missionRef = db.collection("missions").doc(mission.missionId);
      batch.set(missionRef, {
        missionId: mission.missionId,
        catalogId: catalog.catalogId,
        catalogVersion: catalog.version,
        title: mission.title,
        shortLabel: mission.shortLabel,
        type: mission.type,
        displayType: mission.displayType,
        category: mission.category,
        description: mission.description,
        locationTypes: asStringList(mission.locationTypes),
        milestones: asStringList(mission.milestones, 10, 240),
        rewardXp: mission.rewardXp,
        accessCostWfxp: mission.accessCostWfxp,
        childAllowed: false,
        status: "published",
        completionPolicy: REQUIRED_COMPLETION_POLICY,
        accessPolicy: REQUIRED_ACCESS_POLICY,
        locationPolicy: REQUIRED_LOCATION_POLICY,
        startRadiusMeters: 500,
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
      actionType: "adventure-mission-catalog-ensured",
      targetType: "missionCatalog",
      targetId: catalog.catalogId,
      metadata: {
        catalogVersion: catalog.version,
        missionCount: missions.length,
        childAllowed: false,
        reviewRequired: true,
        completionPolicy: REQUIRED_COMPLETION_POLICY,
        accessPolicy: REQUIRED_ACCESS_POLICY,
        locationPolicy: REQUIRED_LOCATION_POLICY,
        startRadiusMeters: 500,
      },
    });

    return {
      accepted: true,
      catalogId: catalog.catalogId,
      catalogVersion: catalog.version,
      completionPolicy: REQUIRED_COMPLETION_POLICY,
      accessPolicy: REQUIRED_ACCESS_POLICY,
      locationPolicy: REQUIRED_LOCATION_POLICY,
      startRadiusMeters: 500,
      count: missions.length,
      currency: "WFXP",
      noMonetaryValue: true,
      tokenAuthorized: false,
      cashoutAllowed: false,
      missions: missions.map(publicAdventureMission),
    };
  });
}

module.exports = {
  registerBeta1AdventureMissionCatalog,
  validateAdventureCatalog,
  publicAdventureMission,
  REQUIRED_COMPLETION_POLICY,
  REQUIRED_ACCESS_POLICY,
  REQUIRED_LOCATION_POLICY,
  REQUIRED_EVIDENCE_TYPE,
};