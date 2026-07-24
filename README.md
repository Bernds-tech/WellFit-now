# WellFit Now

WellFit is an existing Next.js/Firebase product baseline for the Move-Learn-Social-Earn platform. Work in this repository must extend the current app and its server-authoritative mission, internal-economy, Buddy and location modules in small scoped steps. Do not create duplicate app shells, route maps, environment systems, reward systems or agent-governance systems.

## Current operating mode

WellFit is currently developed exclusively through GitHub branches and pull requests. There is no active WellFit server or SSH deployment target in use. GitHub Actions build the application and run emulator checks, but they must not deploy unrelated products or external services.

Read these current references before changing product code or planning:

1. `AGENTS.md`
2. `docs/status/WELLFIT_RUNTIME_STATE_2026-07-24.md`
3. `project-register/wellfit-beta1-canonical-truth.json`
4. `docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md`
5. `todolist/CODEX_CONTEXT_WELLFIT_BETA1.md`
6. the relevant historical TODO/work-map files for context

The runtime-state document records the actual merged implementation. The protected Canonical Truth controls Beta-1 product/economy boundaries. Historical May 2026 status documents remain useful background but do not override newer tested code.

See also `docs/operations/GITHUB_ONLY_DEVELOPMENT_STATUS.md`.

## Current product baseline

The repository currently includes:

- Firebase Authentication and Firestore integration;
- public, dashboard, mission, Buddy, shop, analytics, admin and Mobile Web routes;
- server-authoritative mission attempts, evidence review, completion and internal ledger writes;
- internal non-monetary WFXP wallet/ledger, shop spend and inventory grants;
- server-authoritative Buddy care and state actions;
- guardian, child-profile, permission and parental-consent foundations;
- worldwide user-local calendar periods and server-published nearby mission locations;
- Adventure, Challenge and Reality Glitch proximity authority;
- Firestore client-write restrictions and Auth/Firestore/Functions emulator coverage;
- optional App Check client preparation without production enforcement.

Important terminology warning: runtime modules currently use `WFXP`, while the owner-controlled Beta-1 Canonical Truth defines spendable `WFP` and separate non-spendable avatar `XP`. Do not silently equate or rename these concepts. A dedicated migration decision is required.

## Safe development boundaries

Documentation/setup changes must not touch runtime product code unless a task explicitly says so. In particular, do not change `app/**`, `components/**`, `lib/**`, `functions/**`, `firestore.rules`, `public/**`, `package.json`, `package-lock.json` or `native/unity/WellFitBuddyAR/**` for a docs-only setup task.

Never commit secrets. Keep real Firebase project values, server API keys, local machine paths, `.env.local`, generated build output and deployment-only credentials out of the repository.

Unity/PR #13 remains owner-protected. Do not merge, close, overwrite or depend on it without explicit owner instruction.

## Local setup

Use the existing package scripts and install dependencies only when they are missing or clearly out of sync.

