#!/usr/bin/env node

import { initializeApp, deleteApp } from "firebase/app";
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
import { connectFirestoreEmulator, doc, getFirestore, setDoc, updateDoc } from "firebase/firestore";

const FIRESTORE_HOST = process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080";
const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099";
const FUNCTIONS_BASE_URL = process.env.FUNCTIONS_EMULATOR_URL ?? "http://127.0.0.1:5001/demo-no-project/us-central1";
const PROJECT_ID = process.env.FIREBASE_EMULATOR_PROJECT_ID ?? "demo-no-project";
const now = Date.now();
const testCredential = "WellFit-Local-Test-123!";

const additionalServerOnlyCollections = [
  "trackingProofEvents",
  "missionEvidenceReviews",
  "missionPatternReviews",
  "missionCooldownReviews",
  "itemDefinitions",
  "userInventory",
  "buddyCapabilities",
  "nfcScanEvents",
  "capabilityUnlockEvents",
  "buddyItemUseEvents",
];

function parseHostPort(value) {
  const [host, portText] = value.split(":");
  return { host, port: Number.parseInt(portText, 10) };
}

function denied(error) {
  const code = error?.code ?? "";
  const message = String(error?.message ?? "").toLowerCase();
  return code === "permission-denied" || message.includes("permission") || message.includes("missing or insufficient permissions");
}

function add(results, name, passed, details) {
  results.push({ name, passed, details });
}

async function allow(results, name, action) {
  try {
    await action();
    add(results, name, true, "allowed as expected");
  } catch (error) {
    add(results, name, false, `${error?.code ?? "error"}: ${error?.message ?? error}`);
  }
}

async function deny(results, name, action) {
  try {
    await action();
    add(results, name, false, "unexpectedly allowed");
  } catch (error) {
    add(results, name, denied(error), denied(error) ? "denied as expected" : `${error?.code ?? "error"}: ${error?.message ?? error}`);
  }
}

function print(results) {
  const passed = results.length > 0 && results.every((item) => item.passed);
  console.log(`Firestore economy extended emulator test result: ${passed ? "PASS" : "FAIL"}`);
  console.log(`Assertions: ${results.length}`);
  for (const item of results) console.log(`${item.passed ? "OK" : "FAIL"}: ${item.name} (${item.details})`);
  if (!passed) process.exitCode = 1;
}

function adultBirthDate() {
  const date = new Date();
  return `${date.getUTCFullYear() - 30}-01-15`;
}

async function initializeProfile(user, email) {
  const idToken = await user.getIdToken(true);
  const response = await fetch(`${FUNCTIONS_BASE_URL}/initializeUserAccount`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      data: {
        firstName: "Extended",
        lastName: "Owner",
        displayName: "Extended Owner",
        email,
        birthDate: adultBirthDate(),
        language: "de",
        timeZone: "Europe/Berlin",
        buddy: { id: "flammi" },
        registrationSource: "extended-rules-emulator-test",
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
  if (!response.ok || json?.result?.accepted !== true) {
    throw new Error(`initializeUserAccount failed: ${JSON.stringify(json)}`);
  }
}

async function main() {
  const app = initializeApp({ apiKey: "wellfit-emulator-test-key", authDomain: `${PROJECT_ID}.local`, projectId: PROJECT_ID }, `wellfit-extended-rules-test-${now}`);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const target = parseHostPort(FIRESTORE_HOST);
  const results = [];

  connectAuthEmulator(auth, `http://${AUTH_HOST}`, { disableWarnings: true });
  connectFirestoreEmulator(db, target.host, target.port);

  try {
    const ownerEmail = `rules-extended-owner-${now}@example.test`;
    const ownerCredential = await createUserWithEmailAndPassword(auth, ownerEmail, testCredential);
    const ownerId = ownerCredential.user.uid;

    await deny(results, "users client create denied", () => setDoc(doc(db, "users", ownerId), {
      profile: { displayName: "Client Created" },
      settings: { language: "de" },
    }));

    await initializeProfile(ownerCredential.user, ownerEmail);

    await allow(results, "users safe profile update", () => updateDoc(doc(db, "users", ownerId), {
      profile: { account: { displayName: "Extended Owner Updated" } },
      updatedAt: new Date().toISOString(),
    }));
    await allow(results, "users safe settings update", () => updateDoc(doc(db, "users", ownerId), {
      settings: { language: "English" },
      updatedAt: new Date().toISOString(),
    }));

    await deny(results, "users xp update denied", () => updateDoc(doc(db, "users", ownerId), { xp: 10 }));
    await deny(results, "users level update denied", () => updateDoc(doc(db, "users", ownerId), { level: 2 }));
    await deny(results, "users avatar update denied", () => updateDoc(doc(db, "users", ownerId), { avatar: { energy: 75 } }));
    await deny(results, "users points update denied", () => updateDoc(doc(db, "users", ownerId), { points: 100 }));
    await deny(results, "users consent update denied", () => updateDoc(doc(db, "users", ownerId), { consent: { bypass: true } }));
    await deny(results, "users inventory update denied", () => updateDoc(doc(db, "users", ownerId), { inventory: { rare: true } }));
    await deny(results, "daily streak write denied", () => setDoc(doc(db, "userDailyStreaks", ownerId), { userId: ownerId, currentStreak: 1 }));
    await deny(results, "user level document write denied", () => setDoc(doc(db, "userLevels", ownerId), { userId: ownerId, level: 2, xp: 10 }));

    for (const collection of additionalServerOnlyCollections) {
      await deny(results, `${collection} create`, () => setDoc(doc(db, collection, `${ownerId}_${now}`), {
        userId: ownerId,
        ownerUserId: ownerId,
        createdAt: new Date().toISOString(),
      }));
    }

    await signOut(auth);
    await createUserWithEmailAndPassword(auth, `rules-extended-other-${now}@example.test`, testCredential);
    await deny(results, "other user profile write", () => updateDoc(doc(db, "users", ownerId), {
      profile: { account: { displayName: "Wrong Owner" } },
    }));
    await deny(results, "other user daily streak write", () => setDoc(doc(db, "userDailyStreaks", ownerId), { userId: ownerId, currentStreak: 99 }));
    await deny(results, "other user level doc write", () => setDoc(doc(db, "userLevels", ownerId), { userId: ownerId, level: 99 }));
  } catch (error) {
    add(results, "emulator setup", false, `${error?.code ?? "error"}: ${error?.message ?? error}`);
  } finally {
    print(results);
    await deleteApp(app);
  }
}

main().catch((error) => {
  console.error("Firestore economy extended emulator test crashed.");
  console.error(error);
  console.error("Start Auth, Firestore and Functions emulators first: npm run emulators");
  process.exit(1);
});
