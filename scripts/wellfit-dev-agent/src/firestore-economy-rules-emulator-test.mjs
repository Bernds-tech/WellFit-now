#!/usr/bin/env node

import { initializeApp, deleteApp } from "firebase/app";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signOut,
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const FIRESTORE_HOST = process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080";
const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099";
const FUNCTIONS_BASE_URL = process.env.FUNCTIONS_EMULATOR_URL ?? "http://127.0.0.1:5001/demo-no-project/us-central1";
const PROJECT_ID = process.env.FIREBASE_EMULATOR_PROJECT_ID ?? "demo-no-project";

const now = Date.now();
const ownerHandle = `rules-owner-${now}`;
const otherHandle = `rules-other-${now}`;
const ownerEmail = `${ownerHandle}@example.test`;
const otherEmail = `${otherHandle}@example.test`;
const testCredential = "WellFit-Local-Test-123!";

const serverOnlyCollections = [
  "missionRewardEvents",
  "missionRewardPreviews",
  "missionCompletionEvaluations",
  "ledgerEvents",
  "auditEvents",
  "userEconomyProjections",
  "pointsSinkEvents",
];

const dailyReadOnlyCollections = [
  "userDailyMissionState",
  "userDailyStreaks",
  "userLevels",
];

function parseHostPort(value) {
  const [host, portText] = value.split(":");
  return { host, port: Number.parseInt(portText, 10) };
}

function isExpectedPermissionError(error) {
  const code = error?.code ?? "";
  const message = String(error?.message ?? "").toLowerCase();
  return code === "permission-denied" || message.includes("permission") || message.includes("missing or insufficient permissions");
}

function addResult(results, name, passed, details) {
  results.push({ name, passed, details });
}

async function expectDeny(results, name, action) {
  try {
    await action();
    addResult(results, name, false, "unexpectedly allowed");
  } catch (error) {
    const denied = isExpectedPermissionError(error);
    addResult(results, name, denied, denied ? "denied as expected" : `${error?.code ?? "error"}: ${error?.message ?? error}`);
  }
}

function printResults(results) {
  const passed = results.length > 0 && results.every((result) => result.passed);
  console.log(`Firestore economy rules emulator test result: ${passed ? "PASS" : "FAIL"}`);
  console.log(`Project ID: ${PROJECT_ID}`);
  console.log(`Auth emulator: ${AUTH_HOST}`);
  console.log(`Firestore emulator: ${FIRESTORE_HOST}`);
  console.log(`Functions emulator: ${FUNCTIONS_BASE_URL}`);
  if (results.length === 0) console.log("FAIL: no assertions ran. The emulators are probably not running.");
  for (const result of results) {
    console.log(`${result.passed ? "OK" : "FAIL"}: ${result.name} (${result.details})`);
  }
  if (!passed) process.exitCode = 1;
}

function adultBirthDate() {
  const date = new Date();
  return `${date.getUTCFullYear() - 30}-01-15`;
}

async function initializeOwnerProfile(user, results) {
  const idToken = await user.getIdToken(true);
  const response = await fetch(`${FUNCTIONS_BASE_URL}/initializeUserAccount`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      data: {
        firstName: "Rules",
        lastName: "Owner",
        displayName: "Rules Owner",
        email: ownerEmail,
        birthDate: adultBirthDate(),
        language: "de",
        timeZone: "Europe/Berlin",
        buddy: { id: "flammi" },
        registrationSource: "root-rules-emulator-test",
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
      },
    }),
  });
  const json = await response.json().catch(() => ({}));
  const accepted = response.ok && json?.result?.accepted === true;
  addResult(results, "server onboarding fixture", accepted, accepted ? "created through initializeUserAccount" : JSON.stringify(json));
  if (!accepted) throw new Error(`initializeUserAccount failed: ${JSON.stringify(json)}`);
}