```bash
# 1. Install dependencies only if node_modules is missing or stale.
npm install

# 2. Create a local environment file from the committed template.
cp .env.example .env.local

# 3. Fill .env.local with local or deployment-specific values.
#    Do not commit .env.local.

# 4. Validate the app before handing off work.
npm run lint
npx tsc --noEmit
npm run build
npm --prefix functions run check

# 5. Start the local development server when you need to preview the app.
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) after `npm run dev` starts.

This project uses network-free system font stacks in `app/globals.css` so CI and Codex builds do not need remote Google Fonts access.

## Environment variables

`.env.example` is the committed template. Copy it to `.env.local` for local development and fill in real values only in `.env.local` or in the deployment provider's environment-variable UI.

### Firebase public web config

The `NEXT_PUBLIC_FIREBASE_*` variables are Firebase web-app configuration values that are safe to expose to the browser in the normal Firebase client model, but they are environment-specific and must not be replaced with real project values in committed documentation.

Required for real Auth or Firestore usage:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

CI builds can prerender public pages without real Firebase configuration. Actual Firebase Auth, Firestore and callable use requires the complete Firebase web config in `.env.local` or the deployment environment.

### Optional App Check

The web client can initialize Firebase App Check with reCAPTCHA Enterprise when a deployment later provides the documented site-key environment value. App Check enforcement remains disabled by default and must not be enabled in production without an explicit rollout decision, metrics and rollback readiness. See `docs/security/FIREBASE_APP_CHECK_ROLLOUT.md`.

### Server-only provider keys

Optional Buddy KI provider settings are server-side only unless a variable is explicitly documented with `NEXT_PUBLIC_`.

- `BUDDY_KI_MODEL_PROVIDER_ENABLED`
- `BUDDY_KI_PROVIDER`
- `OPENAI_API_KEY`

Server-only provider keys, including `OPENAI_API_KEY`, must never use the `NEXT_PUBLIC_` prefix and must never be committed with real values.

## Firebase, Functions and emulator checks

WellFit separates root application checks from Firebase Functions and emulator checks:

- `npm run lint`, `npx tsc --noEmit` and `npm run build` validate the Next.js application and shared TypeScript surface.
- `npm --prefix functions run check` validates Functions syntax and startup/unit contracts without production writes.
- the GitHub `Beta 1 Emulator Tests` workflow starts Auth, Firestore and Functions emulators and runs the focused Beta-1 rules/callable suites.
- `npm run agent:quality-gate` and the repository inventory checks validate repository/governance boundaries.

A syntax check is not an emulator proof, and an emulator proof is not a production deployment, legal approval, penetration test, real-device test or real-user validation.

### Emulator prerequisites

Emulator-based checks require:

- Firebase CLI on `PATH`;
- Java compatible with the installed `firebase-tools` version;
- free local ports, especially UI `4000`, Firestore `8080`, Auth `9099` and Functions `5001`;
- a local/demo project context;
- development-only environment configuration.

Never point agent-driven tests at production data. If emulator checks cannot run, report whether the limitation is environmental or code-related; do not compensate by weakening Firestore rules or protected server logic.

### Authority boundaries

Current callable Functions can authorize internal, non-monetary Beta flows such as reviewed mission completion, WFXP ledger writes, internal shop spend, inventory grants, Buddy actions and nearby-location decisions. Those paths remain:

- server-only for protected writes;
- non-blockchain;
- non-cashout;
- non-token;
- non-real-money;
- subject to Firestore rules and emulator evidence.

Legacy `/api/economy/*` preview/status routes must not be confused with the Firebase callable authority paths. Remaining direct client compatibility writes in `users/{uid}` are explicitly temporary and must be removed after all consumers migrate.

Production deployment, Firestore Rules publication, real Firebase project writes, App Check enforcement, public token/WFT activation, payment, payout, NFT trading, PvP stakes and protected-data expansion require separate explicit decisions.

## Agent and governance checks

For broader repository or documentation work, use the existing checks:

```bash
npm run agent:autopilot:dry-run
npm run agent:quality-gate
node scripts/wellfit-dev-agent/src/repository-inventory-check.mjs
node scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs
```

The repository CI also blocks FanMind or unrelated-product workflow references.

## Current execution order

1. registration, consent and server-side user initialization;
2. remaining legacy `users` economy/Buddy writer migration;
3. Firestore compatibility-write removal;
4. email verification, session/route hardening and operational admin claims;
5. consent withdrawal, data export and account deletion/anonymization;
6. privacy-safe pilot telemetry;
7. non-crypto partner rewards and redemption;
8. real-device Mobile/PWA/Pose evidence;
9. small adult Closed Beta;
10. native AR, Edge AI, wider partner tooling and later roadmap layers.

## Future deployment notes

No active WellFit server, PM2 process, Firebase production deployment or SSH target is currently configured or used by this project. Historical self-hosting and PM2 notes are planning references only.

Any future hosting setup, server provisioning, Firebase deployment, Firestore Rules publication, production data migration or secret configuration requires a separate explicit owner decision and a scoped pull request.

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
