class CatalogValidationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "CatalogValidationError";
    this.code = code;
  }
}

function missionOperation(path, data, documentExists) {
  return {
    type: "merge",
    path,
    data,
    ensureCreatedAt: true,
    documentExists,
    touchUpdatedAt: true,
  };
}

async function existingMissionMap(getDocuments, missionIds) {
  const paths = missionIds.map((missionId) => `missions/${missionId}`);
  return getDocuments(paths);
}

function sharedMissionFields({ catalog, mission, evidenceType, nowIso, seedId, seedVersion }) {
  return {
    missionId: mission.missionId,
    catalogId: catalog.catalogId,
    catalogVersion: catalog.version,
    title: mission.title,
    type: mission.type,
    displayType: mission.displayType,
    description: mission.description,
    rewardXp: mission.rewardXp,
    childAllowed: false,
    status: "published",
    completionPolicy: catalog.completionPolicy,
    evidencePolicy: {
      reviewRequired: true,
      allowedEvidenceTypes: [evidenceType],
      rawMediaRequired: false,
    },
    currency: "WFXP",
    noMonetaryValue: true,
    blockchainBacked: false,
    tokenAuthorized: false,
    cashoutAllowed: false,
    realMoney: false,
    seedId,
    seedVersion,
    seedAuthority: "versioned-database-seed",
    catalogReconciledAt: nowIso,
  };
}

async function buildDailyMissionSeedPlan({ getDocuments, nowIso }) {
  const catalog = require("../../functions/config/beta1-daily-missions.json");
  const {
    validateCatalog,
    REQUIRED_COMPLETION_POLICY,
  } = require("../../functions/lib/beta1DailyMissionCatalog");
  const missions = validateCatalog(CatalogValidationError);
  if (
    catalog.currency !== "WFXP"
    || catalog.completionPolicy !== REQUIRED_COMPLETION_POLICY
    || catalog.noMonetaryValue !== true
    || catalog.tokenAuthorized !== false
    || catalog.cashoutAllowed !== false
  ) {
    throw new Error("Daily mission catalog violates the closed-beta economy boundary.");
  }
  const existing = await existingMissionMap(getDocuments, missions.map((mission) => mission.missionId));
  const seedId = `beta1-daily-missions-${catalog.version}`;
  const operations = missions.map((mission) => {
    const path = `missions/${mission.missionId}`;
    return missionOperation(path, {
      ...sharedMissionFields({
        catalog,
        mission,
        evidenceType: "daily-user-confirmation",
        nowIso,
        seedId,
        seedVersion: catalog.version,
      }),
      difficulty: mission.difficulty,
      duration: mission.duration,
    }, existing.get(path).exists);
  });
  return { scannedDocuments: missions.length, operations, warnings: [] };
}

async function buildWeeklyMissionSeedPlan({ getDocuments, nowIso }) {
  const catalog = require("../../functions/config/beta1-weekly-missions.json");
  const {
    validateWeeklyCatalog,
    REQUIRED_COMPLETION_POLICY,
    REQUIRED_EVIDENCE_TYPE,
  } = require("../../functions/lib/beta1WeeklyMissionCatalog");
  const missions = validateWeeklyCatalog(CatalogValidationError);
  if (
    catalog.currency !== "WFXP"
    || catalog.completionPolicy !== REQUIRED_COMPLETION_POLICY
    || catalog.noMonetaryValue !== true
    || catalog.tokenAuthorized !== false
    || catalog.cashoutAllowed !== false
  ) {
    throw new Error("Weekly mission catalog violates the closed-beta economy boundary.");
  }
  const existing = await existingMissionMap(getDocuments, missions.map((mission) => mission.missionId));
  const seedId = `beta1-weekly-missions-${catalog.version}`;
  const operations = missions.map((mission) => {
    const path = `missions/${mission.missionId}`;
    return missionOperation(path, {
      ...sharedMissionFields({
        catalog,
        mission,
        evidenceType: REQUIRED_EVIDENCE_TYPE,
        nowIso,
        seedId,
        seedVersion: catalog.version,
      }),
      difficulty: mission.difficulty,
      duration: mission.duration,
      targetValue: mission.targetValue,
      targetUnit: mission.targetUnit,
      weeklyGoal: catalog.weeklyGoal,
    }, existing.get(path).exists);
  });
  return { scannedDocuments: missions.length, operations, warnings: [] };
}

