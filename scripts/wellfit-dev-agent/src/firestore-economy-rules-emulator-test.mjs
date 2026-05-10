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

async function expectAllow(results, name, action) {
  try {
    await action();
    addResult(results, name, true, "allowed as expected");
  } catch (error) {
    addResult(results, name, false, `${error?.code ?? "error"}: ${error?.message ?? error}`);
  }
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
  if (results.length === 0) console.log("FAIL: no assertions ran. The emulator is probably not running.");
  for (const result of results) {
    console.log(`${result.passed ? "OK" : "FAIL"}: ${result.name} (${result.details})`);
  }
  if (!passed) process.exitCode = 1;
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

    await expectAllow(results, "users owner doc create", async () => {
      await setDoc(doc(db, "users", ownerUserId), {
        profile: { displayName: "Rules Owner" },
        settings: { language: "de" },
        consent: { beta: true },
        inventory: {},
        points: 0,
        xp: 0,
        level: 1,
        avatar: { energy: 50 },
        updatedAt: new Date().toISOString(),
      });
    });

    await expectAllow(results, "users profile update", async () => {
      await updateDoc(doc(db, "users", ownerUserId), {
        profile: { displayName: "Rules Owner Updated" },
        updatedAt: new Date().toISOString(),
      });
    });

    await expectAllow(results, "users settings update", async () => {
      await updateDoc(doc(db, "users", ownerUserId), {
        settings: { language: "de", brightness: 100 },
        updatedAt: new Date().toISOString(),
      });
    });

    await expectAllow(results, "users points update temporary bridge", async () => {
      await updateDoc(doc(db, "users", ownerUserId), { points: 25 });
    });

    await expectAllow(results, "daily mission state write temporary bridge", async () => {
      await setDoc(doc(db, "userDailyMissionState", `${ownerUserId}_2026-05-10`), {
        userId: ownerUserId,
        missionId: "daily-test",
        state: "started",
        updatedAt: new Date().toISOString(),
      });
    });

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
    const otherCredential = await createUserWithEmailAndPassword(auth, otherEmail, testCredential);
    const otherUser = otherCredential.user;

    await expectDeny(results, "other user owner profile update", async () => {
      await updateDoc(doc(db, "users", ownerUserId), {
        profile: { displayName: "Wrong User" },
      });
    });

    await signOut(auth);
    await expectDeny(results, "signed out user doc create", async () => {
      await setDoc(doc(db, "users", `${otherUser.uid}_signed_out_attempt`), {
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
  console.error("Make sure Java is installed and Firebase emulators are running: npm run emulators");
  process.exit(1);
});
