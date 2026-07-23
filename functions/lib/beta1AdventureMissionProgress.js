const { FieldValue } = require("firebase-admin/firestore");
const adventureCatalog = require("../config/beta1-adventure-missions.json");
const {
  BETA1_INTERNAL_CURRENCY,
  requireAuth,
  requiredString,
  optionalString,
  scopedOwnerFields,
  getWalletRef,
  serverTimestamps,
  updatedTimestamp,
  clientContext,
} = require("./beta1Runtime");
const { calculateLevelFromXp } = require("./beta1DailyMissionProgress");

const MAX_HISTORY_DOCS = 500;
const ADVENTURE_MISSION_IDS = new Set(adventureCatalog.missions.map((mission) => mission.missionId));
const ADVENTURE_EVIDENCE_TYPE = "adventure-user-confirmation";
const ADVENTURE_COMPLETION_POLICY = "once-per-mission-per-user";
const ADVENTURE_ACCESS_POLICY = "one-time-wfxp-access-per-user";

function safeDocIdPart(value) {
  return encodeURIComponent(String(value || "none")).replace(/\./g, "%2E");
}

function isAdventureMissionId(value) {
  const missionId = optionalString(value, 160);
  return Boolean(missionId && ADVENTURE_MISSION_IDS.has(missionId));
}

function adventureMissionAttemptId(ownerUserId, missionId) {
  return ["adventure", safeDocIdPart(ownerUserId), safeDocIdPart(missionId)].join("__");
}

function adventureMissionEvidenceId(attemptId, revision) {
  return ["adventure_evidence", safeDocIdPart(attemptId), String(revision)].join("__");
}

function adventureAccessLedgerId(ownerUserId, missionId) {
  return ["adventure_access", safeDocIdPart(ownerUserId), safeDocIdPart(missionId)].join("__");
}

function adventureRewardLedgerId(ownerUserId, missionId) {
  return ["adventure_mission_completion", safeDocIdPart(ownerUserId), safeDocIdPart(missionId)].join("__");
}

function documentTime(data, preferredFields = ["createdAt", "startedAt", "updatedAt"]) {
  for (const field of preferredFields) {
    const value = data[field];
    if (!value) continue;
    if (typeof value.toDate === "function") return value.toDate().getTime();
    const date = value instanceof Date ? value : new Date(value);
    if (!Number.isNaN(date.getTime())) return date.getTime();
  }
  return 0;
}

async function readAdventureMission(db, missionId, HttpsError) {
  if (!isAdventureMissionId(missionId)) {
    throw new HttpsError("invalid-argument", "Unbekanntes Beta-1 Abenteuer.");
  }
  const missionSnapshot = await db.collection("missions").doc(missionId).get();
  const mission = missionSnapshot.exists ? missionSnapshot.data() || {} : {};
  if (
    !missionSnapshot.exists
    || mission.status !== "published"
    || mission.catalogId !== adventureCatalog.catalogId
    || mission.completionPolicy !== ADVENTURE_COMPLETION_POLICY
    || mission.accessPolicy !== ADVENTURE_ACCESS_POLICY
    || !mission.evidencePolicy
    || !Array.isArray(mission.evidencePolicy.allowedEvidenceTypes)
    || !mission.evidencePolicy.allowedEvidenceTypes.includes(ADVENTURE_EVIDENCE_TYPE)
  ) {
    throw new HttpsError("failed-precondition", "Abenteuer ist serverseitig nicht sicher veroeffentlicht.");
  }
  return { snapshot: missionSnapshot, data: mission };
}

function ledgerDocument({
  ledgerEventId,
  userId,
  delta,
  reason,
  sourceType,
  sourceId,
  metadata,
}) {
  return {
    ledgerEventId,
    ...scopedOwnerFields(userId, null),
    delta,
    reason,
    sourceType,
    sourceId,
    actorUserId: userId,
    idempotencyKey: ledgerEventId,
    currency: BETA1_INTERNAL_CURRENCY,
    noMonetaryValue: true,
    blockchainBacked: false,
    cashoutAllowed: false,
    tokenAuthorized: false,
    realMoney: false,
    metadata,
    ...serverTimestamps(),
  };
}

