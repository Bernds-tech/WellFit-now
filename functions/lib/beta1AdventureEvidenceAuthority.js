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
const {
  isAdventureMissionId,
  adventureMissionAttemptId,
  adventureMissionEvidenceId,
  adventureRewardLedgerId,
  ADVENTURE_LOCATION_POLICY,
} = require("./beta1AdventureMissionProgress");

const ADVENTURE_EVIDENCE_TYPE = "adventure-user-confirmation";
const ADVENTURE_COMPLETION_POLICY = "once-per-mission-per-user";
const ADVENTURE_ACCESS_POLICY = "one-time-wfxp-access-per-user";

function attemptLocationBinding(attempt) {
  return {
    locationId: attempt.locationId,
    locationTitle: optionalString(attempt.locationTitle, 120),
    regionId: optionalString(attempt.regionId, 80),
    countryCode: optionalString(attempt.countryCode, 8),
    locality: optionalString(attempt.locality, 120),
    locationType: optionalString(attempt.locationType, 80),
    locationAuthority: "server-published-nearby",
    accessStartDistanceMeters: Math.max(0, Math.floor(Number(attempt.accessStartDistanceMeters || 0))),
    userLocationStored: false,
  };
}

function evidenceMetadata(evidence) {
  return evidence && evidence.metadata && typeof evidence.metadata === "object" && !Array.isArray(evidence.metadata)
    ? evidence.metadata
    : {};
}

function evidenceMatchesAttemptLocation(evidence, attempt) {
  const metadata = evidenceMetadata(evidence);
  return evidence.locationId === attempt.locationId
    && evidence.locationAuthority === "server-published-nearby"
    && evidence.userLocationStored === false
    && metadata.locationId === attempt.locationId
    && metadata.locationAuthority === "server-published-nearby"
    && metadata.userLocationStored === false;
}

async function ensureEvidenceLocationBinding(evidenceRef, evidence, attempt, HttpsError) {
  if (
    evidence.ownerUserId !== attempt.ownerUserId
    || evidence.attemptId !== attempt.attemptId
    || evidence.missionId !== attempt.missionId
    || evidence.evidenceType !== ADVENTURE_EVIDENCE_TYPE
  ) {
    throw new HttpsError("failed-precondition", "Bestehende Abenteuer-Evidence passt nicht zum autorisierten Attempt.");
  }

  const metadata = evidenceMetadata(evidence);
  const existingLocationId = optionalString(evidence.locationId, 160);
  const metadataLocationId = optionalString(metadata.locationId, 160);
  const existingAuthority = optionalString(evidence.locationAuthority, 80);
  const metadataAuthority = optionalString(metadata.locationAuthority, 80);
  if (
    (existingLocationId && existingLocationId !== attempt.locationId)
    || (metadataLocationId && metadataLocationId !== attempt.locationId)
    || (existingAuthority && existingAuthority !== "server-published-nearby")
    || (metadataAuthority && metadataAuthority !== "server-published-nearby")
  ) {
    throw new HttpsError("failed-precondition", "Bestehende Abenteuer-Evidence hat einen widerspruechlichen Standortbezug.");
  }

  if (!evidenceMatchesAttemptLocation(evidence, attempt)) {
    const binding = attemptLocationBinding(attempt);
    await evidenceRef.set({
      ...binding,
      metadata: {
        ...metadata,
        locationId: binding.locationId,
        regionId: binding.regionId,
        locationAuthority: binding.locationAuthority,
        userLocationStored: false,
      },
      ...updatedTimestamp(),
    }, { merge: true });
  }
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
    || mission.catalogVersion !== adventureCatalog.version
    || mission.completionPolicy !== ADVENTURE_COMPLETION_POLICY
    || mission.accessPolicy !== ADVENTURE_ACCESS_POLICY
    || mission.locationPolicy !== ADVENTURE_LOCATION_POLICY
    || Number(mission.startRadiusMeters) !== Number(adventureCatalog.startRadiusMeters)
    || !mission.evidencePolicy
    || !Array.isArray(mission.evidencePolicy.allowedEvidenceTypes)
    || !mission.evidencePolicy.allowedEvidenceTypes.includes(ADVENTURE_EVIDENCE_TYPE)
  ) {
    throw new HttpsError("failed-precondition", "Abenteuer ist serverseitig nicht sicher veroeffentlicht.");
  }
  return { snapshot: missionSnapshot, data: mission };
}

