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

const USER_ID = "settings-user";
const UNINITIALIZED_USER_ID = "settings-uninitialized";

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
    buddy: { id: "flammi" },
    registrationSource: "settings-emulator-test",
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
      interests: [],
      goals: [],
      activities: ["walking"],
    },
  };
}

async function run() {
  console.log("WellFit Beta 1 User Settings Emulator Test startet...");
  await resetBeta1Collections();
  await seedBeta1RuntimeData();

  const userToken = await createAuthUser(USER_ID, false);
  const uninitializedToken = await createAuthUser(UNINITIALIZED_USER_ID, false);

  await expectCallableError(
    "updateUserAccountProfile",
    uninitializedToken,
    {
      displayName: "No Profile",
      phone: "",
      language: "Deutsch",
      timeZone: "Europe/Berlin",
      units: "kg / km",
    },
    "Profilupdate vor sicherem Onboarding muss blockiert werden",
  );

  await expectOk("initializeUserAccount", userToken, onboardingPayload());

  await expectCallableError(
    "updateUserAccountProfile",
    userToken,
    {
      displayName: "Ada Lovelace",
      phone: "not-a-phone!",
      language: "Deutsch",
      timeZone: "Europe/Berlin",
      units: "kg / km",
    },
    "Ungueltige Telefonnummer muss blockiert werden",
  );
  await expectCallableError(
    "updateUserAccountProfile",
    userToken,
    {
      displayName: "Ada Lovelace",
      phone: "+43 660 1234567",
      language: "Deutsch",
      timeZone: "Mars/Olympus",
      units: "kg / km",
    },
    "Ungueltige Zeitzone muss blockiert werden",
  );

  const updated = await expectOk("updateUserAccountProfile", userToken, {
    displayName: "Ada Byron Lovelace",
    phone: "+43 660 1234567",
    language: "English",
    timeZone: "Europe/Berlin",
    units: "lb / mi",
  });
  assert(updated.serverValidationStatus === "server-profile-updated", "Profilupdate braucht serverseitige Validierung.");
  assert(updated.economyFieldsChanged === false, "Profilupdate darf keine Economy-Felder veraendern.");
  assert(updated.tokenAuthorized === false && updated.cashoutAllowed === false && updated.realMoney === false, "Profilupdate darf keine Token-, Cashout- oder Echtgeld-Autoritaet erzeugen.");
  assert(updated.profile.firstName === "Ada" && updated.profile.lastName === "Byron Lovelace", "Displayname muss serverseitig normalisiert werden.");
  assert(updated.profile.email === `${USER_ID}@wellfit.test`, "E-Mail muss aus dem Auth-Token stammen.");
  assert(updated.profile.phone === "+43 660 1234567", "Telefonnummer muss normalisiert gespeichert werden.");
  assert(updated.profile.language === "English" && updated.profile.units === "lb / mi", "Sprache und Einheiten muessen gespeichert werden.");
  assert(updated.calendar.timeZone === "Europe/Berlin" && updated.calendar.timeZoneChangeDeferred === false, "Unveraenderte Zeitzone darf nicht blockiert werden.");

  const userSnapshot = await db.collection("users").doc(USER_ID).get();
  const user = userSnapshot.data() || {};
  assert(user.firstName === "Ada" && user.lastName === "Byron Lovelace", "Users-Dokument muss den serverseitigen Namen enthalten.");
  assert(user.settings.displayName === "Ada Byron Lovelace", "Settings muessen den serverseitigen Anzeigenamen enthalten.");
  assert(user.settings.timeZone === "Europe/Berlin", "Settings muessen die gueltige Kalenderzeitzone enthalten.");
  assert(user.serverValidationStatus === "server-profile-updated", "Users-Dokument muss die Update-Autoritaet ausweisen.");
  for (const forbiddenField of ["points", "xp", "level", "energy", "stepsToday", "avatar", "lastMissionCompletedAt", "deviceLocation"]) {
    assert(user[forbiddenField] === undefined, `Profilupdate darf ${forbiddenField} nicht anlegen.`);
  }

  const deferred = await expectOk("updateUserAccountProfile", userToken, {
    displayName: "Ada Byron Lovelace",
    phone: "+43 660 1234567",
    language: "English",
    timeZone: "Asia/Tokyo",
    units: "lb / mi",
  });
  assert(deferred.calendar.timeZone === "Europe/Berlin", "Schneller Zeitzonenwechsel muss bei der bestehenden Zone bleiben.");
  assert(deferred.calendar.timeZoneChangeDeferred === true, "Schneller Zeitzonenwechsel muss als deferred markiert werden.");
  assert(typeof deferred.calendar.nextTimeZoneChangeAt === "string", "Deferred-Zustand braucht einen naechsten erlaubten Zeitpunkt.");

  const calendar = (await db.collection("userCalendarSettings").doc(USER_ID).get()).data() || {};
  assert(calendar.timeZone === "Europe/Berlin", "Kalenderdatensatz darf beim blockierten Wechsel nicht manipuliert werden.");

  const auditSnapshot = await db.collection("auditEvents")
    .where("ownerUserId", "==", USER_ID)
    .get();
  const profileAudit = auditSnapshot.docs
    .map((document) => document.data() || {})
    .filter((event) => event.actionType === "user-account-profile-updated");
  assert(profileAudit.length === 2, "Jedes akzeptierte Profilupdate muss auditierbar sein.");
  assert(profileAudit.every((event) => event.metadata && event.metadata.economyFieldsChanged === false), "Audit muss Economy-Unveraendertheit dokumentieren.");

  console.log("WellFit Beta 1 User Settings Emulator Test erfolgreich.");
  await admin.auth().deleteUser(USER_ID);
  await admin.auth().deleteUser(UNINITIALIZED_USER_ID);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
