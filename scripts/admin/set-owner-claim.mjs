#!/usr/bin/env node

import { createRequire } from 'node:module';

const requireFromFunctions = createRequire(new URL('../../functions/package.json', import.meta.url));

let initializeApp;
let getApps;
let auth;

try {
  ({ initializeApp, getApps } = requireFromFunctions('firebase-admin/app'));
  ({ auth } = requireFromFunctions('firebase-admin/auth'));
} catch {
  console.error('Fehler: firebase-admin ist nicht verfügbar.');
  console.error('Bitte lokal installieren, z. B. mit: npm --prefix functions install firebase-admin');
  process.exit(1);
}

const ownerUid = process.env.WELLFIT_OWNER_UID?.trim();
const ownerRole = process.env.WELLFIT_OWNER_ROLE?.trim() || 'owner';

if (!ownerUid) {
  console.error('Fehler: WELLFIT_OWNER_UID fehlt. Abbruch.');
  process.exit(1);
}

if (!getApps().length) {
  initializeApp();
}

const customClaims = {
  admin: true,
  agentRole: ownerRole,
};

(async () => {
  await auth().setCustomUserClaims(ownerUid, customClaims);

  console.log('Owner-Claim-Setup abgeschlossen.');
  console.log('UID vorhanden: ja');
  console.log(`Claims gesetzt: admin=true, agentRole=${ownerRole}`);
  console.log('Hinweis: Bitte neu anmelden, damit das ID-Token aktualisiert wird.');
})().catch((error) => {
  console.error('Fehler beim Setzen der Custom Claims.');
  console.error(`Ursache: ${error?.message ?? 'Unbekannter Fehler'}`);
  process.exit(1);
});
