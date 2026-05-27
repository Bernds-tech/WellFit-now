#!/usr/bin/env node

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const admin = require("../../functions/node_modules/firebase-admin");

const uid = process.env.WELLFIT_OWNER_UID?.trim();
const role = process.env.WELLFIT_OWNER_ROLE?.trim() || "owner";

if (!uid) {
  console.error("[owner-claim] Missing WELLFIT_OWNER_UID. Aborting.");
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const redactUid = (value) => {
  if (!value) return "<missing>";
  if (value.length <= 6) return `${value[0]}***${value[value.length - 1]}`;
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
};

const safeUid = redactUid(uid);

try {
  await admin.auth().setCustomUserClaims(uid, {
    admin: true,
    agentRole: role,
  });

  console.log(
    `[owner-claim] Custom claims updated for uid ${safeUid} with admin=true and agentRole=${role}.`
  );
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`[owner-claim] Failed to set claims for uid ${safeUid}: ${message}`);
  process.exit(1);
}