async function main() {
  const app = initializeApp({
    apiKey: "wellfit-emulator-test-key",
    authDomain: `${PROJECT_ID}.local`,
    projectId: PROJECT_ID,
  }, `wellfit-rules-test-${now}`);

  const auth = getAuth(app);
  const db = getFirestore(app);
  const firestoreTarget = parseHostPort(FIRESTORE_HOST);
  const results = [];

  connectAuthEmulator(auth, `http://${AUTH_HOST}`, { disableWarnings: true });
  connectFirestoreEmulator(db, firestoreTarget.host, firestoreTarget.port);

  try {
    const ownerCredential = await createUserWithEmailAndPassword(auth, ownerEmail, testCredential);
    const ownerUser = ownerCredential.user;
    const ownerUserId = ownerUser.uid;

    await expectDeny(results, "users owner doc client create", async () => {
      await setDoc(doc(db, "users", ownerUserId), {
        profile: { displayName: "Client-created profile" },
        settings: { language: "de" },
      });
    });

    await initializeOwnerProfile(ownerUser, results);

    for (const [field, value] of [
      ["profile", { account: { displayName: "Rules Owner Updated" } }],
      ["settings", { language: "Deutsch", brightness: 100 }],
      ["lastLoginAt", new Date().toISOString()],
      ["updatedAt", new Date().toISOString()],
      ["points", 25],
      ["xp", 10],
      ["level", 2],
      ["energy", 100],
      ["stepsToday", 9999],
      ["avatar", { energy: 75 }],
      ["lastMissionCompletedAt", new Date().toISOString()],
      ["deviceLocation", { latitude: 1, longitude: 1 }],
      ["consent", { bypass: true }],
      ["inventory", { rare: true }],
    ]) {
      await expectDeny(results, `users protected ${field} update`, async () => {
        await updateDoc(doc(db, "users", ownerUserId), { [field]: value });
      });
    }

    for (const collectionName of ["userOnboardingRecords", "userPrivateProfiles", "userConsentEvents"]) {
      await expectDeny(results, `${collectionName} direct client read`, async () => {
        await (collectionName === "userConsentEvents"
          ? setDoc(doc(db, collectionName, `${ownerUserId}_${now}`), { ownerUserId, userId: ownerUserId })
          : updateDoc(doc(db, collectionName, ownerUserId), { status: "hacked" }));
      });
    }

    for (const collectionName of dailyReadOnlyCollections) {
      const documentId = collectionName === "userDailyMissionState"
        ? `${ownerUserId}_2026-07-24`
        : ownerUserId;
      await expectDeny(results, `${collectionName} client create`, async () => {
        await setDoc(doc(db, collectionName, documentId), {
          ownerUserId,
          userId: ownerUserId,
          currentStreak: 99,
          xp: 999999,
          favoriteIds: ["daily-hack"],
          updatedAt: new Date().toISOString(),
        });
      });
    }

    for (const collectionName of serverOnlyCollections) {
      await expectDeny(results, `${collectionName} create`, async () => {
        await setDoc(doc(db, collectionName, `${ownerUserId}_test_${now}`), {
          userId: ownerUserId,
          type: "rules-test",
          createdAt: new Date().toISOString(),
        });
      });
    }

    await expectDeny(results, "users owner doc delete", async () => {
      await deleteDoc(doc(db, "users", ownerUserId));
    });

    await signOut(auth);
    await createUserWithEmailAndPassword(auth, otherEmail, testCredential);

    await expectDeny(results, "other user owner profile update", async () => {
      await updateDoc(doc(db, "users", ownerUserId), {
        profile: { account: { displayName: "Wrong User" } },
      });
    });

    await signOut(auth);
    await expectDeny(results, "signed out user doc create", async () => {
      await setDoc(doc(db, "users", `${ownerUserId}_signed_out_attempt`), {
        profile: { displayName: "Signed Out" },
      });
    });
  } catch (error) {
    addResult(results, "emulator connection/setup", false, `${error?.code ?? "error"}: ${error?.message ?? error}`);
  } finally {
    printResults(results);
    await deleteApp(app);
  }
}

main().catch((error) => {
  console.error("Firestore economy rules emulator test crashed.");
  console.error(error);
  console.error("Start Auth, Firestore and Functions emulators first: npm run emulators");
  process.exit(1);
});
