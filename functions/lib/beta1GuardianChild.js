const {
  requireAuth,
  requiredString,
  optionalString,
  booleanValue,
  serverTimestamps,
  updatedTimestamp,
  assertGuardianCanUseChild,
  hasActiveConsent,
  writeAudit,
} = require("./beta1Runtime");
const { registerBeta1UserOnboarding } = require("./beta1UserOnboarding");
const { registerBeta1UserSettings } = require("./beta1UserSettings");

function registerBeta1GuardianChild(exportsTarget, deps) {
  const { db, onCall, HttpsError } = deps;
  registerBeta1UserOnboarding(exportsTarget, deps);
  registerBeta1UserSettings(exportsTarget, deps);

  exportsTarget.createGuardianFamilyAccount = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const familyRef = db.collection("familyAccounts").doc();
    await familyRef.set({
      familyAccountId: familyRef.id,
      guardianUserIds: [userId],
      childProfileIds: [],
      status: "active",
      displayName: optionalString(data.displayName, 120),
      ...serverTimestamps(),
    });
    await writeAudit(db, { actorUserId: userId, actionType: "family-account-created", targetType: "familyAccount", targetId: familyRef.id, ownerUserId: userId });
    return { accepted: true, familyAccountId: familyRef.id };
  });

  exportsTarget.createChildProfile = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const familyAccountId = requiredString(data.familyAccountId, "familyAccountId", HttpsError);
    const familyRef = db.collection("familyAccounts").doc(familyAccountId);
    const familySnapshot = await familyRef.get();
    if (!familySnapshot.exists || !(familySnapshot.data().guardianUserIds || []).includes(userId)) {
      throw new HttpsError("permission-denied", "Family Account gehoert nicht diesem Guardian.");
    }
    const age = Number(data.age);
    if (!Number.isInteger(age) || age < 8 || age > 13) {
      throw new HttpsError("failed-precondition", "Beta 1 Child Profiles sind nur fuer ganzzahlige Alter 8-13 vorgesehen.");
    }
    const childRef = db.collection("childProfiles").doc();
    const linkRef = db.collection("guardianChildLinks").doc(`${userId}_${childRef.id}`);
    await db.runTransaction(async (transaction) => {
      transaction.set(childRef, {
        childProfileId: childRef.id,
        familyAccountId,
        guardianUserIds: [userId],
        nickname: requiredString(data.nickname, "nickname", HttpsError, 80),
        ageBand: `${age}`,
        permissions: {
          missions: false,
          shop: false,
          location: false,
          cameraEvidence: false,
        },
        status: "active",
        standaloneLoginAllowed: false,
        publicProfile: false,
        ...serverTimestamps(),
      });
      transaction.set(linkRef, {
        linkId: linkRef.id,
        guardianUserId: userId,
        childProfileId: childRef.id,
        familyAccountId,
        relationship: optionalString(data.relationship, 80) || "guardian",
        status: "active",
        ...serverTimestamps(),
      });
      transaction.update(familyRef, { childProfileIds: [...(familySnapshot.data().childProfileIds || []), childRef.id], ...updatedTimestamp() });
    });
    await writeAudit(db, { actorUserId: userId, actionType: "child-profile-created", targetType: "childProfile", targetId: childRef.id, ownerUserId: userId, childProfileId: childRef.id });
    return { accepted: true, childProfileId: childRef.id, guardianAuthority: true, standaloneLoginAllowed: false };
  });

  exportsTarget.recordParentalConsent = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const childProfileId = requiredString(data.childProfileId, "childProfileId", HttpsError);
    await assertGuardianCanUseChild(db, userId, childProfileId, HttpsError);
    const consentType = requiredString(data.consentType, "consentType", HttpsError, 80);
    if (!["missions", "shop", "location", "cameraEvidence"].includes(consentType)) {
      throw new HttpsError("invalid-argument", "consentType ist fuer Beta 1 nicht freigegeben.");
    }
    const consentRef = db.collection("parentalConsents").doc();
    await consentRef.set({
      consentId: consentRef.id,
      guardianUserId: userId,
      ownerUserId: userId,
      userId,
      childProfileId,
      consentType,
      version: optionalString(data.version, 40) || "beta1-v1",
      status: "active",
      grantedAt: new Date().toISOString(),
      revokedAt: null,
      ...serverTimestamps(),
    });
    await writeAudit(db, { actorUserId: userId, actionType: "parental-consent-recorded", targetType: "parentalConsent", targetId: consentRef.id, ownerUserId: userId, childProfileId, metadata: { consentType } });
    return { accepted: true, consentId: consentRef.id, consentType };
  });

  exportsTarget.updateChildPermissions = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const childProfileId = requiredString(data.childProfileId, "childProfileId", HttpsError);
    await assertGuardianCanUseChild(db, userId, childProfileId, HttpsError);
    const requestedPermissions = data.permissions || {};
    const permissions = {
      missions: booleanValue(requestedPermissions.missions, false),
      shop: booleanValue(requestedPermissions.shop, false),
      location: booleanValue(requestedPermissions.location, false),
      cameraEvidence: booleanValue(requestedPermissions.cameraEvidence, false),
    };
    for (const [permissionName, enabled] of Object.entries(permissions)) {
      if (enabled && !(await hasActiveConsent(db, userId, childProfileId, permissionName))) {
        throw new HttpsError("failed-precondition", `Aktive Zustimmung fuer ${permissionName} erforderlich, bevor die Child Permission aktiviert wird.`);
      }
    }
    await db.collection("childProfiles").doc(childProfileId).set({ permissions, ...updatedTimestamp() }, { merge: true });
    await writeAudit(db, { actorUserId: userId, actionType: "child-permissions-updated", targetType: "childProfile", targetId: childProfileId, ownerUserId: userId, childProfileId, metadata: { permissions } });
    return { accepted: true, childProfileId, permissions };
  });

  exportsTarget.archiveChildProfile = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const childProfileId = requiredString((request.data || {}).childProfileId, "childProfileId", HttpsError);
    await assertGuardianCanUseChild(db, userId, childProfileId, HttpsError);
    await db.collection("childProfiles").doc(childProfileId).set({ status: "archived", archivedAt: new Date().toISOString(), ...updatedTimestamp() }, { merge: true });
    await writeAudit(db, { actorUserId: userId, actionType: "child-profile-archived", targetType: "childProfile", targetId: childProfileId, ownerUserId: userId, childProfileId });
    return { accepted: true, childProfileId, status: "archived" };
  });
}

module.exports = { registerBeta1GuardianChild };