async function buildChallengeMissionSeedPlan({ getDocuments, nowIso }) {
  const catalog = require("../../functions/config/beta1-challenge-missions.json");
  const {
    validateChallengeCatalog,
    REQUIRED_COMPLETION_POLICY,
    REQUIRED_EVIDENCE_TYPE,
    REQUIRED_LOCATION_POLICY,
    REQUIRED_START_RADIUS_METERS,
  } = require("../../functions/lib/beta1ChallengeMissionCatalog");
  const missions = validateChallengeCatalog(CatalogValidationError);
  if (
    catalog.currency !== "WFXP"
    || catalog.completionPolicy !== REQUIRED_COMPLETION_POLICY
    || catalog.locationPolicy !== REQUIRED_LOCATION_POLICY
    || Number(catalog.startRadiusMeters) !== REQUIRED_START_RADIUS_METERS
    || catalog.noMonetaryValue !== true
    || catalog.tokenAuthorized !== false
    || catalog.cashoutAllowed !== false
  ) {
    throw new Error("Challenge mission catalog violates the closed-beta authority boundary.");
  }
  const existing = await existingMissionMap(getDocuments, missions.map((mission) => mission.missionId));
  const seedId = `beta1-challenge-missions-${catalog.version}`;
  const operations = missions.map((mission) => {
    const path = `missions/${mission.missionId}`;
    return missionOperation(path, {
      ...sharedMissionFields({
        catalog,
        mission,
        evidenceType: REQUIRED_EVIDENCE_TYPE,
        nowIso,
        seedId,
        seedVersion: catalog.version,
      }),
      category: mission.category,
      levelRecommendation: mission.levelRecommendation,
      movementGoal: mission.movementGoal,
      locationPolicy: REQUIRED_LOCATION_POLICY,
      startRadiusMeters: REQUIRED_START_RADIUS_METERS,
    }, existing.get(path).exists);
  });
  return { scannedDocuments: missions.length, operations, warnings: [] };
}

async function buildAdventureMissionSeedPlan({ getDocuments, nowIso }) {
  const catalog = require("../../functions/config/beta1-adventure-missions.json");
  const {
    validateAdventureCatalog,
    REQUIRED_COMPLETION_POLICY,
    REQUIRED_ACCESS_POLICY,
    REQUIRED_LOCATION_POLICY,
    REQUIRED_EVIDENCE_TYPE,
  } = require("../../functions/lib/beta1AdventureMissionCatalog");
  const missions = validateAdventureCatalog(CatalogValidationError);
  if (
    catalog.currency !== "WFXP"
    || catalog.completionPolicy !== REQUIRED_COMPLETION_POLICY
    || catalog.accessPolicy !== REQUIRED_ACCESS_POLICY
    || catalog.locationPolicy !== REQUIRED_LOCATION_POLICY
    || Number(catalog.startRadiusMeters) !== 500
    || catalog.noMonetaryValue !== true
    || catalog.tokenAuthorized !== false
    || catalog.cashoutAllowed !== false
  ) {
    throw new Error("Adventure mission catalog violates the closed-beta authority boundary.");
  }
  const existing = await existingMissionMap(getDocuments, missions.map((mission) => mission.missionId));
  const seedId = `beta1-adventure-missions-${catalog.version}`;
  const operations = missions.map((mission) => {
    const path = `missions/${mission.missionId}`;
    return missionOperation(path, {
      ...sharedMissionFields({
        catalog,
        mission,
        evidenceType: REQUIRED_EVIDENCE_TYPE,
        nowIso,
        seedId,
        seedVersion: catalog.version,
      }),
      shortLabel: mission.shortLabel,
      category: mission.category,
      locationTypes: [...mission.locationTypes],
      milestones: [...mission.milestones],
      accessCostWfxp: mission.accessCostWfxp,
      accessPolicy: REQUIRED_ACCESS_POLICY,
      locationPolicy: REQUIRED_LOCATION_POLICY,
      startRadiusMeters: 500,
    }, existing.get(path).exists);
  });
  return { scannedDocuments: missions.length, operations, warnings: [] };
}

module.exports = {
  CatalogValidationError,
  buildDailyMissionSeedPlan,
  buildWeeklyMissionSeedPlan,
  buildChallengeMissionSeedPlan,
  buildAdventureMissionSeedPlan,
};
