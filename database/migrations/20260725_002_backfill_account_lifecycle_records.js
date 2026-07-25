const {
  mergeOperation,
  summarizePlan,
} = require("../lib/planHelpers");

const ACTIVE_STATUSES = new Set(["", "active"]);

async function buildPlan({ scanCollection, getDocuments, nowIso }) {
  const users = await scanCollection("users");
  const lifecyclePaths = users.map((document) => `accountLifecycleRecords/${document.id}`);
  const lifecycleByPath = await getDocuments(lifecyclePaths);
  const operations = [];
  const warnings = [];

  for (const userDocument of users) {
    const user = userDocument.data || {};
    const lifecyclePath = `accountLifecycleRecords/${userDocument.id}`;
    const lifecycle = lifecycleByPath.get(lifecyclePath);
    const accountStatus = String(user.accountStatus || "").trim();

    if (!lifecycle.exists) {
      if (!ACTIVE_STATUSES.has(accountStatus)) {
        warnings.push({
          code: "non-active-user-without-lifecycle",
          path: userDocument.path,
          accountStatus,
        });
        continue;
      }
      operations.push(mergeOperation(lifecyclePath, {
        lifecycleId: userDocument.id,
        ownerUserId: userDocument.id,
        userId: userDocument.id,
        status: "active",
        freezeMutations: false,
        lifecycleVersion: "2026-07-25-v1",
        migrationSource: "20260725_002_backfill_account_lifecycle_records",
        migratedAt: nowIso,
      }, {
        ensureCreatedAt: true,
        documentExists: false,
      }));
    }

    if (ACTIVE_STATUSES.has(accountStatus) && (
      user.accountStatus !== "active"
      || user.accountMutationsFrozen !== false
    )) {
      operations.push(mergeOperation(userDocument.path, {
        accountStatus: "active",
        accountMutationsFrozen: false,
        accountAuthorityVersion: "2026-07-25-v1",
        accountAuthorityMigratedAt: nowIso,
      }, {
        documentExists: true,
      }));
    }
  }

  return {
    scannedDocuments: users.length,
    operations,
    warnings,
    summary: summarizePlan({ scannedDocuments: users.length, operations, warnings }),
  };
}

module.exports = {
  id: "20260725_002_backfill_account_lifecycle_records",
  version: "1.0.0",
  destructive: false,
  buildPlan,
};