function ledgerDocument({ ledgerEventId, userId, delta, reason, sourceType, sourceId, metadata, actorUserId = userId }) {
  return {
    ledgerEventId,
    ...scopedOwnerFields(userId, null),
    delta,
    reason,
    sourceType,
    sourceId,
    actorUserId,
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

function auditDocument({ auditId, userId, actionType, targetType, targetId, metadata, actorUserId = userId }) {
  return {
    auditEventId: auditId,
    actorUserId,
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

function registerBeta1AdventureEvidenceAuthority(exportsTarget, { db, onCall, HttpsError }) {
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
      || attempt.attemptId !== attemptId
      || attempt.missionId !== missionId
      || attempt.accessAuthorized !== true
      || attempt.accessStatus !== "paid"
      || attempt.locationPolicy !== ADVENTURE_LOCATION_POLICY
      || !optionalString(attempt.locationId, 160)
      || attempt.locationAuthority !== "server-published-nearby"
    ) {
      throw new HttpsError("failed-precondition", "Ein serverseitig bezahlter und ortsgepruefter Abenteuerzugang ist erforderlich.");
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
      await ensureEvidenceLocationBinding(evidenceRef, existingEvidence, attempt, HttpsError);
      return {
        accepted: true,
        attemptId,
        evidenceId: evidenceRef.id,
        attemptStatus: optionalString(attempt.status, 80) || "evidence-submitted",
        reviewStatus: existingEvidence.reviewStatus,
        accessAuthorized: true,
        locationId: attempt.locationId,
        regionId: attempt.regionId || null,
        locationAuthority: "server-published-nearby",
        userLocationStored: false,
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
      if (
        evidenceSnapshot.exists
        && (existingEvidence.reviewStatus === "pending-server-review" || existingEvidence.reviewStatus === "approved")
      ) {
        await ensureEvidenceLocationBinding(evidenceRef, existingEvidence, attempt, HttpsError);
        return {
          accepted: true,
          attemptId,
          evidenceId: evidenceRef.id,
          attemptStatus: optionalString(attempt.status, 80) || "evidence-submitted",
          reviewStatus: existingEvidence.reviewStatus,
          accessAuthorized: true,
          locationId: attempt.locationId,
          regionId: attempt.regionId || null,
          locationAuthority: "server-published-nearby",
          userLocationStored: false,
          missionCompletionAuthorized: false,
          xpAuthorized: false,
          idempotent: true,
          noMonetaryValue: true,
          tokenAuthorized: false,
          cashoutAllowed: false,
        };
      }
    }

    const binding = attemptLocationBinding(attempt);
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
      accessAuthorized: true,
      accessLedgerEventId: attempt.accessLedgerEventId,
      ...binding,
      storageRef: null,
      metadata: {
        source: "adventure-missions",
        accessLedgerEventId: attempt.accessLedgerEventId,
        locationId: binding.locationId,
        regionId: binding.regionId,
        locationAuthority: binding.locationAuthority,
        userLocationStored: false,
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
      locationId: binding.locationId,
      regionId: binding.regionId,
      locationAuthority: binding.locationAuthority,
      userLocationStored: false,
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

    return db.runTransaction(async (transaction) => {
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
        if (
          completion.ownerUserId !== userId
          || completion.missionId !== missionId
          || completion.locationId !== attempt.locationId
          || completion.locationAuthority !== "server-published-nearby"
          || completion.userLocationStored !== false
        ) {
          throw new HttpsError("failed-precondition", "Bestehender Abenteuerabschluss hat einen inkonsistenten Standortbezug.");
        }
        return {
          accepted: true,
          completionId: completionRef.id,
          xpLedgerEventId: completion.xpLedgerEventId,
          rewardXp: completion.rewardXp,
          evidenceId: completion.evidenceId,
          remainingWfxp: currentBalance,
          locationId: completion.locationId,
          regionId: completion.regionId || null,
          locationAuthority: "server-published-nearby",
          userLocationStored: false,
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
        || attempt.attemptId !== attemptId
        || attempt.missionId !== missionId
        || attempt.accessAuthorized !== true
        || attempt.accessStatus !== "paid"
        || attempt.completionPolicy !== ADVENTURE_COMPLETION_POLICY
        || attempt.accessPolicy !== ADVENTURE_ACCESS_POLICY
        || attempt.locationPolicy !== ADVENTURE_LOCATION_POLICY
        || attempt.locationAuthority !== "server-published-nearby"
        || !optionalString(attempt.locationId, 160)
        || attempt.latestEvidenceId !== latestEvidenceId
      ) {
        throw new HttpsError("failed-precondition", "Abenteuer-Attempt hat keine gueltige Zugangs-, Orts- oder Evidence-Autoritaet.");
      }
      if (
        !missionSnapshot.exists
        || mission.status !== "published"
        || mission.catalogId !== adventureCatalog.catalogId
        || mission.catalogVersion !== adventureCatalog.version
        || mission.completionPolicy !== ADVENTURE_COMPLETION_POLICY
        || mission.accessPolicy !== ADVENTURE_ACCESS_POLICY
        || mission.locationPolicy !== ADVENTURE_LOCATION_POLICY
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
        || !evidenceMatchesAttemptLocation(evidence, attempt)
      ) {
        throw new HttpsError("failed-precondition", "Serverseitig freigegebene und ortsgebundene Abenteuer-Evidence ist erforderlich.");
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
          actorUserId: "server",
          metadata: {
            missionId,
            attemptId,
            evidenceId: evidenceRef.id,
            catalogId: adventureCatalog.catalogId,
            locationId: attempt.locationId,
            regionId: attempt.regionId || null,
            locationAuthority: attempt.locationAuthority,
            userLocationStored: false,
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
      const binding = attemptLocationBinding(attempt);
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
        locationPolicy: ADVENTURE_LOCATION_POLICY,
        ...binding,
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
        actorUserId: "server",
        actionType: "adventure-mission-completed",
        targetType: "missionCompletion",
        targetId: completionRef.id,
        metadata: {
          rewardXp,
          ledgerEventId: rewardLedgerEventId,
          evidenceId: evidenceRef.id,
          accessLedgerEventId: attempt.accessLedgerEventId,
          catalogId: adventureCatalog.catalogId,
          locationId: attempt.locationId,
          regionId: attempt.regionId || null,
          locationAuthority: attempt.locationAuthority,
          userLocationStored: false,
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
        locationId: attempt.locationId,
        regionId: attempt.regionId || null,
        locationAuthority: attempt.locationAuthority,
        userLocationStored: false,
        xpAuthorized: true,
        missionCompletionAuthorized: true,
        tokenAuthorized: false,
        cashoutAllowed: false,
        noMonetaryValue: true,
        idempotent: ledgerWasExisting,
      };
    });
  });
}

module.exports = {
  registerBeta1AdventureEvidenceAuthority,
  attemptLocationBinding,
  evidenceMatchesAttemptLocation,
};
