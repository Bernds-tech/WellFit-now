# WellFit Now

WellFit is an existing Next.js product baseline for the Move-Learn-Social-Earn platform. Work in this repository should extend the current app, registers, TODO files, and architecture notes in small scoped steps. Do not create duplicate app shells, route maps, environment systems, reward systems, or agent-governance systems.

## Safe development boundaries

Before changing files, read `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, and `todolist/TODO_INDEX.md`. For setup and environment work, also read `todolist/J8.4D - LOCAL ENV UND BUILD SETUP ADDENDUM.md`.

Documentation/setup changes must not touch runtime product code unless a task explicitly says so. In particular, do not change `app/**`, `components/**`, `lib/**`, `functions/**`, `firestore.rules`, `public/**`, `package.json`, `package-lock.json`, or `native/unity/WellFitBuddyAR/**` for a docs-only setup task.

Never commit secrets. Keep real Firebase project values, server API keys, local machine paths, `.env.local`, generated build output, and deployment-only credentials out of the repository.

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

# 5. Start the local development server when you need to preview the app.
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) after `npm run dev` starts.

This project uses network-free system font stacks in `app/globals.css` so CI and Codex builds do not need remote Google Fonts access.

## Environment variables

`.env.example` is the committed template. Copy it to `.env.local` for local development and fill in real values only in `.env.local` or in the deployment provider's environment-variable UI.

### Firebase public web config

The `NEXT_PUBLIC_FIREBASE_*` variables are Firebase web-app configuration values that are safe to expose to the browser in the normal Firebase client model, but they are still environment-specific and should not be replaced with real project values in committed docs.

Required for real Auth or Firestore usage:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

CI/Codex builds can prerender public pages without real Firebase secrets. If these variables are absent, the current Firebase initialization path stays uninitialized during import so `npm run build` can complete for public prerendering. Actual Firebase Auth or Firestore usage still requires all configured Firebase variables in `.env.local` or the deployment environment.

### Server-only provider keys

Optional Buddy KI provider settings are server-side only unless a variable is explicitly documented with `NEXT_PUBLIC_`.

- `BUDDY_KI_MODEL_PROVIDER_ENABLED`
- `BUDDY_KI_PROVIDER`
- `OPENAI_API_KEY`

Server-only provider keys, including `OPENAI_API_KEY`, must never use the `NEXT_PUBLIC_` prefix and must never be committed with real values. Keep production provider keys in server/deployment environment configuration only.

## Firebase, Functions, and emulator checks

WellFit currently separates root app checks from Firebase Functions checks:

- Root app checks (`npm run lint`, `npx tsc --noEmit`, `npm run build`) validate the Next.js app and shared TypeScript surface from the repository root.
- Functions checks run from the Functions package context and validate Firebase Functions JavaScript syntax without starting emulators or writing production data. Use the existing script from the repository root:

```bash
npm --prefix functions run check
```

The Functions syntax check is not a Firebase deployment and does not replace emulator tests. It should be used before any Firebase/Functions PR handoff because it catches syntax errors in `functions/index.js`, helper modules, seed scripts, and emulator test scripts without changing Firestore rules or backend runtime behavior.

### Firebase project and environment expectations

For local development, keep Firebase project identifiers and web-app configuration in `.env.local` or the deployment provider environment. Do not commit real project values, service-account keys, Firebase tokens, or production credentials. Public Firebase web config may use the `NEXT_PUBLIC_FIREBASE_*` names described above, but server credentials and provider keys must remain server-only.

Documentation-only agent tasks must not run production writes, activate final ledger behavior, or turn on mission-completion authority. Any change to `firestore.rules`, `functions/**`, Firebase deployment settings, reward authorization, mission completion, or ledger persistence requires a separate explicit human-approved task and review plan.

### Emulator prerequisites

Emulator-based checks require more than `npm --prefix functions run check`:

- Firebase CLI installed and available on `PATH`.
- Java installed for Firebase emulators. Note: newer `firebase-tools` releases may require Java 21; if local tools reject an older JRE, treat that as an environment prerequisite, not an app-code failure.
- Required local ports free before startup, especially emulator UI `4000`, Firestore `8080`, Auth `9099`, and Functions `5001`. Run only one emulator suite at a time.
- Firebase login or local project context when a selected emulator command requires it; demo-project emulator flows may not require a production login, but deployment commands always require explicit human approval.
- Local environment files configured for development only; never point agent-driven tests at production data.

Root emulator startup scripts live in the root package (`npm run emulators`, `npm run emulators:rules`, `npm run emulators:firestore`). Functions emulator tests run from `functions/` and require the matching emulator services to already be running. In particular, `npm --prefix functions run test:emulator` and the callable/mission/evidence/pattern/cooldown emulator tests require running Auth, Firestore, and Functions emulator services; NFC and rules smoke tests require the Firestore emulator at `127.0.0.1:8080`.

If emulator checks cannot run in a given environment, report whether the limitation is environmental or code-related. Do not compensate by loosening Firestore rules, modifying Functions code, changing deployment scripts, or writing to production.

## Agent and governance checks

For documentation/register work, prefer the existing governance checks:

```bash
npm run agent:autopilot:dry-run
npm run agent:quality-gate
node scripts/wellfit-dev-agent/src/repository-inventory-check.mjs
node scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs
```

Auto-merge and auto-repair checks are report-only in this repository. They must not merge, repair, deploy, or approve work automatically.

## Deployment and PM2 notes

Use deployment-specific environment configuration for Firebase public config and server-only keys. Do not deploy from an agent session unless the task explicitly authorizes deployment. Documentation, lint, build, Functions syntax, quality-gate, and report-only agent checks are not deployment approval.

For self-hosted/PM2 operation, preserve the existing status/TODO history, keep only one intended WellFit process running, and verify process status before restarting. PM2 restarts, server environment changes, Firebase deploys, Firestore rules publishes, and production data migrations require explicit human approval and must not be bundled into documentation-only product-foundation tasks.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
