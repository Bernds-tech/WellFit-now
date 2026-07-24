const { FieldValue } = require("firebase-admin/firestore");
const {
  ACCOUNT_LIFECYCLE_VERSION,
  ACCOUNT_DELETION_GRACE_DAYS,
  addDays,
  requireRecentAuth,
  lifecycleRef,
  readAccountLifecycle,
  requireDeletionConfirmation,
  publicLifecycleState,
} = require("./beta1AccountLifecyclePolicy");
const { requireAuth, optionalString, writeAudit } = require("./beta1Runtime");
const { registerBeta1UserDataExport } = require("./beta1UserDataExport");

async function guardianDependencySummary(db, userId) {
  const [childrenSnapshot, familiesSnapshot, linksSnapshot] = await Promise.all([
    db.collection("childProfiles").where("guardianUserIds", "array-contains", userId).limit(100).get(),
    db.collection("familyAccounts").where("guardianUserIds", "array-contains", userId).limit(100).get(),
    db.collection("guardianChildLinks").where("guardianUserId", "==", userId).limit(200).get(),
  ]);
  const activeChildren = childrenSnapshot.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() || {}) }))
    .filter((child) => !child.status || child.status === "active");
  const soleGuardianChildren = activeChildren.filter((child) => {
    const guardians = Array.isArray(child.guardianUserIds) ? child.guardianUserIds.filter(Boolean) : [];
    return guardians.length <= 1 && guardians.includes(userId);
  });
  return {
    activeChildProfiles: activeChildren.length,
    soleGuardianChildProfiles: soleGuardianChildren.length,
    blockingChildProfileIds: soleGuardianChildren.map((child) => child.id).slice(0, 20),
    familyAccounts: familiesSnapshot.size,
    guardianLinks: linksSnapshot.size,
  };
}

function deletionStatusPayload(lifecycle, dependencies = null) {
  return {
    ...publicLifecycleState(lifecycle),
    dependencies: dependencies
      ? {
        activeChildProfiles: dependencies.activeChildProfiles,
        soleGuardianChildProfiles: dependencies.soleGuardianChildProfiles,
        familyAccounts: dependencies.familyAccounts,
        guardianLinks: dependencies.guardianLinks,
      }
      : null,
    deletionCanBeRequested: !dependencies || dependencies.soleGuardianChildProfiles === 0,
  };
}

