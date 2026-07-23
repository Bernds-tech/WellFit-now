const { FieldValue } = require("firebase-admin/firestore");
const {
  BETA1_INTERNAL_CURRENCY,
  requireAuth,
  requiredString,
  optionalString,
  scopedOwnerFields,
  assertGuardianCanUseChild,
  requireChildConsent,
  requireChildPermission,
  getWalletRef,
  serverTimestamps,
} = require("./beta1Runtime");

const DEFAULT_BUDDY = Object.freeze({
  energy: 78,
  hunger: 70,
  mood: 68,
  cleanliness: 76,
  bond: 68,
  loyalty: 75,
  curiosity: 64,
  level: 1,
  xpTotal: 0,
});

const BUDDY_ACTION_POLICIES = Object.freeze({
  care: {
    costWfxp: 8,
    cooldownSeconds: 10,
    effects: { cleanliness: 18, bond: 6, mood: 4, loyalty: 2 },
  },
  play: {
    costWfxp: 3,
    cooldownSeconds: 10,
    effects: { mood: 16, curiosity: 10, bond: 5, energy: -4, hunger: -3 },
  },
  clean: {
    costWfxp: 4,
    cooldownSeconds: 10,
    effects: { cleanliness: 40, mood: 2, bond: 1 },
  },
  call: {
    costWfxp: 0,
    cooldownSeconds: 60,
    effects: { bond: 2, mood: 2, loyalty: 1 },
  },
  search: {
    costWfxp: 0,
    cooldownSeconds: 60,
    effects: { bond: 20, loyalty: 20, mood: 10, energy: 5, hunger: 5 },
  },
});

const BUDDY_STAT_KEYS = ["energy", "hunger", "mood", "cleanliness", "bond", "loyalty", "curiosity"];

function safeDocIdPart(value) {
  return encodeURIComponent(String(value || "none")).replace(/\./g, "%2E");
}