function auditDocument({ auditId, userId, actionType, targetType, targetId, metadata }) {
  return {
    auditEventId: auditId,
    actorUserId: userId,
    actionType,
    targetType,
    targetId,
    reason: "beta1-server-authorized",
    ownerUserId: userId,
    userId,
    childProfileId: null,
    metadata,
    source: "beta1-runtime",
    refId: targetId,
    ...serverTimestamps(),
  };
}

function buildLatestEvidenceByAttempt(evidenceDocs) {
  const evidenceByAttempt = new Map();
  for (const doc of evidenceDocs) {
    const evidence = doc.data() || {};
    const attemptId = optionalString(evidence.attemptId, 220);
    if (!attemptId) continue;
    const existing = evidenceByAttempt.get(attemptId);
    const currentTime = documentTime(evidence, ["createdAt", "reviewedAt", "updatedAt"]);
    const existingTime = existing
      ? documentTime(existing.data, ["createdAt", "reviewedAt", "updatedAt"])
      : -1;
    if (!existing || currentTime >= existingTime) {
      evidenceByAttempt.set(attemptId, { id: doc.id, data: evidence });
    }
  }
  return evidenceByAttempt;
}

function buildCompletedAdventures(completionDocs) {
  const completedMissionIds = new Set();
  const completedAttemptIds = new Set();
  for (const doc of completionDocs) {
    const completion = doc.data() || {};
    const missionId = optionalString(completion.missionId, 160);
    if (completion.status !== "completed" || !missionId || !ADVENTURE_MISSION_IDS.has(missionId)) continue;
    completedMissionIds.add(missionId);
    const attemptId = optionalString(completion.attemptId, 220);
    if (attemptId) completedAttemptIds.add(attemptId);
  }
  return { completedMissionIds, completedAttemptIds };
}

function buildActiveAttempts({ attempts, evidenceByAttempt, completedAttemptIds, completedMissionIds }) {
  const byMission = new Map();
  const sortedAttempts = [...attempts].sort((left, right) => {
    const leftTime = documentTime(left.data() || {});
    const rightTime = documentTime(right.data() || {});
    return rightTime - leftTime;
  });

  for (const attemptDoc of sortedAttempts) {
    const attempt = attemptDoc.data() || {};
    const missionId = optionalString(attempt.missionId, 160);
    if (!missionId || !ADVENTURE_MISSION_IDS.has(missionId) || byMission.has(missionId)) continue;
    if (attempt.accessAuthorized !== true || attempt.accessStatus !== "paid") continue;
    if (completedMissionIds.has(missionId)) continue;
    if (completedAttemptIds.has(attemptDoc.id) || attempt.status === "completed") continue;
    const evidence = evidenceByAttempt.get(attemptDoc.id) || null;
    byMission.set(missionId, {
      missionId,
      attemptId: attemptDoc.id,
      attemptStatus: optionalString(attempt.status, 80) || "started",
      accessAuthorized: true,
      accessCostWfxp: Math.max(0, Math.floor(Number(attempt.accessCostWfxp || 0))),
      accessLedgerEventId: optionalString(attempt.accessLedgerEventId, 220),
      evidenceId: evidence ? evidence.id : null,
      reviewStatus: evidence ? optionalString(evidence.data.reviewStatus, 80) || "pending-server-review" : null,
      serverValidationStatus: evidence ? optionalString(evidence.data.serverValidationStatus, 120) || "evidence-received" : null,
      canRequestCompletion: Boolean(
        evidence
        && evidence.data.reviewStatus === "approved"
        && evidence.data.serverValidationStatus === "evidence-approved"
      ),
    });
  }
  return [...byMission.values()].slice(0, adventureCatalog.missions.length);
}

