#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function argumentValue(name, fallback = null) {
  const prefix = `--${name}=`;
  const entry = process.argv.find((value) => value.startsWith(prefix));
  return entry ? entry.slice(prefix.length) : fallback;
}

function sha256File(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) return null;
  return crypto.createHash("sha256").update(fs.readFileSync(absolutePath)).digest("hex");
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function main() {
  const packageJson = readJson("package.json");
  const releaseSha = argumentValue("sha", process.env.WELLFIT_RELEASE_SHA || process.env.GITHUB_SHA || "local");
  const channel = argumentValue("channel", process.env.WELLFIT_RELEASE_CHANNEL || "manual");
  const imageTag = argumentValue("image-tag", process.env.WELLFIT_IMAGE_TAG || `wellfit-web:${releaseSha.slice(0, 12)}`);
  const outputPath = argumentValue("output", "release/wellfit-release-manifest.json");
  const absoluteOutput = path.resolve(ROOT, outputPath);

  const manifest = {
    schemaVersion: 2,
    project: "WellFit-now",
    application: {
      name: packageJson.name,
      version: packageJson.version,
      runtime: "nextjs-standalone",
      nodeMajor: 20,
      imageTag,
    },
    source: {
      repository: process.env.GITHUB_REPOSITORY || "Bernds-tech/WellFit-now",
      releaseSha,
      channel,
      generatedAt: new Date().toISOString(),
    },
    integrity: {
      packageLockSha256: sha256File("package-lock.json"),
      dockerfileSha256: sha256File("Dockerfile"),
      firebaseConfigSha256: sha256File("firebase.json"),
      firestoreRulesSha256: sha256File("firestore.rules"),
      firestoreIndexesSha256: sha256File("firestore.indexes.json"),
      functionsPackageLockSha256: sha256File("functions/package-lock.json"),
      databaseMigrationsManifestSha256: sha256File("database/manifests/migrations.json"),
      databaseSeedsManifestSha256: sha256File("database/manifests/seeds.json"),
      databaseOperatorSha256: sha256File("functions/scripts/database/runDatabaseOperation.js"),
    },
    firebaseArtifacts: [
      "firebase.json",
      "firestore.rules",
      "firestore.indexes.json",
      "functions/",
    ],
    databaseArtifacts: [
      "database/manifests/migrations.json",
      "database/manifests/seeds.json",
      "database/migrations/",
      "database/seeds/",
      "functions/scripts/database/runDatabaseOperation.js",
    ],
    deployment: {
      webDeployed: false,
      firebaseFunctionsDeployed: false,
      firestoreRulesDeployed: false,
      firestoreIndexesDeployed: false,
      databaseMigrationPerformed: false,
      databaseSeedPerformed: false,
      productionDataWritten: false,
    },
    security: {
      secretsEmbeddedInManifest: false,
      serviceAccountEmbedded: false,
      serverProviderKeysEmbedded: false,
      productionApprovalRequired: true,
      destructiveDatabaseApprovalRequired: true,
    },
  };

  fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true });
  fs.writeFileSync(absoluteOutput, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`WellFit release manifest written: ${path.relative(ROOT, absoluteOutput)}`);
}

main();
