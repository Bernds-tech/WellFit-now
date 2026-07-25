const {
  deleteFieldsOperation,
  hasOwnPath,
  mergeOperation,
  summarizePlan,
} = require("../lib/planHelpers");

const FORBIDDEN_PRIVATE_FIELDS = [
  "birthDate",
  "dateOfBirth",
  "rawBirthDate",
  "medicationName",
  "medicationDose",
  "medicationNote",
  "medications",
  "healthNotes",
  "freeTextHealthNotes",
  "freeTextNotes",
  "notes",
  "healthSettings.vitals.medicationName",
  "healthSettings.vitals.medicationDose",
  "healthSettings.vitals.medicationNote",
  "healthSettings.vitals.medications",
  "healthSettings.vitals.notes",
  "healthSettings.lifestyle.notes",
  "healthSettings.lifestyle.freeTextNotes",
  "healthProfile.birthDate",
  "healthProfile.medicationName",
  "healthProfile.medicationDose",
  "healthProfile.medicationNote",
  "healthProfile.medications",
  "healthProfile.notes",
];

async function buildPlan({ scanCollection, nowIso }) {
  const profiles = await scanCollection("userPrivateProfiles");
  const operations = [];

  for (const profileDocument of profiles) {
    const profile = profileDocument.data || {};
    const fields = FORBIDDEN_PRIVATE_FIELDS.filter((field) => hasOwnPath(profile, field));
    if (fields.length > 0) {
      operations.push(deleteFieldsOperation(profileDocument.path, fields));
    }

    if (
      profile.rawBirthDateStored !== false
      || profile.medicationDetailsStored !== false
      || profile.freeTextHealthNotesStored !== false
      || profile.privacyBoundaryVersion !== "2026-07-25-v1"
    ) {
      operations.push(mergeOperation(profileDocument.path, {
        rawBirthDateStored: false,
        medicationDetailsStored: false,
        freeTextHealthNotesStored: false,
        privacyBoundaryVersion: "2026-07-25-v1",
        privacyBoundaryMigratedAt: nowIso,
      }, {
        documentExists: true,
      }));
    }
  }

  return {
    scannedDocuments: profiles.length,
    operations,
    warnings: [],
    summary: summarizePlan({ scannedDocuments: profiles.length, operations }),
  };
}

module.exports = {
  id: "20260725_003_harden_private_health_boundaries",
  version: "1.0.0",
  destructive: true,
  buildPlan,
};
