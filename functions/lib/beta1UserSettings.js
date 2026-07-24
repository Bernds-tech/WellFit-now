const { FieldValue } = require("firebase-admin/firestore");
const {
  requireAuth,
  requiredString,
  optionalString,
  writeAudit,
} = require("./beta1Runtime");
const {
  DEFAULT_TIME_ZONE,
  normalizeTimeZone,
  resolveUserCalendarContext,
} = require("./beta1UserCalendar");

const ALLOWED_LANGUAGES = new Set(["Deutsch", "English"]);
const ALLOWED_UNITS = new Set(["kg / km", "lb / mi"]);

function enumValue(value, allowed, fallback, fieldName, HttpsError) {
  const normalized = optionalString(value, 80);
  if (!normalized) return fallback;
  if (!allowed.has(normalized)) {
    throw new HttpsError("invalid-argument", `${fieldName} ist nicht freigegeben.`);
  }
  return normalized;
}

function normalizePhone(value, HttpsError) {
  const phone = optionalString(value, 40);
  if (!phone) return "";
  if (!/^[+0-9()\-\s]{5,40}$/.test(phone)) {
    throw new HttpsError("invalid-argument", "Telefonnummer enthaelt ungueltige Zeichen.");
  }
  return phone;
}

function splitDisplayName(value, HttpsError) {
  const displayName = requiredString(value, "displayName", HttpsError, 160).replace(/\s+/g, " ").trim();
  const [firstName, ...lastNameParts] = displayName.split(" ");
  if (!firstName) throw new HttpsError("invalid-argument", "displayName ist ungueltig.");
  return {
    displayName,
    firstName,
    lastName: lastNameParts.join(" "),
  };
}

function registerBeta1UserSettings(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.updateUserAccountProfile = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const onboardingSnapshot = await db.collection("userOnboardingRecords").doc(userId).get();
    if (!onboardingSnapshot.exists || (onboardingSnapshot.data() || {}).status !== "completed") {
      throw new HttpsError("failed-precondition", "Sichere Konto-Initialisierung ist vor Profilupdates erforderlich.");
    }

    const names = splitDisplayName(data.displayName, HttpsError);
    const language = enumValue(data.language, ALLOWED_LANGUAGES, "Deutsch", "language", HttpsError);
    const units = enumValue(data.units, ALLOWED_UNITS, "kg / km", "units", HttpsError);
    const phone = normalizePhone(data.phone, HttpsError);
    const requestedTimeZoneRaw = optionalString(data.timeZone, 120);
    const requestedTimeZone = normalizeTimeZone(requestedTimeZoneRaw);
    if (requestedTimeZoneRaw && !requestedTimeZone) {
      throw new HttpsError("invalid-argument", "timeZone muss eine gueltige IANA-Zeitzone sein.");
    }
    const calendar = await resolveUserCalendarContext(
      db,
      userId,
      requestedTimeZone || DEFAULT_TIME_ZONE,
      HttpsError,
      new Date(),
    );
    const tokenEmail = optionalString(request.auth.token && request.auth.token.email, 320);
    if (!tokenEmail) throw new HttpsError("failed-precondition", "Firebase-Auth-E-Mail fehlt.");

    const userRef = db.collection("users").doc(userId);
    const existingSnapshot = await userRef.get();
    if (!existingSnapshot.exists) {
      throw new HttpsError("failed-precondition", "Serverseitiges Nutzerprofil fehlt.");
    }

    await userRef.update({
      firstName: names.firstName,
      lastName: names.lastName,
      displayName: names.displayName,
      email: tokenEmail.toLowerCase(),
      "profile.account.displayName": names.displayName,
      "settings.displayName": names.displayName,
      "settings.email": tokenEmail.toLowerCase(),
      "settings.phone": phone,
      "settings.language": language,
      "settings.timeZone": calendar.timeZone,
      "settings.units": units,
      serverValidationStatus: "server-profile-updated",
      updatedAt: FieldValue.serverTimestamp(),
    });

    await writeAudit(db, {
      actorUserId: userId,
      actionType: "user-account-profile-updated",
      targetType: "user",
      targetId: userId,
      ownerUserId: userId,
      reason: "authenticated-settings-update",
      metadata: {
        language,
        units,
        timeZone: calendar.timeZone,
        timeZoneChanged: calendar.timeZoneChanged,
        timeZoneChangeDeferred: calendar.timeZoneChangeDeferred,
        emailSource: "firebase-auth-token",
        economyFieldsChanged: false,
      },
    });

    return {
      accepted: true,
      profile: {
        displayName: names.displayName,
        firstName: names.firstName,
        lastName: names.lastName,
        email: tokenEmail.toLowerCase(),
        phone,
        language,
        timeZone: calendar.timeZone,
        units,
      },
      calendar: {
        timeZone: calendar.timeZone,
        timeZoneChanged: calendar.timeZoneChanged,
        timeZoneChangeDeferred: calendar.timeZoneChangeDeferred,
        nextTimeZoneChangeAt: calendar.nextTimeZoneChangeAt,
      },
      serverValidationStatus: "server-profile-updated",
      economyFieldsChanged: false,
      tokenAuthorized: false,
      cashoutAllowed: false,
      realMoney: false,
    };
  });
}

module.exports = {
  registerBeta1UserSettings,
  normalizePhone,
  splitDisplayName,
};
