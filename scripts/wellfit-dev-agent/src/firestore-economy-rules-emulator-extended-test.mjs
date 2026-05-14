#!/usr/bin/env node

import { initializeApp, deleteApp } from "firebase/app";
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
import { connectFirestoreEmulator, doc, getFirestore, setDoc, updateDoc } from "firebase/firestore";

const FIRESTORE_HOST = process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080";
const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099";
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
  "buddyItemUseEvents"
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
  try { await action(); add(results, name, true, "allowed as expected"); }
  catch (error) { add(results, name, false, `${error?.code ?? "error"}: ${error?.message ?? error}`); }
}

async function deny(results, name, action) {
  try { await action(); add(results, name, false, "unexpectedly allowed"); }
  catch (error) { add(results, name, denied(error), denied(error) ? "denied as expected" : `${error?.code ?? "error"}: ${error?.message ?? error}`); }
}

function print(results) {
  const passed = results.length > 0 && results.every((item) => item.passed);
  console.log(`Firestore economy extended emulator test result: ${passed ? "PASS" : "FAIL"}`);
  console.log(`Assertions: ${results.length}`);
  for (const item of results) console.log(`${item.passed ? "OK" : "FAIL"}: ${item.name} (${item.details})`);
  if (!passed) process.exitCode = 1;
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
    const ownerCredential = await createUserWithEmailAndPassword(auth, `rules-extended-owner-${now}@example.test`, testCredential);
    const ownerId = ownerCredential.user.uid;

    await setDoc(doc(db, "users", ownerId), {
      profile: { displayName: "Extended Owner" },
      settings: { language: "de" },
      consent: { beta: true },
      points: 0,
      xp: 0,
      level: 1,
      avatar: { energy: 50 },
      updatedAt: new Date().toISOString()
    });

    await allow(results, "users xp update temporary bridge", () => updateDoc(doc(db, "users", ownerId), { xp: 10 }));
    await allow(results, "users level update temporary bridge", () => updateDoc(doc(db, "users", ownerId), { level: 2 }));
    await allow(results, "users avatar energy update temporary bridge", () => updateDoc(doc(db, "users", ownerId), { avatar: { energy: 75 } }));
    await allow(results, "daily streak write temporary bridge", () => setDoc(doc(db, "userDailyStreaks", ownerId), { userId: ownerId, currentStreak: 1 }));
    await allow(results, "user level doc write temporary bridge", () => setDoc(doc(db, "userLevels", ownerId), { userId: ownerId, level: 2, xp: 10 }));

    for (const collection of additionalServerOnlyCollections) {
      await deny(results, `${collection} create`, () => setDoc(doc(db, collection, `${ownerId}_${now}`), { userId: ownerId, ownerUserId: ownerId, createdAt: new Date().toISOString() }));
    }

    await signOut(auth);
    await createUserWithEmailAndPassword(auth, `rules-extended-other-${now}@example.test`, testCredential);

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
  console.error("Run emulators first in another terminal: npm run emulators");
  process.exit(1);
});
