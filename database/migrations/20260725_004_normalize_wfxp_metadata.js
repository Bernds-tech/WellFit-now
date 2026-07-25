const {
  mergeOperation,
  summarizePlan,
  valuesEqual,
} = require("../lib/planHelpers");

const SAFE_WFXP_METADATA = {
  currency: "WFXP",
  noMonetaryValue: true,
  blockchainBacked: false,
  cashoutAllowed: false,
  tokenAuthorized: false,
  realMoney: false,
};

async function buildPlan({ scanCollection, nowIso }) {
  const collectionNames = ["xpWallets", "xpLedgerEvents", "ledgerEvents"];
  const operations = [];
  let scannedDocuments = 0;

  for (const collectionName of collectionNames) {
    const documents = await scanCollection(collectionName);
    scannedDocuments += documents.length;
    for (const document of documents) {
      const current = document.data || {};
      const existingMetadata = Object.fromEntries(
        Object.keys(SAFE_WFXP_METADATA).map((key) => [key, current[key]]),
      );
      if (!valuesEqual(existingMetadata, SAFE_WFXP_METADATA)) {
        operations.push(mergeOperation(document.path, {
          ...SAFE_WFXP_METADATA,
          economyBoundaryVersion: "2026-07-25-v1",
          economyBoundaryMigratedAt: nowIso,
        }, {
          documentExists: true,
        }));
      }
    }
  }

  return {
    scannedDocuments,
    operations,
    warnings: [],
    summary: summarizePlan({ scannedDocuments, operations }),
  };
}

module.exports = {
  id: "20260725_004_normalize_wfxp_metadata",
  version: "1.0.0",
  destructive: false,
  buildPlan,
};
