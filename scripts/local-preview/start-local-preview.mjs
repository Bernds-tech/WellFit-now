#!/usr/bin/env node

import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { spawn, spawnSync } from "node:child_process";

const ROOT = process.cwd();
const PROJECT_ID = "demo-wellfit-local";
const HOST = "127.0.0.1";
const PORTS = Object.freeze({
  web: 3000,
  emulatorUi: 4000,
  functions: 5001,
  firestore: 8080,
  auth: 9099,
});

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const childProcesses = new Set();
let shuttingDown = false;

function fail(message) {
  console.error(`\nWellFit lokale Vorschau konnte nicht gestartet werden:\n${message}\n`);
  process.exit(1);
}

function assertPrerequisites() {
  const majorNodeVersion = Number(process.versions.node.split(".")[0]);
  if (!Number.isInteger(majorNodeVersion) || majorNodeVersion < 20) {
    fail(`Node.js 20 oder neuer ist erforderlich. Gefunden: ${process.versions.node}`);
  }

  if (!fs.existsSync(path.join(ROOT, "node_modules"))) {
    fail("Root-Abhängigkeiten fehlen. Führe zuerst `npm run preview:local:setup` aus.");
  }
  if (!fs.existsSync(path.join(ROOT, "functions", "node_modules"))) {
    fail("Functions-Abhängigkeiten fehlen. Führe zuerst `npm run preview:local:setup` aus.");
  }

  const java = spawnSync("java", ["-version"], { encoding: "utf8" });
  if (java.error || java.status !== 0) {
    fail("Java 21 oder eine kompatible Java-Version ist für die Firebase-Emulatoren erforderlich.");
  }
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once("error", () => resolve(false));
    server.listen({ host: HOST, port }, () => {
      server.close(() => resolve(true));
    });
  });
}

async function assertPortsAvailable() {
  const unavailable = [];
  for (const [name, port] of Object.entries(PORTS)) {
    if (!(await isPortAvailable(port))) unavailable.push(`${name}: ${port}`);
  }
  if (unavailable.length > 0) {
    fail(`Diese lokalen Ports sind bereits belegt: ${unavailable.join(", ")}. Beende die dort laufenden Programme und starte erneut.`);
  }
}

function spawnManaged(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: ROOT,
    stdio: "inherit",
    ...options,
  });
  childProcesses.add(child);
  child.once("exit", () => childProcesses.delete(child));
  return child;
}

function waitForPort(port, child, timeoutMs = 120000) {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      if (child.exitCode !== null) {
        reject(new Error(`Firebase-Emulatorprozess wurde vorzeitig mit Code ${child.exitCode} beendet.`));
        return;
      }
      const socket = net.createConnection({ host: HOST, port });
      socket.setTimeout(1000);
      socket.once("connect", () => {
        socket.destroy();
        resolve();
      });
      const retry = () => {
        socket.destroy();
        if (Date.now() - startedAt >= timeoutMs) {
          reject(new Error(`Port ${port} wurde nicht innerhalb von ${Math.round(timeoutMs / 1000)} Sekunden erreichbar.`));
          return;
        }
        setTimeout(attempt, 500);
      };
      socket.once("error", retry);
      socket.once("timeout", retry);
    };
    attempt();
  });
}

function localFrontendEnvironment() {
  return {
    ...process.env,
    WELLFIT_RUNTIME_MODE: "development",
    WELLFIT_RELEASE_SHA: "local-emulator-preview",
    WELLFIT_RELEASE_CHANNEL: "local-emulator",
    NEXT_PUBLIC_FIREBASE_API_KEY: "demo-api-key",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: `${PROJECT_ID}.firebaseapp.com`,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: `${PROJECT_ID}.appspot.com`,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "000000000000",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:000000000000:web:wellfitlocalpreview",
    NEXT_PUBLIC_FIREBASE_APPCHECK_RECAPTCHA_ENTERPRISE_KEY: "",
    NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "true",
    NEXT_PUBLIC_FIREBASE_EMULATOR_HOST: HOST,
    NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT: String(PORTS.auth),
    NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT: String(PORTS.firestore),
    NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT: String(PORTS.functions),
    BETA1_ENFORCE_APP_CHECK: "false",
    BUDDY_KI_MODEL_PROVIDER_ENABLED: "false",
    BUDDY_KI_PROVIDER: "rules",
  };
}

function terminateProcessTree(child) {
  if (!child || child.exitCode !== null || child.killed) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }
  child.kill("SIGTERM");
}

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log("\nWellFit lokale Vorschau wird beendet...");
  [...childProcesses].reverse().forEach(terminateProcessTree);
  setTimeout(() => process.exit(exitCode), 250).unref();
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
process.on("uncaughtException", (error) => {
  console.error(error);
  shutdown(1);
});
process.on("unhandledRejection", (error) => {
  console.error(error);
  shutdown(1);
});

async function main() {
  assertPrerequisites();
  await assertPortsAvailable();

  console.log("\nStarte lokale WellFit Firebase-Emulatoren ohne Produktionszugriff...");
  const emulatorProcess = spawnManaged(
    npmCommand,
    [
      "exec",
      "--",
      "firebase",
      "emulators:start",
      "--project",
      PROJECT_ID,
      "--only",
      "auth,firestore,functions",
    ],
    {
      env: {
        ...process.env,
        GCLOUD_PROJECT: PROJECT_ID,
        BETA1_ENFORCE_APP_CHECK: "false",
        BUDDY_KI_MODEL_PROVIDER_ENABLED: "false",
        BUDDY_KI_PROVIDER: "rules",
      },
    },
  );

  await Promise.all([
    waitForPort(PORTS.auth, emulatorProcess),
    waitForPort(PORTS.firestore, emulatorProcess),
    waitForPort(PORTS.functions, emulatorProcess),
    waitForPort(PORTS.emulatorUi, emulatorProcess),
  ]);

  console.log("\nFirebase-Emulatoren sind bereit. Starte die Next.js-Vorschau...");
  const webProcess = spawnManaged(
    npmCommand,
    ["run", "dev"],
    { env: localFrontendEnvironment() },
  );

  await waitForPort(PORTS.web, webProcess, 90000);

  console.log(`\nWellFit ist lokal erreichbar:`);
  console.log(`- App:             http://localhost:${PORTS.web}`);
  console.log(`- Registrierung:   http://localhost:${PORTS.web}/registrieren`);
  console.log(`- Emulator-UI:     http://localhost:${PORTS.emulatorUi}`);
  console.log("\nDie Umgebung verwendet ausschließlich lokale Demo-Emulatoren.");
  console.log("Es wird kein Firebase-Produktionsprojekt und kein externer WellFit-Server kontaktiert.");
  console.log("Zum Beenden in diesem Terminal Strg+C drücken.\n");

  webProcess.once("exit", (code) => shutdown(code ?? 0));
  emulatorProcess.once("exit", (code) => shutdown(code ?? 0));
}

main().catch((error) => {
  console.error(error);
  shutdown(1);
});
