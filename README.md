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

## Firebase and Functions checks

For Firebase Functions syntax checks, use the existing package script:

```bash
npm --prefix functions run check
```

Emulator-based tests may require local Firebase CLI setup, Java, available ports, and a single running emulator suite. If emulator checks cannot run in a given environment, report whether the limitation is environmental or code-related.

## Agent and governance checks

For documentation/register work, prefer the existing governance checks:

```bash
npm run agent:autopilot:dry-run
npm run agent:quality-gate
node scripts/wellfit-dev-agent/src/repository-inventory-check.mjs
node scripts/wellfit-dev-agent/src/cross-reference-maintenance-check.mjs
```

Auto-merge and auto-repair checks are report-only in this repository. They must not merge, repair, deploy, or approve work automatically.

## Deployment notes

Use deployment-specific environment configuration for Firebase public config and server-only keys. Do not deploy from an agent session unless the task explicitly authorizes deployment. For self-hosted/PM2 notes, preserve the existing status/TODO history and keep only one intended WellFit process running.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