function clamp(value, min = 0, max = 100, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function buddyAvatarId(ownerUserId, childProfileId) {
  return `${safeDocIdPart(ownerUserId)}_${safeDocIdPart(childProfileId || "self")}_default`;
}

function calculateLevelFromXp(totalXp) {
  let remaining = Math.max(0, Math.floor(Number(totalXp) || 0));
  let level = 1;
  while (remaining >= 100 + (level - 1) * 50 && level < 1000) {
    remaining -= 100 + (level - 1) * 50;
    level += 1;
  }
  return { level, xpForCurrentLevel: remaining, xpForNextLevel: 100 + (level - 1) * 50 };
}

function getBuddyStatus(state) {
  if (state.loyalty <= 12 && state.bond <= 15) return "ranAway";
  if (state.cleanliness <= 25) return "messy";
  if (state.energy <= 30 || state.hunger <= 30 || state.bond <= 30) return "needsCare";
  if (state.energy <= 45 || state.hunger <= 45) return "tired";
  return "active";
}

function getBuddyDailyMode(state) {
  if (state.cleanliness < 35) return "chaotisch";
  if (state.hunger < 40) return "hungrig";
  if (state.energy < 45) return "muede";
  if (state.mood > 78) return "stolz";
  if (state.curiosity > 72) return "abenteuerlustig";
  if (state.mood > 58) return "verspielt";
  return "neugierig";
}

function normalizedBuddyData(ownerUserId, childProfileId, avatarData = {}) {
  const stats = {};
  for (const key of BUDDY_STAT_KEYS) {
    stats[key] = clamp(avatarData[key], 0, 100, DEFAULT_BUDDY[key]);
  }
  return {
    userAvatarId: buddyAvatarId(ownerUserId, childProfileId),
    ...scopedOwnerFields(ownerUserId, childProfileId),
    buddyId: optionalString(avatarData.buddyId, 80) || "default",
    equippedItemIds: Array.isArray(avatarData.equippedItemIds) ? avatarData.equippedItemIds.slice(0, 40) : [],
    level: Math.max(1, Math.floor(clamp(avatarData.level, 1, 1000, DEFAULT_BUDDY.level))),
    xpTotal: Math.max(0, Math.floor(Number(avatarData.xpTotal || DEFAULT_BUDDY.xpTotal))),
    ...stats,
    lastFedAt: optionalString(avatarData.lastFedAt, 80),
    lastActionAt: avatarData.lastActionAt && typeof avatarData.lastActionAt === "object" && !Array.isArray(avatarData.lastActionAt)
      ? avatarData.lastActionAt
      : {},
    serverValidationStatus: "server-projected",
  };
}

function publicBuddyState(ownerUserId, childProfileId, avatarData, walletData, initialized) {
  const normalized = normalizedBuddyData(ownerUserId, childProfileId, avatarData);
  const lifetimeEarned = Math.max(0, Math.floor(Number(walletData.lifetimeEarned || 0)));
  const levelInfo = calculateLevelFromXp(lifetimeEarned);
  const level = Math.max(normalized.level, levelInfo.level);
  const state = { ...normalized, level };
  return {
    name: "Flammi",
    title: level >= 10 ? "Legendärer Feuerdrache" : level >= 5 ? "Mutiger Abenteuer-Buddy" : "Junger Feuerdrache",
    level,
    xp: lifetimeEarned,
    nextLevelXp: Math.max(100, level * 150),
    points: Math.max(0, Math.floor(Number(walletData.balance || 0))),
    energy: state.energy,
    hunger: state.hunger,
    mood: state.mood,
    cleanliness: state.cleanliness,
    bond: state.bond,
    loyalty: state.loyalty,
    curiosity: state.curiosity,
    status: getBuddyStatus(state),
    dailyMode: getBuddyDailyMode(state),
    initialized,
    serverValidationStatus: "server-projected",
    currency: BETA1_INTERNAL_CURRENCY,
    noMonetaryValue: true,
    tokenAuthorized: false,
    cashoutAllowed: false,
  };
}

function applyEffects(current, effects) {
  const next = { ...current };
  for (const [key, delta] of Object.entries(effects)) {
    if (!BUDDY_STAT_KEYS.includes(key)) continue;
    next[key] = clamp(Number(current[key]) + Number(delta), 0, 100, current[key]);
  }
  return next;
}

function hasStateChange(before, after, effects) {
  return Object.keys(effects).some((key) => Number(before[key]) !== Number(after[key]));
}

function parseActionTimestamp(value) {
  if (!value) return 0;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function actionAuditBase({ actionId, userId, childProfileId, actionType, costWfxp, before, after }) {
  return {
    actorUserId: userId,
    actionType: "buddy-care-action-completed",
    targetType: "userAvatar",
    targetId: buddyAvatarId(userId, childProfileId),
    reason: "beta1-server-authorized",
    ownerUserId: userId,
    userId,
    childProfileId: childProfileId || null,
    metadata: {
      actionType,
      costWfxp,
      beforeStatus: getBuddyStatus(before),
      afterStatus: getBuddyStatus(after),
    },
    source: "beta1-runtime",
    refId: actionId,
    ...serverTimestamps(),
  };
}

function registerBeta1BuddyActions(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.getBuddyStateProjection = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const childProfileId = optionalString((request.data || {}).childProfileId, 160);
    if (childProfileId) await assertGuardianCanUseChild(db, userId, childProfileId, HttpsError);
    const avatarRef = db.collection("userAvatars").doc(buddyAvatarId(userId, childProfileId));
    const walletRef = await getWalletRef(db, userId, childProfileId);
    const [avatarSnapshot, walletSnapshot] = await Promise.all([avatarRef.get(), walletRef.get()]);
    const avatarData = avatarSnapshot.exists ? avatarSnapshot.data() || {} : {};
    const walletData = walletSnapshot.exists ? walletSnapshot.data() || {} : {};
    if (!avatarSnapshot.exists) {
      const initial = normalizedBuddyData(userId, childProfileId, avatarData);
      await avatarRef.set({
        ...initial,
        status: getBuddyStatus(initial),
        dailyMode: getBuddyDailyMode(initial),
        ...serverTimestamps(),
      });
    }
    return {
      accepted: true,
      buddy: publicBuddyState(userId, childProfileId, avatarData, walletData, avatarSnapshot.exists),
      actionPolicies: Object.fromEntries(Object.entries(BUDDY_ACTION_POLICIES).map(([actionType, policy]) => [actionType, {
        actionType,
        costWfxp: policy.costWfxp,
        cooldownSeconds: policy.cooldownSeconds,
      }])),
      finalAuthority: true,
      noMonetaryValue: true,
      tokenAuthorized: false,
      cashoutAllowed: false,
    };
  });

  exportsTarget.performBuddyCareAction = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const actionType = requiredString(data.actionType, "actionType", HttpsError, 40);
    const requestId = requiredString(data.requestId, "requestId", HttpsError, 180);
    const policy = BUDDY_ACTION_POLICIES[actionType];
    if (!policy) throw new HttpsError("invalid-argument", "Unbekannte Buddy-Aktion.");
    const childProfileId = optionalString(data.childProfileId, 160);
    if (childProfileId) {
      const childProfile = await assertGuardianCanUseChild(db, userId, childProfileId, HttpsError);
      requireChildPermission(childProfile, "shop", HttpsError);
      await requireChildConsent(db, userId, childProfileId, "shop", HttpsError);
    }

    const avatarRef = db.collection("userAvatars").doc(buddyAvatarId(userId, childProfileId));
    const walletRef = await getWalletRef(db, userId, childProfileId);
    const actionId = `buddy_action_${safeDocIdPart(userId)}_${safeDocIdPart(childProfileId || "self")}_${safeDocIdPart(actionType)}_${safeDocIdPart(requestId)}`;
    const actionRef = db.collection("buddyCareActions").doc(actionId);
    const ledgerRef = policy.costWfxp > 0 ? db.collection("xpLedgerEvents").doc(actionId) : null;
    const legacyLedgerRef = policy.costWfxp > 0 ? db.collection("ledgerEvents").doc(actionId) : null;
    const adminActionRef = db.collection("adminActions").doc(actionId);
    const auditEventRef = db.collection("auditEvents").doc(actionId);

    const result = await db.runTransaction(async (transaction) => {
      const [actionSnapshot, avatarSnapshot, walletSnapshot] = await Promise.all([
        transaction.get(actionRef),
        transaction.get(avatarRef),
        transaction.get(walletRef),
      ]);
      const avatarData = avatarSnapshot.exists ? avatarSnapshot.data() || {} : {};
      const walletData = walletSnapshot.exists ? walletSnapshot.data() || {} : {};
      const before = normalizedBuddyData(userId, childProfileId, avatarData);
      if (actionSnapshot.exists) {
        return {
          accepted: true,
          idempotent: true,
          actionId,
          actionType,
          costWfxp: policy.costWfxp,
          buddy: publicBuddyState(userId, childProfileId, avatarData, walletData, avatarSnapshot.exists),
          remainingWfxp: Math.max(0, Number(walletData.balance || 0)),
          tokenAuthorized: false,
          cashoutAllowed: false,
        };
      }

      const currentStatus = getBuddyStatus(before);
      if (currentStatus === "ranAway" && actionType !== "search") {
        throw new HttpsError("failed-precondition", "Flammi muss zuerst ueber die Suche zurueckgeholt werden.");
      }
      if (currentStatus !== "ranAway" && actionType === "search") {
        throw new HttpsError("failed-precondition", "Flammi ist nicht verschwunden.");
      }
      if (actionType === "play" && (before.energy <= 10 || before.hunger <= 10)) {
        throw new HttpsError("failed-precondition", "Flammi braucht zuerst Futter oder Ruhe.");
      }

      const previousActionAt = parseActionTimestamp(before.lastActionAt[actionType]);
      const elapsedSeconds = previousActionAt ? (Date.now() - previousActionAt) / 1000 : Number.POSITIVE_INFINITY;
      if (elapsedSeconds < policy.cooldownSeconds) {
        throw new HttpsError("resource-exhausted", `Buddy-Aktion hat noch ${Math.ceil(policy.cooldownSeconds - elapsedSeconds)} Sekunden Cooldown.`);
      }

      const currentBalance = Math.max(0, Number(walletData.balance || 0));
      if (currentBalance < policy.costWfxp) {
        return {
          accepted: false,
          idempotent: false,
          rejectionReason: "insufficient-wfxp-balance",
          actionType,
          costWfxp: policy.costWfxp,
          buddy: publicBuddyState(userId, childProfileId, avatarData, walletData, avatarSnapshot.exists),
          remainingWfxp: currentBalance,
          tokenAuthorized: false,
          cashoutAllowed: false,
        };
      }

      const after = applyEffects(before, policy.effects);
      if (!hasStateChange(before, after, policy.effects)) {
        return {
          accepted: false,
          idempotent: false,
          rejectionReason: "buddy-action-no-effect",
          actionType,
          costWfxp: policy.costWfxp,
          buddy: publicBuddyState(userId, childProfileId, avatarData, walletData, avatarSnapshot.exists),
          remainingWfxp: currentBalance,
          tokenAuthorized: false,
          cashoutAllowed: false,
        };
      }

      const performedAt = new Date().toISOString();
      const nextLastActionAt = { ...before.lastActionAt, [actionType]: performedAt };
      const nextAvatar = {
        ...avatarData,
        ...after,
        userAvatarId: avatarRef.id,
        ...scopedOwnerFields(userId, childProfileId),
        buddyId: before.buddyId,
        equippedItemIds: before.equippedItemIds,
        level: before.level,
        xpTotal: before.xpTotal,
        status: getBuddyStatus(after),
        dailyMode: getBuddyDailyMode(after),
        lastActionAt: nextLastActionAt,
        lastActionType: actionType,
        lastActionId: actionId,
        serverValidationStatus: "server-projected",
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: avatarData.createdAt || FieldValue.serverTimestamp(),
      };
      const remainingWfxp = currentBalance - policy.costWfxp;
      const actionDocument = {
        actionId,
        actionType,
        requestId,
        ...scopedOwnerFields(userId, childProfileId),
        costWfxp: policy.costWfxp,
        currency: BETA1_INTERNAL_CURRENCY,
        effects: policy.effects,
        before: Object.fromEntries(BUDDY_STAT_KEYS.map((key) => [key, before[key]])),
        after: Object.fromEntries(BUDDY_STAT_KEYS.map((key) => [key, after[key]])),
        status: "completed",
        noMonetaryValue: true,
        tokenAuthorized: false,
        cashoutAllowed: false,
        performedAt,
        ...serverTimestamps(),
      };
      const auditBase = actionAuditBase({
        actionId,
        userId,
        childProfileId,
        actionType,
        costWfxp: policy.costWfxp,
        before,
        after,
      });

      transaction.set(avatarRef, nextAvatar, { merge: true });
      transaction.set(actionRef, actionDocument);
      transaction.set(adminActionRef, { adminActionId: adminActionRef.id, ...auditBase });
      transaction.set(auditEventRef, { auditEventId: auditEventRef.id, ...auditBase });

      if (policy.costWfxp > 0 && ledgerRef && legacyLedgerRef) {
        const ledgerCommon = {
          ledgerEventId: ledgerRef.id,
          ...scopedOwnerFields(userId, childProfileId),
          delta: -policy.costWfxp,
          reason: "buddy-care-action",
          sourceType: "buddyCareAction",
          sourceId: actionId,
          actorUserId: userId,
          idempotencyKey: actionId,
          currency: BETA1_INTERNAL_CURRENCY,
          noMonetaryValue: true,
          blockchainBacked: false,
          cashoutAllowed: false,
          tokenAuthorized: false,
          realMoney: false,
          metadata: { actionType, avatarId: avatarRef.id },
          ...serverTimestamps(),
        };
        transaction.set(ledgerRef, ledgerCommon);
        transaction.set(legacyLedgerRef, ledgerCommon);
        transaction.set(walletRef, {
          walletId: walletRef.id,
          ...scopedOwnerFields(userId, childProfileId),
          balance: remainingWfxp,
          lifetimeEarned: Number(walletData.lifetimeEarned || 0),
          lifetimeSpent: Number(walletData.lifetimeSpent || 0) + policy.costWfxp,
          currency: BETA1_INTERNAL_CURRENCY,
          noMonetaryValue: true,
          blockchainBacked: false,
          cashoutAllowed: false,
          tokenAuthorized: false,
          realMoney: false,
          updatedAt: FieldValue.serverTimestamp(),
          createdAt: walletData.createdAt || FieldValue.serverTimestamp(),
        }, { merge: true });
      }

      const projectedWallet = { ...walletData, balance: remainingWfxp };
      return {
        accepted: true,
        idempotent: false,
        actionId,
        actionType,
        costWfxp: policy.costWfxp,
        buddy: publicBuddyState(userId, childProfileId, nextAvatar, projectedWallet, true),
        remainingWfxp,
        tokenAuthorized: false,
        cashoutAllowed: false,
      };
    });

    return result;
  });
}

module.exports = {
  registerBeta1BuddyActions,
  BUDDY_ACTION_POLICIES,
  buddyAvatarId,
  getBuddyStatus,
  getBuddyDailyMode,
  normalizedBuddyData,
  publicBuddyState,
};
