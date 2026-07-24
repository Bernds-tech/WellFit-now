const {
  db,
  admin,
  assert,
  createAuthUser,
  callCallable,
  getCallableResult,
  describeCall,
  resetBeta1Collections,
  seedBeta1RuntimeData,
} = require("./beta1RuntimeFixtures");
const {
  ONBOARDING_VERSION,
  CONSENT_VERSION,
} = require("../lib/beta1UserOnboarding");

const USER_ID = "onboarding-user";
const HEALTH_USER_ID = "onboarding-health-user";
const LEGACY_USER_ID = "onboarding-legacy-user";
const MINOR_USER_ID = "onboarding-minor-user";
const OTHER_USER_ID = "onboarding-other-user";

function dateYearsAgo(years, month = 0, day = 15) {
  const now = new Date();
  return `${now.getUTCFullYear() - years}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

async function expectOk(functionName, token, data) {
  const response = await callCallable(functionName, token, data);
  assert(response.ok, `${functionName} muss HTTP OK sein: ${describeCall(response)}`);
  const result = getCallableResult(response);
  assert(result && result.accepted === true, `${functionName} muss accepted=true liefern: ${describeCall(response)}`);
  return result;
}

async function expectCallableError(functionName, token, data, label) {
  const response = await callCallable(functionName, token, data);
  assert(!response.ok, `${label || functionName} muss fehlschlagen: ${describeCall(response)}`);
  return response;
}

function basePayload(uid, overrides = {}) {
  return {
    firstName: "Ada",
    lastName: "Lovelace",
    displayName: "Ada Lovelace",
    email: `${uid}@wellfit.test`,
    birthDate: dateYearsAgo(30),
    language: "de",
    timeZone: "Europe/Berlin",
    buddy: { id: "luma" },
    registrationSource: "emulator-test",
    consents: {
      termsAccepted: true,
      privacyAccepted: true,
      healthPersonalization: false,
      anonymousAnalytics: false,
      marketing: false,
    },
    preferences: {
      activityLevel: "medium",
      trainingTime: "evening",
      communityMode: "solo",
      interests: ["Geschichte", "Natur", "Geschichte"],
      goals: ["Mehr Bewegung"],
      activities: ["Walking"],
    },
    ...overrides,
  };
}

async function run() {
  console.log("WellFit Beta 1 User Onboarding Emulator Test startet...");
  await resetBeta1Collections();
  await seedBeta1RuntimeData();

  const userToken = await createAuthUser(USER_ID, false);
  const healthToken = await createAuthUser(HEALTH_USER_ID, false);
  const legacyToken = await createAuthUser(LEGACY_USER_ID, false);
  const minorToken = await createAuthUser(MINOR_USER_ID, false);
  const otherToken = await createAuthUser(OTHER_USER_ID, false);

  const emptyState = await expectOk("getUserOnboardingState", userToken, {});
  assert(emptyState.onboardingCompleted === false && emptyState.requiresInitialization === true, "Neues Konto muss Initialisierung verlangen.");

  await expectCallableError(
    "initializeUserAccount",
    userToken,
    basePayload(USER_ID, { consents: { termsAccepted: true, privacyAccepted: false } }),
    "Datenschutz muss separat akzeptiert werden",
  );
  await expectCallableError(
    "initializeUserAccount",
    userToken,
    basePayload(USER_ID, { timeZone: "Mars/Olympus" }),
    "Ungueltige Zeitzone muss blockiert werden",
  );
  await expectCallableError(
    "initializeUserAccount",
    userToken,
    basePayload(USER_ID, { email: "other@example.com" }),
    "E-Mail darf dem Auth-Konto nicht widersprechen",
  );
  await expectCallableError(
    "initializeUserAccount",
    minorToken,
    basePayload(MINOR_USER_ID, { birthDate: dateYearsAgo(13) }),
    "Selbstregistrierung unter 14 muss blockiert werden",
  );
  await expectCallableError(
    "initializeUserAccount",
    userToken,
    basePayload(USER_ID, {
      healthProfile: { heightCm: 175, weightKg: 70 },
    }),
    "Gesundheitsprofil ohne separate Zustimmung muss blockiert werden",
  );

  const initialized = await expectOk("initializeUserAccount", userToken, basePayload(USER_ID));
  assert(initialized.idempotent === false, "Erste Initialisierung darf nicht idempotent markiert sein.");
  assert(initialized.onboardingVersion === ONBOARDING_VERSION, "Onboarding-Version muss kanonisch sein.");
  assert(initialized.timeZone === "Europe/Berlin", "Server muss die validierte IANA-Zeitzone speichern.");
  assert(initialized.buddy.id === "luma", "Ausgewaehlter Buddy muss serverseitig bestaetigt werden.");
  assert(initialized.healthPersonalizationEnabled === false && initialized.healthProfileStored === false, "Health muss standardmaessig deaktiviert bleiben.");
  assert(initialized.rawBirthDateStored === false, "Rohes Geburtsdatum darf nicht gespeichert werden.");
  assert(initialized.tokenAuthorized === false && initialized.cashoutAllowed === false && initialized.realMoney === false, "Onboarding darf keine Token- oder Zahlungsautoritaet erzeugen.");

  const [userSnapshot, onboardingSnapshot, privateProfileSnapshot, calendarSnapshot, avatarSnapshot, auditSnapshot] = await Promise.all([
    db.collection("users").doc(USER_ID).get(),
    db.collection("userOnboardingRecords").doc(USER_ID).get(),
    db.collection("userPrivateProfiles").doc(USER_ID).get(),
    db.collection("userCalendarSettings").doc(USER_ID).get(),
    db.collection("userAvatars").doc(`${USER_ID}_self_default`).get(),
    db.collection("auditEvents").doc(`onboarding_${USER_ID}`).get(),
  ]);
  const user = userSnapshot.data() || {};
  const onboarding = onboardingSnapshot.data() || {};
  const privateProfile = privateProfileSnapshot.data() || {};
  const calendar = calendarSnapshot.data() || {};
  const avatar = avatarSnapshot.data() || {};

  assert(userSnapshot.exists && user.onboardingAuthority === "server-initialized", "Users-Dokument muss serverseitig initialisiert sein.");
  for (const forbiddenKey of ["points", "xp", "level", "energy", "stepsToday", "avatar", "lastMissionCompletedAt", "deviceLocation"]) {
    assert(user[forbiddenKey] === undefined, `Neue Registrierung darf Legacy-Feld ${forbiddenKey} nicht initialisieren.`);
  }
  assert(user.profile.ageBand === "25-34" && user.profile.healthPersonalizationEnabled === false, "Users-Profil muss nur minimierte Alters-/Consent-Angaben enthalten.");
  assert(user.settings.privacy.profileVisibility === "Privat" && user.settings.privacy.localUsersVisible === false, "Privacy muss konservativ starten.");
  assert(onboarding.rawBirthDateStored === false && onboarding.birthDate === undefined, "Onboarding-Record darf kein Geburtsdatum enthalten.");
  assert(privateProfile.healthProfileStored === false && Object.keys(privateProfile.healthProfile || {}).length === 0, "Ohne Health-Opt-in duerfen keine Gesundheitsdaten gespeichert werden.");
  assert(calendar.timeZone === "Europe/Berlin" && calendar.calendarAuthority === "server-user-time-zone", "Kalender muss serverautoritativ initialisiert sein.");
  assert(avatar.buddyId === "luma" && avatar.level === 1 && avatar.serverValidationStatus === "server-projected", "Buddy muss ohne Client-Economy-Felder angelegt werden.");
  assert(auditSnapshot.exists, "Onboarding muss ein nachvollziehbares Audit Event schreiben.");

  const consentSnapshot = await db.collection("userConsentEvents").where("ownerUserId", "==", USER_ID).get();
  assert(consentSnapshot.size === 5, "Onboarding muss fuenf getrennte Consent-Entscheidungen dokumentieren.");
  const consents = Object.fromEntries(consentSnapshot.docs.map((doc) => {
    const data = doc.data() || {};
    return [data.consentType, data];
  }));
  assert(consents.terms.status === "active" && consents.privacy.status === "active", "Pflichtzustimmungen muessen aktiv sein.");
  assert(consents.healthPersonalization.status === "declined", "Health-Opt-in muss separat als abgelehnt dokumentiert werden.");
  assert(consents.terms.version === CONSENT_VERSION, "Consent-Version muss kanonisch sein.");

  const replay = await expectOk("initializeUserAccount", userToken, basePayload(USER_ID, { buddy: { id: "king" } }));
  assert(replay.idempotent === true && replay.buddy.id === "luma", "Replay darf Profil und Buddy nicht still ueberschreiben.");
  const state = await expectOk("getUserOnboardingState", userToken, {});
  assert(state.onboardingCompleted === true && state.requiresInitialization === false, "Onboarding-Status muss abgeschlossen projiziert werden.");
  assert(state.healthDataCategories.length === 0 && state.rawBirthDateStored === false, "Statusprojektion muss datensparsam bleiben.");

  const healthInitialized = await expectOk("initializeUserAccount", healthToken, basePayload(HEALTH_USER_ID, {
    timeZone: "Asia/Tokyo",
    consents: {
      termsAccepted: true,
      privacyAccepted: true,
      healthPersonalization: true,
      anonymousAnalytics: true,
      marketing: false,
    },
    healthProfile: {
      heightCm: 172.346,
      weightKg: 68.2,
      fitnessLevel: "medium",
      sleepHours: "6-8",
      sleepQuality: "good",
      nutrition: "vegetarian",
      stressLevel: 3,
      limitations: ["Knie", "Knie"],
      medicationDeclared: true,
      freeTextNotes: "darf nicht gespeichert werden",
      birthDate: "darf nicht gespeichert werden",
    },
  }));
  assert(healthInitialized.healthPersonalizationEnabled === true && healthInitialized.healthProfileStored === true, "Explizites Health-Opt-in muss minimiertes Profil erlauben.");
  const healthPrivate = (await db.collection("userPrivateProfiles").doc(HEALTH_USER_ID).get()).data() || {};
  assert(healthPrivate.healthProfile.heightCm === 172.35 && healthPrivate.healthProfile.weightKg === 68.2, "Numerische Health-Werte muessen begrenzt und normalisiert werden.");
  assert(healthPrivate.healthProfile.freeTextNotes === undefined && healthPrivate.healthProfile.birthDate === undefined, "Freitext und Geburtsdatum duerfen nie in Health-Daten gelangen.");
  assert(healthPrivate.medicationDetailsStored === false && healthPrivate.rawBirthDateStored === false, "Sensible Detaildaten muessen ausgeschlossen bleiben.");

  await db.collection("users").doc(LEGACY_USER_ID).set({ points: 99, xp: 12, level: 2, createdAt: "legacy" });
  const legacyInitialized = await expectOk("initializeUserAccount", legacyToken, basePayload(LEGACY_USER_ID));
  assert(legacyInitialized.legacyEconomyFieldsDetected === true, "Legacy-Economy-Felder muessen transparent erkannt werden.");
  const legacyUser = (await db.collection("users").doc(LEGACY_USER_ID).get()).data() || {};
  assert(legacyUser.points === 99 && legacyUser.xp === 12, "Onboarding darf Legacy-Daten nicht still loeschen; Migration bleibt separater Task.");
  assert(legacyUser.onboardingAuthority === "server-initialized", "Legacy-Konto muss dennoch serverseitig normalisiert werden koennen.");

  const otherState = await expectOk("getUserOnboardingState", otherToken, {});
  assert(otherState.onboardingCompleted === false, "Onboarding-State muss strikt auf den authentifizierten Nutzer begrenzt sein.");

  console.log("WellFit Beta 1 User Onboarding Emulator Test erfolgreich.");
  for (const uid of [USER_ID, HEALTH_USER_ID, LEGACY_USER_ID, MINOR_USER_ID, OTHER_USER_ID]) {
    await admin.auth().deleteUser(uid);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