function registerBeta1AccountLifecycle(exportsTarget, { db, authAdmin, onCall, HttpsError }) {
  registerBeta1UserDataExport(exportsTarget, { db, authAdmin, onCall, HttpsError });

  exportsTarget.getAccountLifecycleStatus = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const [lifecycle, dependencies] = await Promise.all([
      readAccountLifecycle(db, userId),
      guardianDependencySummary(db, userId),
    ]);
    return {
      accepted: true,
      ...deletionStatusPayload(lifecycle, dependencies),
      gracePeriodDays: ACCOUNT_DELETION_GRACE_DAYS,
    };
  });

  exportsTarget.requestAccountDeletion = onCall(async (request) => {
    const userId = requireRecentAuth(request, HttpsError);
    const data = request.data || {};
    const authenticatedEmail = requireDeletionConfirmation(
      data,
      request.auth.token && request.auth.token.email,
      HttpsError,
    );
    const dependencies = await guardianDependencySummary(db, userId);
    if (dependencies.soleGuardianChildProfiles > 0) {
      throw new HttpsError(
        "failed-precondition",
        "Das Konto ist alleiniger Guardian eines aktiven Kinderprofils. Vor einer Loeschung muss ein weiterer Guardian zugeordnet oder das Kinderprofil ordnungsgemaess archiviert werden.",
      );
    }

    const now = new Date();
    const scheduledFor = addDays(now, ACCOUNT_DELETION_GRACE_DAYS);
    const accountRef = db.collection("users").doc(userId);
    const recordRef = lifecycleRef(db, userId);
    const result = await db.runTransaction(async (transaction) => {
      const [lifecycleSnapshot, accountSnapshot] = await Promise.all([
        transaction.get(recordRef),
        transaction.get(accountRef),
      ]);
      const current = lifecycleSnapshot.exists ? lifecycleSnapshot.data() || {} : {};
      if (current.status === "deletion-pending") {
        return { idempotent: true, lifecycle: { lifecycleId: recordRef.id, ...current } };
      }
      if (current.status === "deletion-processing" || current.status === "deleted") {
        throw new HttpsError("failed-precondition", "Der Loeschprozess kann nicht erneut gestartet werden.");
      }
      if (!accountSnapshot.exists) {
        throw new HttpsError("failed-precondition", "Das serverseitige Konto ist noch nicht vollstaendig eingerichtet.");
      }
      const payload = {
        lifecycleId: recordRef.id,
        ownerUserId: userId,
        userId,
        status: "deletion-pending",
        freezeMutations: true,
        lifecycleVersion: ACCOUNT_LIFECYCLE_VERSION,
        deletionPolicyVersion: ACCOUNT_LIFECYCLE_VERSION,
        deletionRequestedAt: now.toISOString(),
        deletionScheduledFor: scheduledFor.toISOString(),
        deletionRequestSource: optionalString(data.source, 80) || "web-settings",
        deletionReasonCategory: optionalString(data.reasonCategory, 80) || "user-requested",
        confirmedEmailHash: require("node:crypto").createHash("sha256").update(authenticatedEmail).digest("hex"),
        soleGuardianChildProfilesAtRequest: dependencies.soleGuardianChildProfiles,
        activeChildProfilesAtRequest: dependencies.activeChildProfiles,
        lastCancellationAt: current.deletionCancelledAt || null,
        createdAt: current.createdAt || FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      transaction.set(recordRef, payload, { merge: true });
      transaction.update(accountRef, {
        accountStatus: "deletion-pending",
        accountMutationsFrozen: true,
        deletionRequestedAt: now.toISOString(),
        deletionScheduledFor: scheduledFor.toISOString(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { idempotent: false, lifecycle: payload };
    });

    if (!result.idempotent) {
      await writeAudit(db, {
        actorUserId: userId,
        actionType: "account-deletion-requested",
        targetType: "accountLifecycleRecord",
        targetId: userId,
        ownerUserId: userId,
        metadata: {
          deletionPolicyVersion: ACCOUNT_LIFECYCLE_VERSION,
          deletionScheduledFor: scheduledFor.toISOString(),
          activeChildProfiles: dependencies.activeChildProfiles,
          soleGuardianChildProfiles: dependencies.soleGuardianChildProfiles,
          freezeMutations: true,
        },
      });
    }

    return {
      accepted: true,
      idempotent: result.idempotent,
      ...deletionStatusPayload(result.lifecycle, dependencies),
      gracePeriodDays: ACCOUNT_DELETION_GRACE_DAYS,
    };
  });

  exportsTarget.cancelAccountDeletion = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const accountRef = db.collection("users").doc(userId);
    const recordRef = lifecycleRef(db, userId);
    const now = new Date();
    const result = await db.runTransaction(async (transaction) => {
      const [lifecycleSnapshot, accountSnapshot] = await Promise.all([
        transaction.get(recordRef),
        transaction.get(accountRef),
      ]);
      if (!lifecycleSnapshot.exists || (lifecycleSnapshot.data() || {}).status !== "deletion-pending") {
        const current = lifecycleSnapshot.exists
          ? { lifecycleId: lifecycleSnapshot.id, ...(lifecycleSnapshot.data() || {}) }
          : { lifecycleId: userId, ownerUserId: userId, userId, status: "active", freezeMutations: false };
        return { idempotent: true, lifecycle: current };
      }
      const current = lifecycleSnapshot.data() || {};
      const payload = {
        status: "active",
        freezeMutations: false,
        deletionCancelledAt: now.toISOString(),
        deletionCancellationReason: optionalString(data.reason, 160) || "user-cancelled",
        deletionRequestedAt: null,
        deletionScheduledFor: null,
        updatedAt: FieldValue.serverTimestamp(),
      };
      transaction.update(recordRef, payload);
      if (accountSnapshot.exists) {
        transaction.update(accountRef, {
          accountStatus: "active",
          accountMutationsFrozen: false,
          deletionRequestedAt: FieldValue.delete(),
          deletionScheduledFor: FieldValue.delete(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      return { idempotent: false, lifecycle: { lifecycleId: recordRef.id, ...current, ...payload } };
    });

    if (!result.idempotent) {
      await writeAudit(db, {
        actorUserId: userId,
        actionType: "account-deletion-cancelled",
        targetType: "accountLifecycleRecord",
        targetId: userId,
        ownerUserId: userId,
        metadata: {
          deletionPolicyVersion: ACCOUNT_LIFECYCLE_VERSION,
          freezeMutations: false,
        },
      });
    }
    return {
      accepted: true,
      idempotent: result.idempotent,
      ...deletionStatusPayload(result.lifecycle),
      gracePeriodDays: ACCOUNT_DELETION_GRACE_DAYS,
    };
  });

  exportsTarget.revokeUserSessions = onCall(async (request) => {
    const userId = requireRecentAuth(request, HttpsError);
    await authAdmin.revokeRefreshTokens(userId);
    await writeAudit(db, {
      actorUserId: userId,
      actionType: "user-sessions-revoked",
      targetType: "firebaseAuthUser",
      targetId: userId,
      ownerUserId: userId,
      metadata: {
        currentSessionAlsoRevoked: true,
        lifecycleVersion: ACCOUNT_LIFECYCLE_VERSION,
      },
    });
    return {
      accepted: true,
      sessionsRevoked: true,
      currentSessionAlsoRevoked: true,
      tokenAuthorized: false,
      cashoutAllowed: false,
      realMoney: false,
    };
  });
}

module.exports = {
  guardianDependencySummary,
  deletionStatusPayload,
  registerBeta1AccountLifecycle,
};