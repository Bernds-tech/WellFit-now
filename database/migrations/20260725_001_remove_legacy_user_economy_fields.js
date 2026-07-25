const {
  deleteFieldsOperation,
  summarizePlan,
} = require("../lib/planHelpers");

const LEGACY_USER_FIELDS = [
  "points",
  "xp",
  "level",
  "energy",
  "stepsToday",
  "avatar",
  "lastMissionCompletedAt",
  "deviceLocation",
  "consent",
  "inventory",
];

async function buildPlan({ scanCollection }) {
  const userDocuments = await scanCollection("users");
  const operations = [];
  for (const document of userDocuments) {
    const data = document.data || {};
    const fields = LEGACY_USER_FIELDS.filter((field) => Object.prototype.hasOwnProperty.call(data, field));
    if (fields.length > 0) {
      operations.push(deleteFieldsOperation(document.path, fields));
    }
  }
  return {
    scannedDocuments: userDocuments.length,
    operations,
    warnings: [],
    summary: summarizePlan({ scannedDocuments: userDocuments.length, operations }),
  };
}

module.exports = {
  id: "20260725_001_remove_legacy_user_economy_fields",
  version: "1.0.0",
  destructive: true,
  buildPlan,
};