function registerBeta1AdventureMissionProgress(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.startAdventureMission = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const missionId = requiredString(data.missionId, "missionId", HttpsError, 160);
    const mission = await readAdventureMission(db, missionId, HttpsError);
    if (mission.data.childAllowed === true || optionalString(data.childProfileId, 160)) {
      throw new HttpsError("failed-precondition", "Child Profiles sind fuer den ersten Abenteuerkatalog deaktiviert.");
    }

    const attemptId = adventureMissionAttemptId(userId, missionId);
    const accessLedgerEventId = adventureAccessLedgerId(userId, missionId);
    const attemptRef = db.collection("missionAttempts").doc(attemptId);
    const completionRef = db.collection("missionCompletions").doc(attemptId);
    const accessEventRef = db.collection("adventureAccessEvents").doc(accessLedgerEventId);
    const ledgerRef = db.collection("xpLedgerEvents").doc(accessLedgerEventId);
    const legacyLedgerRef = db.collection("ledgerEvents").doc(accessLedgerEventId);
    const adminActionRef = db.collection("adminActions").doc(accessLedgerEventId);
    const auditEventRef = db.collection("auditEvents").doc(accessLedgerEventId);
    const walletRef = await getWalletRef(db, userId, null);
    const accessCostWfxp = Math.max(0, Math.floor(Number(mission.data.accessCostWfxp || 0)));

    const result = await db.runTransaction(async (transaction) => {
      const [attemptSnapshot, completionSnapshot, walletSnapshot, ledgerSnapshot] = await Promise.all([
        transaction.get(attemptRef),
        transaction.get(completionRef),
        transaction.get(walletRef),
        transaction.get(ledgerRef),
      ]);
      const attempt = attemptSnapshot.exists ? attemptSnapshot.data() || {} : {};
      const wallet = walletSnapshot.exists ? walletSnapshot.data() || {} : {};
      const currentBalance = Math.max(0, Math.floor(Number(wallet.balance || 0)));

      if (completionSnapshot.exists && (completionSnapshot.data() || {}).status === "completed") {
        return {
          accepted: true,
          attemptId,
          missionId,
          accessLedgerEventId,
          accessCostWfxp,
          remainingWfxp: currentBalance,
          accessAuthorized: true,
          missionCompletionAuthorized: true,
          xpAuthorized: true,
          idempotent: true,
          noMonetaryValue: true,
          tokenAuthorized: false,
          cashoutAllowed: false,
        };
      }

      if (attemptSnapshot.exists && (
        attempt.ownerUserId !== userId
        || attempt.missionId !== missionId
        || attempt.completionPolicy !== ADVENTURE_COMPLETION_POLICY
        || attempt.accessPolicy !== ADVENTURE_ACCESS_POLICY
      )) {
        throw new HttpsError("failed-precondition", "Deterministischer Abenteuer-Attempt ist inkonsistent.");
      }

      if (attempt.accessAuthorized === true && attempt.accessStatus === "paid") {
        if (!ledgerSnapshot.exists || (ledgerSnapshot.data() || {}).sourceId !== attemptId) {
          throw new HttpsError("failed-precondition", "Abenteuerzugang hat einen inkonsistenten Ledgerzustand.");
        }
        return {
          accepted: true,
          attemptId,
          missionId,
          accessLedgerEventId,
          accessCostWfxp,
          remainingWfxp: currentBalance,
          accessAuthorized: true,
          missionCompletionAuthorized: false,
          xpAuthorized: false,
          idempotent: true,
          noMonetaryValue: true,
          tokenAuthorized: false,
          cashoutAllowed: false,
        };
      }

      let remainingWfxp = currentBalance;
      let recoveredFromLedger = false;
      if (ledgerSnapshot.exists) {
        const ledger = ledgerSnapshot.data() || {};
        if (
          ledger.sourceId !== attemptId
          || ledger.delta !== -accessCostWfxp
          || ledger.reason !== "adventure-access"
        ) {
          throw new HttpsError("failed-precondition", "Abenteuerzugang hat einen fremden oder inkonsistenten Ledgerzustand.");
        }
        recoveredFromLedger = true;
      } else {
        if (currentBalance < accessCostWfxp) {
          return {
            accepted: false,
            rejectionReason: "insufficient-wfxp-balance",
            attemptId,
            missionId,
            accessCostWfxp,
            remainingWfxp: currentBalance,
            accessAuthorized: false,
            missionCompletionAuthorized: false,
            xpAuthorized: false,
            idempotent: false,
            noMonetaryValue: true,
            tokenAuthorized: false,
            cashoutAllowed: false,
          };
        }
        remainingWfxp = currentBalance - accessCostWfxp;
        const ledger = ledgerDocument({
          ledgerEventId: accessLedgerEventId,
          userId,
          delta: -accessCostWfxp,
          reason: "adventure-access",
          sourceType: "adventureMissionAttempt",
          sourceId: attemptId,
          metadata: { missionId, catalogId: adventureCatalog.catalogId },
        });
        transaction.set(ledgerRef, ledger);
        transaction.set(legacyLedgerRef, ledger);
        transaction.set(walletRef, {
          walletId: walletRef.id,
          ...scopedOwnerFields(userId, null),
          balance: remainingWfxp,
          lifetimeEarned: Number(wallet.lifetimeEarned || 0),
          lifetimeSpent: Number(wallet.lifetimeSpent || 0) + accessCostWfxp,
          currency: BETA1_INTERNAL_CURRENCY,
          noMonetaryValue: true,
          blockchainBacked: false,
          cashoutAllowed: false,
          tokenAuthorized: false,
          realMoney: false,
          updatedAt: FieldValue.serverTimestamp(),
          createdAt: wallet.createdAt || FieldValue.serverTimestamp(),
        }, { merge: true });
      }

      const accessedAt = new Date().toISOString();
      transaction.set(attemptRef, {
        attemptId,
        missionId,
        ...scopedOwnerFields(userId, null),
        status: "started",
        catalogId: adventureCatalog.catalogId,
        catalogVersion: adventureCatalog.version,
        completionPolicy: ADVENTURE_COMPLETION_POLICY,
        accessPolicy: ADVENTURE_ACCESS_POLICY,
        accessAuthorized: true,
        accessStatus: "paid",
        accessCostWfxp,
        accessLedgerEventId,
        accessedAt,
        missionCompletionAuthorized: false,
        xpAuthorized: false,
        ...clientContext(data),
        ...(attemptSnapshot.exists ? updatedTimestamp() : serverTimestamps()),
      }, { merge: true });
      transaction.set(accessEventRef, {
        accessEventId: accessLedgerEventId,
        attemptId,
        missionId,
        ...scopedOwnerFields(userId, null),
        accessCostWfxp,
        xpLedgerEventId: accessLedgerEventId,
        status: "completed",
        currency: BETA1_INTERNAL_CURRENCY,
        noMonetaryValue: true,
        tokenAuthorized: false,
        cashoutAllowed: false,
        accessedAt,
        ...serverTimestamps(),
      });
      const audit = auditDocument({
        auditId: accessLedgerEventId,
        userId,
        actionType: "adventure-access-completed",
        targetType: "missionAttempt",
        targetId: attemptId,
        metadata: { missionId, accessCostWfxp, ledgerEventId: accessLedgerEventId },
      });
      transaction.set(adminActionRef, { adminActionId: adminActionRef.id, ...audit });
      transaction.set(auditEventRef, audit);

      return {
        accepted: true,
        attemptId,
        missionId,
        accessLedgerEventId,
        accessCostWfxp,
        remainingWfxp,
        accessAuthorized: true,
        missionCompletionAuthorized: false,
        xpAuthorized: false,
        idempotent: recoveredFromLedger,
        noMonetaryValue: true,
        tokenAuthorized: false,
        cashoutAllowed: false,
      };
    });

    return result;
  });

  exportsTarget.submitAdventureForReview = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const missionId = requiredString(data.missionId, "missionId", HttpsError, 160);
    await readAdventureMission(db, missionId, HttpsError);
    if (optionalString(data.childProfileId, 160)) {
      throw new HttpsError("failed-precondition", "Child Profiles sind fuer den ersten Abenteuerkatalog deaktiviert.");
    }

    const attemptId = adventureMissionAttemptId(userId, missionId);
    const attemptRef = db.collection("missionAttempts").doc(attemptId);
    const completionRef = db.collection("missionCompletions").doc(attemptId);
    const [attemptSnapshot, completionSnapshot] = await Promise.all([attemptRef.get(), completionRef.get()]);
    const attempt = attemptSnapshot.exists ? attemptSnapshot.data() || {} : {};
    if (
      !attemptSnapshot.exists
      || attempt.ownerUserId !== userId
      || attempt.missionId !== missionId
      || attempt.accessAuthorized !== true
      || attempt.accessStatus !== "paid"
    ) {
      throw new HttpsError("failed-precondition", "Ein serverseitig bezahlter Abenteuerzugang ist erforderlich.");
    }
    if (completionSnapshot.exists && (completionSnapshot.data() || {}).status === "completed") {
      throw new HttpsError("failed-precondition", "Dieses Abenteuer wurde bereits abgeschlossen.");
    }

    let evidenceRevision = Math.max(1, Math.floor(Number(attempt.latestEvidenceRevision || 1)));
    let evidenceRef = db.collection("missionEvidence").doc(adventureMissionEvidenceId(attemptId, evidenceRevision));
    let evidenceSnapshot = await evidenceRef.get();
    let existingEvidence = evidenceSnapshot.exists ? evidenceSnapshot.data() || {} : {};

    if (
      evidenceSnapshot.exists
      && (existingEvidence.reviewStatus === "pending-server-review" || existingEvidence.reviewStatus === "approved")
    ) {
      return {
        accepted: true,
        attemptId,
        evidenceId: evidenceRef.id,
        attemptStatus: optionalString(attempt.status, 80) || "evidence-submitted",
        reviewStatus: existingEvidence.reviewStatus,
        accessAuthorized: true,
        missionCompletionAuthorized: false,
        xpAuthorized: false,
        idempotent: true,
        noMonetaryValue: true,
        tokenAuthorized: false,
        cashoutAllowed: false,
      };
    }

    if (evidenceSnapshot.exists) {
      evidenceRevision += 1;
      evidenceRef = db.collection("missionEvidence").doc(adventureMissionEvidenceId(attemptId, evidenceRevision));
      evidenceSnapshot = await evidenceRef.get();
      existingEvidence = evidenceSnapshot.exists ? evidenceSnapshot.data() || {} : {};
      if (evidenceSnapshot.exists && existingEvidence.reviewStatus === "pending-server-review") {
        return {
          accepted: true,
          attemptId,
          evidenceId: evidenceRef.id,
          attemptStatus: "evidence-submitted",
          reviewStatus: "pending-server-review",
          accessAuthorized: true,
          missionCompletionAuthorized: false,
          xpAuthorized: false,
          idempotent: true,
          noMonetaryValue: true,
          tokenAuthorized: false,
          cashoutAllowed: false,
        };
      }
    }

    const batch = db.batch();
    batch.set(attemptRef, {
      status: "evidence-submitted",
      latestEvidenceId: evidenceRef.id,
      latestEvidenceRevision: evidenceRevision,
      latestEvidenceReviewStatus: "pending-server-review",
      missionCompletionAuthorized: false,
      xpAuthorized: false,
      ...clientContext(data),
      ...updatedTimestamp(),
    }, { merge: true });
    batch.set(evidenceRef, {
      evidenceId: evidenceRef.id,
      attemptId,
      missionId,
      ...scopedOwnerFields(userId, null),
      evidenceType: ADVENTURE_EVIDENCE_TYPE,
      evidenceRevision,
      storageRef: null,
      metadata: {
        source: "adventure-missions",
        accessLedgerEventId: attempt.accessLedgerEventId,
        requiresHumanReview: true,
        grantsClientReward: false,
        rawMediaStored: false,
        rawMediaUploaded: false,
      },
      status: "submitted",
      reviewStatus: "pending-server-review",
      serverValidationStatus: "evidence-received",
      reviewedByAdminId: null,
      reviewedAt: null,
      missionCompletionAuthorized: false,
      xpAuthorized: false,
      ...clientContext(data),
      ...serverTimestamps(),
    });
    await batch.commit();

    return {
      accepted: true,
      attemptId,
      evidenceId: evidenceRef.id,
      attemptStatus: "evidence-submitted",
      reviewStatus: "pending-server-review",
      accessAuthorized: true,
      missionCompletionAuthorized: false,
      xpAuthorized: false,
      idempotent: false,
      noMonetaryValue: true,
      tokenAuthorized: false,
      cashoutAllowed: false,
    };
  });

  exportsTarget.completeAdventureAttempt = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const attemptId = requiredString((request.data || {}).attemptId, "attemptId", HttpsError, 220);
    const attemptRef = db.collection("missionAttempts").doc(attemptId);
    const preliminaryAttemptSnapshot = await attemptRef.get();
    if (!preliminaryAttemptSnapshot.exists || (preliminaryAttemptSnapshot.data() || {}).ownerUserId !== userId) {
      throw new HttpsError("permission-denied", "Abenteuer-Attempt gehoert nicht diesem Nutzer.");
    }
    const preliminaryAttempt = preliminaryAttemptSnapshot.data() || {};
    const missionId = requiredString(preliminaryAttempt.missionId, "missionId", HttpsError, 160);
    const latestEvidenceId = requiredString(preliminaryAttempt.latestEvidenceId, "latestEvidenceId", HttpsError, 220);
    if (!isAdventureMissionId(missionId)) {
      throw new HttpsError("invalid-argument", "Attempt ist kein kanonisches Abenteuer.");
    }

    const completionRef = db.collection("missionCompletions").doc(attemptId);
    const missionRef = db.collection("missions").doc(missionId);
    const evidenceRef = db.collection("missionEvidence").doc(latestEvidenceId);
    const rewardLedgerEventId = adventureRewardLedgerId(userId, missionId);
    const rewardLedgerRef = db.collection("xpLedgerEvents").doc(rewardLedgerEventId);
    const legacyLedgerRef = db.collection("ledgerEvents").doc(rewardLedgerEventId);
    const adminActionRef = db.collection("adminActions").doc(rewardLedgerEventId);
    const auditEventRef = db.collection("auditEvents").doc(rewardLedgerEventId);
    const walletRef = await getWalletRef(db, userId, null);

    const result = await db.runTransaction(async (transaction) => {
      const [attemptSnapshot, completionSnapshot, missionSnapshot, evidenceSnapshot, walletSnapshot, rewardLedgerSnapshot] = await Promise.all([
        transaction.get(attemptRef),
        transaction.get(completionRef),
        transaction.get(missionRef),
        transaction.get(evidenceRef),
        transaction.get(walletRef),
        transaction.get(rewardLedgerRef),
      ]);
      const attempt = attemptSnapshot.exists ? attemptSnapshot.data() || {} : {};
      const completion = completionSnapshot.exists ? completionSnapshot.data() || {} : {};
      const mission = missionSnapshot.exists ? missionSnapshot.data() || {} : {};
      const evidence = evidenceSnapshot.exists ? evidenceSnapshot.data() || {} : {};
      const wallet = walletSnapshot.exists ? walletSnapshot.data() || {} : {};
      const currentBalance = Math.max(0, Math.floor(Number(wallet.balance || 0)));

      if (completionSnapshot.exists && completion.status === "completed") {
        return {
          accepted: true,
          completionId: completionRef.id,
          xpLedgerEventId: completion.xpLedgerEventId,
          rewardXp: completion.rewardXp,
          evidenceId: completion.evidenceId,
          remainingWfxp: currentBalance,
          xpAuthorized: true,
          missionCompletionAuthorized: true,
          tokenAuthorized: false,
          cashoutAllowed: false,
          noMonetaryValue: true,
          idempotent: true,
        };
      }

      if (
        !attemptSnapshot.exists
        || attempt.ownerUserId !== userId
        || attempt.missionId !== missionId
        || attempt.accessAuthorized !== true
        || attempt.accessStatus !== "paid"
        || attempt.completionPolicy !== ADVENTURE_COMPLETION_POLICY
        || attempt.latestEvidenceId !== latestEvidenceId
      ) {
        throw new HttpsError("failed-precondition", "Abenteuer-Attempt hat keine gueltige Zugangs- oder Evidence-Autoritaet.");
      }
      if (
        !missionSnapshot.exists
        || mission.status !== "published"
        || mission.catalogId !== adventureCatalog.catalogId
        || mission.completionPolicy !== ADVENTURE_COMPLETION_POLICY
        || mission.accessPolicy !== ADVENTURE_ACCESS_POLICY
      ) {
        throw new HttpsError("failed-precondition", "Abenteuer ist serverseitig nicht sicher veroeffentlicht.");
      }
      if (
        !evidenceSnapshot.exists
        || evidence.ownerUserId !== userId
        || evidence.attemptId !== attemptId
        || evidence.missionId !== missionId
        || evidence.evidenceType !== ADVENTURE_EVIDENCE_TYPE
        || evidence.reviewStatus !== "approved"
        || evidence.serverValidationStatus !== "evidence-approved"
      ) {
        throw new HttpsError("failed-precondition", "Serverseitig freigegebene Abenteuer-Evidence ist erforderlich.");
      }

      const rewardXp = Math.min(Math.max(1, Math.floor(Number(mission.rewardXp || 1))), 300);
      let remainingWfxp = currentBalance;
      let ledgerWasExisting = false;
      if (rewardLedgerSnapshot.exists) {
        const existingLedger = rewardLedgerSnapshot.data() || {};
        if (
          existingLedger.sourceId !== completionRef.id
          || existingLedger.delta !== rewardXp
          || existingLedger.reason !== "mission-completion"
        ) {
          throw new HttpsError("failed-precondition", "Diese Abenteuerbelohnung wurde bereits in einem anderen Completion-Kontext verwendet.");
        }
        ledgerWasExisting = true;
      } else {
        remainingWfxp = currentBalance + rewardXp;
        const rewardLedger = ledgerDocument({
          ledgerEventId: rewardLedgerEventId,
          userId,
          delta: rewardXp,
          reason: "mission-completion",
          sourceType: "adventureMissionCompletion",
          sourceId: completionRef.id,
          metadata: {
            missionId,
            attemptId,
            evidenceId: evidenceRef.id,
            catalogId: adventureCatalog.catalogId,
          },
        });
        transaction.set(rewardLedgerRef, rewardLedger);
        transaction.set(legacyLedgerRef, rewardLedger);
        transaction.set(walletRef, {
          walletId: walletRef.id,
          ...scopedOwnerFields(userId, null),
          balance: remainingWfxp,
          lifetimeEarned: Number(wallet.lifetimeEarned || 0) + rewardXp,
          lifetimeSpent: Number(wallet.lifetimeSpent || 0),
          currency: BETA1_INTERNAL_CURRENCY,
          noMonetaryValue: true,
          blockchainBacked: false,
          cashoutAllowed: false,
          tokenAuthorized: false,
          realMoney: false,
          updatedAt: FieldValue.serverTimestamp(),
          createdAt: wallet.createdAt || FieldValue.serverTimestamp(),
        }, { merge: true });
      }

      const completedAt = new Date().toISOString();
      transaction.set(completionRef, {
        completionId: completionRef.id,
        attemptId,
        missionId,
        ...scopedOwnerFields(userId, null),
        evidenceId: evidenceRef.id,
        evidenceReviewStatus: "approved",
        accessLedgerEventId: attempt.accessLedgerEventId,
        status: "completed",
        serverValidationStatus: "completion-authorized",
        rewardXp,
        xpLedgerEventId: rewardLedgerEventId,
        catalogId: adventureCatalog.catalogId,
        catalogVersion: adventureCatalog.version,
        completionPolicy: ADVENTURE_COMPLETION_POLICY,
        accessPolicy: ADVENTURE_ACCESS_POLICY,
        completedAt,
        noMonetaryValue: true,
        tokenAuthorized: false,
        cashoutAllowed: false,
        ...serverTimestamps(),
      });
      transaction.set(attemptRef, {
        status: "completed",
        completionId: completionRef.id,
        approvedEvidenceId: evidenceRef.id,
        ...updatedTimestamp(),
      }, { merge: true });
      const audit = auditDocument({
        auditId: rewardLedgerEventId,
        userId,
        actionType: "adventure-mission-completed",
        targetType: "missionCompletion",
        targetId: completionRef.id,
        metadata: {
          rewardXp,
          ledgerEventId: rewardLedgerEventId,
          evidenceId: evidenceRef.id,
          accessLedgerEventId: attempt.accessLedgerEventId,
          catalogId: adventureCatalog.catalogId,
        },
      });
      transaction.set(adminActionRef, { adminActionId: adminActionRef.id, ...audit });
      transaction.set(auditEventRef, audit);

      return {
        accepted: true,
        completionId: completionRef.id,
        xpLedgerEventId: rewardLedgerEventId,
        rewardXp,
        evidenceId: evidenceRef.id,
        remainingWfxp,
        xpAuthorized: true,
        missionCompletionAuthorized: true,
        tokenAuthorized: false,
        cashoutAllowed: false,
        noMonetaryValue: true,
        idempotent: ledgerWasExisting,
      };
    });

    return result;
  });

  exportsTarget.getAdventureProgress = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const [attemptsSnapshot, evidenceSnapshot, completionsSnapshot, walletSnapshot] = await Promise.all([
      db.collection("missionAttempts").where("ownerUserId", "==", userId).limit(MAX_HISTORY_DOCS).get(),
      db.collection("missionEvidence").where("ownerUserId", "==", userId).limit(MAX_HISTORY_DOCS).get(),
      db.collection("missionCompletions").where("ownerUserId", "==", userId).limit(MAX_HISTORY_DOCS).get(),
      db.collection("xpWallets").doc(userId).get(),
    ]);

    const evidenceByAttempt = buildLatestEvidenceByAttempt(evidenceSnapshot.docs);
    const completed = buildCompletedAdventures(completionsSnapshot.docs);
    const activeAttempts = buildActiveAttempts({
      attempts: attemptsSnapshot.docs,
      evidenceByAttempt,
      completedAttemptIds: completed.completedAttemptIds,
      completedMissionIds: completed.completedMissionIds,
    });
    const startedMissionIds = [...new Set([
      ...attemptsSnapshot.docs
        .filter((doc) => {
          const attempt = doc.data() || {};
          const missionId = optionalString(attempt.missionId, 160);
          return Boolean(missionId && ADVENTURE_MISSION_IDS.has(missionId) && attempt.accessAuthorized === true && attempt.accessStatus === "paid");
        })
        .map((doc) => optionalString((doc.data() || {}).missionId, 160))
        .filter(Boolean),
      ...activeAttempts.map((attempt) => attempt.missionId),
      ...completed.completedMissionIds,
    ])];
    const completedMissionIds = [...completed.completedMissionIds];
    const wallet = walletSnapshot.exists ? walletSnapshot.data() || {} : {};
    const xp = Math.max(0, Math.floor(Number(wallet.lifetimeEarned || 0)));
    const level = calculateLevelFromXp(xp);

    return {
      accepted: true,
      catalogId: adventureCatalog.catalogId,
      catalogVersion: adventureCatalog.version,
      completionPolicy: adventureCatalog.completionPolicy,
      accessPolicy: adventureCatalog.accessPolicy,
      startedMissionIds,
      completedMissionIds,
      activeAttempts,
      walletBalance: Math.max(0, Math.floor(Number(wallet.balance || 0))),
      lifetimeSpent: Math.max(0, Math.floor(Number(wallet.lifetimeSpent || 0))),
      xp,
      ...level,
      walletAvailable: walletSnapshot.exists,
      progressAuthority: "server-read",
      rewardAuthority: false,
      missionCompletionAuthority: false,
      tokenAuthorized: false,
      cashoutAllowed: false,
      noMonetaryValue: true,
    };
  });
}

module.exports = {
  registerBeta1AdventureMissionProgress,
  isAdventureMissionId,
  adventureMissionAttemptId,
  adventureMissionEvidenceId,
  adventureAccessLedgerId,
  adventureRewardLedgerId,
};
