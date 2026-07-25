#!/usr/bin/env node

const REQUIRED_FIREBASE_WEB_CONFIG = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

const ALLOWED_PUBLIC_KEY_NAMES = new Set([
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_APPCHECK_RECAPTCHA_ENTERPRISE_KEY",
]);

function argumentValue(name) {
  const prefix = `--${name}=`;
  const entry = process.argv.find((value) => value.startsWith(prefix));
  return entry ? entry.slice(prefix.length) : null;
}

function isPlaceholder(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return !normalized
    || normalized.startsWith("your_")
    || normalized.includes("your-project")
    || normalized.includes("your_project")
    || normalized === "placeholder"
    || normalized === "unknown";
}

function validateBoolean(name, errors) {
  const value = process.env[name];
  if (value === undefined || value === "") return;
  if (!new Set(["true", "false"]).has(value.toLowerCase())) {
    errors.push(`${name} must be true or false.`);
  }
}

function validateFirebaseShape(errors) {
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  if (authDomain && !isPlaceholder(authDomain) && !/^[a-z0-9.-]+$/i.test(authDomain)) {
    errors.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN must be a hostname without a protocol or path.");
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (projectId && !isPlaceholder(projectId) && !/^[a-z0-9][a-z0-9-]{3,62}$/i.test(projectId)) {
    errors.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID has an invalid Firebase project-id shape.");
  }

  const senderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  if (senderId && !isPlaceholder(senderId) && !/^\d{6,30}$/.test(senderId)) {
    errors.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID must contain digits only.");
  }

  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  if (appId && !isPlaceholder(appId) && !/^1:\d+:(web|ios|android):[a-z0-9]+$/i.test(appId)) {
    errors.push("NEXT_PUBLIC_FIREBASE_APP_ID has an invalid Firebase app-id shape.");
  }
}

function validatePublicSecretNames(errors) {
  for (const name of Object.keys(process.env)) {
    if (!name.startsWith("NEXT_PUBLIC_")) continue;
    if (ALLOWED_PUBLIC_KEY_NAMES.has(name)) continue;
    if (/(OPENAI|SECRET|PRIVATE|SERVICE_ACCOUNT|ADMIN_CREDENTIAL|PASSWORD|REFRESH_TOKEN|ACCESS_TOKEN|SIGNING_KEY)/i.test(name)) {
      errors.push(`${name} looks like a server credential and must not use the NEXT_PUBLIC_ prefix.`);
    }
  }
}

function main() {
  const mode = (
    argumentValue("mode")
    || process.env.WELLFIT_RUNTIME_MODE
    || process.env.NODE_ENV
    || "development"
  ).toLowerCase();
  const production = mode === "production";
  const errors = [];
  const warnings = [];

  validateBoolean("BETA1_ENFORCE_APP_CHECK", errors);
  validatePublicSecretNames(errors);
  validateFirebaseShape(errors);

  const configuredFirebaseValues = REQUIRED_FIREBASE_WEB_CONFIG.filter(
    (name) => !isPlaceholder(process.env[name]),
  );

  if (production) {
    for (const name of REQUIRED_FIREBASE_WEB_CONFIG) {
      if (isPlaceholder(process.env[name])) errors.push(`${name} is required for production runtime.`);
    }
    if (isPlaceholder(process.env.WELLFIT_RELEASE_SHA)) {
      errors.push("WELLFIT_RELEASE_SHA is required for a traceable production release.");
    }
    if (isPlaceholder(process.env.WELLFIT_RELEASE_CHANNEL)) {
      errors.push("WELLFIT_RELEASE_CHANNEL is required for a traceable production release.");
    }
  } else if (configuredFirebaseValues.length > 0 && configuredFirebaseValues.length < REQUIRED_FIREBASE_WEB_CONFIG.length) {
    warnings.push("Firebase web configuration is only partially set; authenticated product flows will remain unavailable.");
  }

  if (String(process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "").startsWith("sk-")) {
    errors.push("NEXT_PUBLIC_FIREBASE_API_KEY must be a Firebase web key, never a provider or private API key.");
  }

  console.log(`WellFit runtime environment validation: ${errors.length === 0 ? "PASS" : "FAIL"}`);
  console.log(`Mode: ${mode}`);
  console.log(`Firebase web config fields present: ${configuredFirebaseValues.length}/${REQUIRED_FIREBASE_WEB_CONFIG.length}`);
  for (const warning of warnings) console.log(`WARNING: ${warning}`);
  for (const error of errors) console.error(`ERROR: ${error}`);

  if (errors.length > 0) process.exit(1);
}

main();
