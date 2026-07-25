const {
  mergeOperation,
  summarizePlan,
} = require("../lib/planHelpers");

async function buildPlan({ getDocument, nowIso, releaseSha }) {
  const path = "databaseSchemaState/current";
  const current = await getDocument(path);
  const operations = [
    mergeOperation(path, {
      schemaId: "current",
      schemaVersion: "2026-07-25-v1",
      schemaAuthority: "server-authoritative-firestore",
      runtimeCurrency: "WFXP",
      canonicalCurrencyDecision: "pending-owner-migration-decision",
      chainNeutralRuntime: true,
      tokenAuthorized: false,
      cashoutAllowed: false,
      realMoney: false,
      baselineRecordedAt: nowIso,
      baselineReleaseSha: releaseSha || "unknown",
    }, {
      ensureCreatedAt: true,
      documentExists: current.exists,
    }),
  ];
  return {
    scannedDocuments: current.exists ? 1 : 0,
    operations,
    warnings: [{
      code: "currency-terminology-decision-remains-open",
      detail: "WFXP runtime is not silently renamed to WFP or avatar XP.",
    }],
    summary: summarizePlan({
      scannedDocuments: current.exists ? 1 : 0,
      operations,
      warnings: [{ code: "currency-terminology-decision-remains-open" }],
    }),
  };
}

module.exports = {
  id: "20260725_005_record_schema_baseline",
  version: "1.0.0",
  destructive: false,
  buildPlan,
};
