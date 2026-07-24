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

const USER_ID = "preferences-user";
const UNINITIALIZED_USER_ID = "preferences-uninitialized";

function dateYearsAgo(years) {
  const now = new Date();
  return `${now.getUTCFullYear() - years}-01-15`;
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

function onboardingPayload() {
  return {
    firstName: "Ada",
    lastName: "Lovelace",
    displayName: "Ada Lovelace",
    email: `${USER_ID}@wellfit.test`,
    birthDate: dateYearsAgo(30),
    language: "de",
    timeZone: "Europe/Berlin",
    buddy: { id: "luma" },
    registrationSource: "preferences-emulator-test",
    consents: {
      termsAccepted: true,
      privacyAccepted: true,
      healthPersonalization: false,
      anonymousAnalytics: false,
      marketing: false,
    },
    preferences: {
      activityLevel: "low",
      trainingTime: "flexible",
      communityMode: "solo",
      interests: ["Natur"],
      goals: ["Mehr Bewegung"],
      activities: ["walking"],
    },
  };
}

function privacyPayload(overrides = {}) {
  return {
    leaderboardVisible: false,
    buddySharing: false,
    anonymousAnalytics: false,
    friendRequests: false,
    teamInvitations: false,
    localUsersVisible: false,
    pvpAllowed: false,
    profileVisibility: "Privat",
    healthDataUsage: "Nicht verwenden",
    locationSharing: "Nie",
    ...overrides,
  };
}

function assertNoEconomyFields(user, label) {
  for (const field of [
    "points",
    "xp",
    "level",
    "energy",
    "stepsToday",
    "avatar",
    "lastMissionCompletedAt",
    "deviceLocation",
  ]) {
    assert(user[field] === undefined, `${label}: Economy-Feld ${field} darf nicht angelegt werden.`);
  }
}

async function run() {
  console.log("WellFit Beta 1 User Preferences Emulator Test startet...");
  await resetBeta1Collections();
  await seedBeta1RuntimeData();

  const userToken = await createAuthUser(USER_ID, false);
  const uninitializedToken = await createAuthUser(UNINITIALIZED_USER_ID, false);

  await expectCallableError(
    "getUserSettingsState",
    uninitializedToken,
    {},
    "Settings-State vor sicherem Onboarding muss blockiert werden",
  );
  const missingSession = await expectOk("recordUserSessionActivity", uninitializedToken, { source: "login" });
  assert(missingSession.requiresInitialization === true && missingSession.recorded === false, "Session ohne Profil muss sicher auf Onboarding verweisen.");

  await expectOk("initializeUserAccount", userToken, onboardingPayload());

  const initialState = await expectOk("getUserSettingsState", userToken, {});
  assert(initialState.serverValidationStatus === "server-settings-projection", "Settings-Projektion muss serverautoritativ sein.");
  assert(initialState.rawBirthDateStored === false, "Settings-Projektion darf kein rohes Geburtsdatum enthalten.");
  assert(initialState.medicationDetailsStored === false && initialState.freeTextHealthNotesStored === false, "Sensible Detaildaten muessen ausgeschlossen bleiben.");
  assert(initialState.state.profile.timezone === "Europe/Berlin", "Nutzerlokale Zeitzone muss projiziert werden.");
  assert(initialState.state.activity.activityLevel === "Kaum aktiv", "Onboarding-Aktivitaetswert muss in die sichtbare Einstellung normalisiert werden.");
  assert(initialState.state.activity.trainingTime === "Flexibel", "Onboarding-Trainingszeit muss normalisiert werden.");
  assert(initialState.state.activity.communityMode === "Alleine", "Onboarding-Communitymodus muss normalisiert werden.");
  assert(initialState.state.healthConsentActive === false, "Health muss standardmaessig deaktiviert sein.");
  assert(initialState.state.biometrics === null && initialState.state.vitalValues === null && initialState.state.lifestyle === null, "Ohne Health-Opt-in duerfen keine privaten Health-Formulare projiziert werden.");
  assert(initialState.tokenAuthorized === false && initialState.cashoutAllowed === false && initialState.realMoney === false, "Settings duerfen keine Token- oder Zahlungsautoritaet erzeugen.");

  const firstSession = await expectOk("recordUserSessionActivity", userToken, { source: "dashboard" });
  assert(firstSession.recorded === true && firstSession.requiresInitialization === false, "Erste Dashboard-Session muss serverseitig erfasst werden.");
  const repeatedSession = await expectOk("recordUserSessionActivity", userToken, { source: "dashboard" });
  assert(repeatedSession.recorded === false && repeatedSession.idempotent === true, "Session-Wiederholung innerhalb des Fensters muss idempotent sein.");
  await expectCallableError("recordUserSessionActivity", userToken, { source: "unknown" }, "Unbekannte Sessionquelle muss blockiert werden");

  await expectOk("updateUserSettingsSection", userToken, {
    section: "notifications",
    value: {
      missionReminder: true,
      sleepReminder: false,
      weeklyReport: true,
      glitchAlert: false,
    },
  });
  await expectOk("updateUserSettingsSection", userToken, {
    section: "permissions",
    value: {
      location: true,
      locationTracking: false,
      camera: true,
      microphone: false,
      backgroundTracking: false,
    },
  });
  await expectOk("updateUserSettingsSection", userToken, {
    section: "activity",
    value: {
      activityLevel: "Regelmäßig aktiv",
      trainingTime: "Morgens",
      communityMode: "Freunde & kleine Gruppen",
      interests: ["Natur", "Lernen", "Natur"],
      activities: ["Gehen", "Radfahren"],
      goals: ["Mehr Bewegung"],
      preferredMissionTypes: ["Bewegung", "Wissen"],
      socialPreference: "Freunde & kleine Gruppen",
      competitionMode: "Motivierend",
    },
  });
  await expectOk("updateUserSettingsSection", userToken, {
    section: "buddy",
    value: {
      avatarType: "Magisches Wesen",
      personality: "Sanft & motivierend",
      relationshipMode: "Freund",
      behaviorDynamics: "Adaptiv",
      motivationStyle: "Ausgewogen",
      reactsToStress: false,
      reactsToSleep: false,
      reactsToActivity: true,
      reactsToMood: false,
    },
  });
  await expectCallableError(
    "updateUserSettingsSection",
    userToken,
    {
      section: "activity",
      value: {
        activityLevel: "Regelmäßig aktiv",
        trainingTime: "Morgens",
        communityMode: "Alleine",
        socialPreference: "Alleine",
        competitionMode: "Aus",
        notes: "freie Profilanalyse",
      },
    },
    "Freie Aktivitaetsnotizen muessen blockiert werden",
  );
  await expectCallableError(
    "updateUserSettingsSection",
    userToken,
    { section: "unknown", value: {} },
    "Unbekannter Settings-Bereich muss blockiert werden",
  );
  await expectCallableError(
    "updateUserSettingsSection",
    userToken,
    {
      section: "biometrics",
      value: {
        heightCm: 172,
        weightKg: 68,
        targetWeightEnabled: false,
        bodyType: "Normal",
        fitnessLevel: "Fortgeschritten",
        limitations: [],
      },
    },
    "Health-Daten ohne separates Opt-in muessen blockiert werden",
  );

  const enabledPrivacy = await expectOk("updateUserPrivacyConsents", userToken, {
    privacy: privacyPayload({
      anonymousAnalytics: true,
      healthDataUsage: "Nur Personalisierung",
    }),
  });
  assert(enabledPrivacy.consentSummary.healthPersonalization === true, "Health-Opt-in muss aktiv dokumentiert werden.");
  assert(enabledPrivacy.consentSummary.healthImprovement === false, "Anonyme Health-Verbesserung darf nicht implizit aktiviert werden.");
  assert(enabledPrivacy.consentSummary.anonymousAnalytics === true, "Analytics-Entscheidung muss getrennt dokumentiert werden.");
  assert(enabledPrivacy.changedConsentTypes.includes("healthPersonalization"), "Health-Opt-in braucht ein neues Consent Event.");
  assert(enabledPrivacy.changedConsentTypes.includes("anonymousAnalytics"), "Analytics-Opt-in braucht ein neues Consent Event.");

  const biometricsResult = await expectOk("updateUserSettingsSection", userToken, {
    section: "biometrics",
    value: {
      heightCm: 172.345,
      weightKg: 68.2,
      targetWeightEnabled: true,
      targetWeightKg: 65,
      bodyType: "Normal",
      fitnessLevel: "Fortgeschritten",
      limitations: ["Knie", "Knie"],
    },
  });
  assert(biometricsResult.storage === "private", "Biometrie muss im privaten Profil gespeichert werden.");

  await expectOk("updateUserSettingsSection", userToken, {
    section: "vitals",
    value: {
      bodyFatPercent: 22.3,
      restingPulseBpm: 62,
      averagePulseBpm: 86,
      bloodPressure: "120/80",
      sleepHours: 7.5,
      sleepQuality: "Hoch",
      stressLevel: "Mittel",
      energyLevel: "Hoch",
      painLevel: "Leicht",
      medicationDeclared: true,
    },
  });
  await expectOk("updateUserSettingsSection", userToken, {
    section: "lifestyle",
    value: {
      nutrition: "Vegetarisch",
      mealRhythm: "Regelmäßig",
      drinkReminder: "Normal",
      drinkAmountLiters: 2.2,
      caffeineIntake: "Niedrig",
      alcoholFrequency: "Selten",
      sleepRoutine: "Regelmäßig",
      natureMove: "Häufig",
      stressCoping: "Spaziergang / Bewegung",
      screenTime: "Mittel",
    },
  });
  await expectCallableError(
    "updateUserSettingsSection",
    userToken,
    {
      section: "vitals",
      value: {
        sleepQuality: "Mittel",
        stressLevel: "Mittel",
        energyLevel: "Mittel",
        painLevel: "Keine",
        medicationNote: "Name und Dosis",
      },
    },
    "Medikamentendetails muessen blockiert werden",
  );
  await expectCallableError(
    "updateUserSettingsSection",
    userToken,
    {
      section: "lifestyle",
      value: {
        nutrition: "Ausgewogen",
        mealRhythm: "Regelmäßig",
        drinkReminder: "Normal",
        caffeineIntake: "Mittel",
        alcoholFrequency: "Selten",
        sleepRoutine: "Regelmäßig",
        natureMove: "Häufig",
        stressCoping: "Musik",
        screenTime: "Mittel",
        notes: "private freie Notiz",
      },
    },
    "Freie Lebensstilnotizen muessen blockiert werden",
  );

  const privateSnapshot = await db.collection("userPrivateProfiles").doc(USER_ID).get();
  const privateProfile = privateSnapshot.data() || {};
  assert(privateProfile.healthSettings.biometrics.heightCm === 172.35, "Biometrische Werte muessen begrenzt normalisiert werden.");
  assert(privateProfile.healthSettings.biometrics.limitations.length === 1, "Private Listen muessen dedupliziert werden.");
  assert(privateProfile.healthSettings.vitals.medicationDeclared === true, "Nur die Medikamenten-Deklaration darf gespeichert werden.");
  assert(privateProfile.healthSettings.vitals.medicationNote === undefined, "Medikamentennamen duerfen nicht gespeichert werden.");
  assert(privateProfile.healthSettings.lifestyle.freeTextNotesStored === false, "Freie Lebensstilnotizen duerfen nicht gespeichert werden.");
  assert(privateProfile.rawBirthDateStored === false && privateProfile.medicationDetailsStored === false && privateProfile.freeTextHealthNotesStored === false, "Private Datenschutzgrenzen muessen explizit dokumentiert sein.");
  assert(privateProfile.healthDataCategories.includes("biometrics") && privateProfile.healthDataCategories.includes("vitals") && privateProfile.healthDataCategories.includes("lifestyle"), "Gespeicherte Health-Kategorien muessen transparent sein.");

  const populatedState = await expectOk("getUserSettingsState", userToken, {});
  assert(populatedState.state.healthConsentActive === true, "Health-Status muss aktiv projiziert werden.");
  assert(populatedState.state.biometrics.height === "172.35", "Private Biometrie muss nur ueber den Callable projiziert werden.");
  assert(populatedState.state.vitalValues.medicationDeclared === true, "Medication-Deklaration muss ohne Details projiziert werden.");
  assert(populatedState.state.lifestyle.nutrition === "Vegetarisch", "Privater Lebensstil muss aus dem richtigen Serverpfad projiziert werden.");

  const improvement = await expectOk("updateUserPrivacyConsents", userToken, {
    privacy: privacyPayload({
      anonymousAnalytics: true,
      healthDataUsage: "Personalisierung & anonyme Verbesserung",
    }),
  });
  assert(improvement.consentSummary.healthImprovement === true, "Health-Verbesserung braucht ein separates aktives Consent.");
  assert(improvement.changedConsentTypes.length === 1 && improvement.changedConsentTypes[0] === "healthImprovement", "Nur die tatsaechlich geaenderte Health-Verbesserung darf als Event geschrieben werden.");

  const revoked = await expectOk("updateUserPrivacyConsents", userToken, {
    privacy: privacyPayload({
      anonymousAnalytics: false,
      healthDataUsage: "Nicht verwenden",
    }),
  });
  assert(revoked.healthDataDeleted === true, "Health-Widerruf muss gespeicherte Health-Daten loeschen.");
  assert(revoked.consentSummary.healthPersonalization === false && revoked.consentSummary.healthImprovement === false, "Health-Einwilligungen muessen widerrufen sein.");

  const privateAfterRevoke = (await db.collection("userPrivateProfiles").doc(USER_ID).get()).data() || {};
  assert(privateAfterRevoke.healthProfileStored === false, "Private Health-Speicherflag muss nach Widerruf false sein.");
  assert(Array.isArray(privateAfterRevoke.healthDataCategories) && privateAfterRevoke.healthDataCategories.length === 0, "Health-Kategorien muessen nach Widerruf leer sein.");
  assert(privateAfterRevoke.healthSettings === undefined && privateAfterRevoke.healthProfile === undefined && privateAfterRevoke.lifestyleSettings === undefined, "Private Health-Daten muessen nach Widerruf entfernt sein.");

  const stateAfterRevoke = await expectOk("getUserSettingsState", userToken, {});
  assert(stateAfterRevoke.state.healthConsentActive === false, "Widerruf muss im Settings-State sichtbar sein.");
  assert(stateAfterRevoke.state.biometrics === null && stateAfterRevoke.state.vitalValues === null && stateAfterRevoke.state.lifestyle === null, "Widerruf darf keine privaten Health-Daten mehr projizieren.");

  const consentSnapshot = await db.collection("userConsentEvents").where("ownerUserId", "==", USER_ID).get();
  const consentStatuses = consentSnapshot.docs.reduce((result, document) => {
    const data = document.data() || {};
    if (!result[data.consentType]) result[data.consentType] = new Set();
    result[data.consentType].add(data.status);
    return result;
  }, {});
  assert(consentStatuses.healthPersonalization.has("declined") && consentStatuses.healthPersonalization.has("active") && consentStatuses.healthPersonalization.has("revoked"), "Health-Personalisierung braucht eine vollstaendige Consent-Historie.");
  assert(consentStatuses.healthImprovement.has("active") && consentStatuses.healthImprovement.has("revoked"), "Health-Verbesserung braucht eine eigene Consent-Historie.");
  assert(consentStatuses.anonymousAnalytics.has("declined") && consentStatuses.anonymousAnalytics.has("active") && consentStatuses.anonymousAnalytics.has("revoked"), "Analytics braucht eine vollstaendige Consent-Historie.");

  const user = (await db.collection("users").doc(USER_ID).get()).data() || {};
  assertNoEconomyFields(user, "Settings-Runtime");
  assert(user.settings.privacy.healthDataUsage === "Nicht verwenden", "Users-Projektion muss den Widerruf enthalten.");
  assert(user.profile.healthPersonalizationEnabled === false, "Users-Projektion darf Health nach Widerruf nicht aktiv anzeigen.");

  const auditSnapshot = await db.collection("auditEvents").where("ownerUserId", "==", USER_ID).get();
  const auditTypes = new Set(auditSnapshot.docs.map((document) => (document.data() || {}).actionType));
  for (const expectedType of [
    "user-settings-notifications-updated",
    "user-settings-permissions-updated",
    "user-settings-activity-updated",
    "user-settings-buddy-updated",
    "user-settings-biometrics-updated",
    "user-settings-vitals-updated",
    "user-settings-lifestyle-updated",
    "user-privacy-consents-updated",
  ]) {
    assert(auditTypes.has(expectedType), `Audit-Typ ${expectedType} fehlt.`);
  }

  console.log("WellFit Beta 1 User Preferences Emulator Test erfolgreich.");
  await admin.auth().deleteUser(USER_ID);
  await admin.auth().deleteUser(UNINITIALIZED_USER_ID);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
