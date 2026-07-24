# WellFit Reproducible Runtime Package

Updated: 2026-07-24
Status: GitHub-only preparation; no production deployment performed

## Objective

This package turns the existing Next.js application into a portable, traceable server artifact without creating a second WellFit architecture.

The repository remains the canonical source for:

- the Next.js web application;
- Firebase Functions;
- Firestore Rules and indexes;
- runtime validation;
- container configuration;
- release manifests and integrity checks;
- future database migrations and seed catalogs.

No server address, Firebase Admin credential, provider API key or production user data belongs in GitHub.

## Build boundaries

`NEXT_PUBLIC_FIREBASE_*` values are Firebase browser configuration. Next.js embeds them during the web image build. They are therefore supplied as Docker build arguments.

Server-only values such as these must never be Docker build arguments:

- `OPENAI_API_KEY`;
- Firebase service-account JSON;
- Firebase CI/deploy tokens;
- private signing keys;
- database passwords;
- production administrator credentials.

Firebase Functions receive their own server environment during a later, separately approved Firebase deployment.

## Local validation

```bash
npm ci
npm run runtime:validate
npm run runtime:package-check
npm run build
```

A production environment can be checked without printing values:

```bash
WELLFIT_RUNTIME_MODE=production \
WELLFIT_RELEASE_SHA=<git-commit-sha> \
WELLFIT_RELEASE_CHANNEL=production \
NEXT_PUBLIC_FIREBASE_API_KEY=<firebase-web-key> \
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com \
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id> \
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<project>.appspot.com \
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<numeric-id> \
NEXT_PUBLIC_FIREBASE_APP_ID=<firebase-web-app-id> \
npm run runtime:validate:production
```

## Build the standalone image

```bash
docker build \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY="$NEXT_PUBLIC_FIREBASE_API_KEY" \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID="$NEXT_PUBLIC_FIREBASE_PROJECT_ID" \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID="$NEXT_PUBLIC_FIREBASE_APP_ID" \
  --build-arg NEXT_PUBLIC_FIREBASE_APPCHECK_RECAPTCHA_ENTERPRISE_KEY="$NEXT_PUBLIC_FIREBASE_APPCHECK_RECAPTCHA_ENTERPRISE_KEY" \
  --tag "wellfit-web:$WELLFIT_RELEASE_SHA" \
  .
```

The image runs as the unprivileged `nextjs` user and contains only the Next.js standalone server, static assets and public files required at runtime.

## Start the image directly

```bash
docker run --detach \
  --name wellfit-web \
  --publish 127.0.0.1:3000:3000 \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=64m \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  --env WELLFIT_RUNTIME_MODE=production \
  --env WELLFIT_RELEASE_SHA="$WELLFIT_RELEASE_SHA" \
  --env WELLFIT_RELEASE_CHANNEL=production \
  "wellfit-web:$WELLFIT_RELEASE_SHA"
```

Verify the non-secret health endpoint:

```bash
curl --fail http://127.0.0.1:3000/api/health
```

The endpoint proves only that the web runtime is responsive and reports whether the public Firebase client configuration is present. It does not deploy, migrate or write data.

## Start with Docker Compose

Create an ignored local environment file from `.env.example`, then run:

```bash
docker compose \
  --env-file .env.production \
  --file infra/runtime/compose.standalone.yml \
  up --detach --build
```

The compose definition binds to `127.0.0.1` by default. A reverse proxy can expose HTTPS later. Set `WELLFIT_BIND_ADDRESS=0.0.0.0` only when the host firewall and TLS proxy are configured.

## Create a portable GitHub release candidate

The `Container Build` GitHub Actions workflow always builds and health-checks the image on pull requests and `main` without pushing or deploying it.

A repository owner can later start the workflow manually with:

```text
create_release_artifact = true
release_channel = staging-candidate or production-candidate
```

The workflow then creates a temporary GitHub Actions artifact containing:

```text
wellfit-web-<commit-sha>.tar.gz
wellfit-release-manifest.json
SHA256SUMS
```

The artifact expires after 14 days and is not a deployment.

## Load a portable image on a future server

After downloading and verifying the release artifact:

```bash
sha256sum --check SHA256SUMS
gunzip --stdout wellfit-web-<commit-sha>.tar.gz | docker load
docker image inspect "wellfit-web:<commit-sha>"
```

Then start the image using the direct Docker or Compose procedure above.

## Firebase deployment boundary

The web container does not contain Firebase Admin credentials and does not deploy Firebase.

A later protected Firebase release must use the same Git commit and explicitly publish:

```text
functions/
firestore.rules
firestore.indexes.json
```

The future order is:

1. validate staging configuration;
2. back up relevant Firestore data;
3. deploy Firestore indexes;
4. deploy Firestore Rules;
5. deploy Firebase Functions;
6. run database migrations in Dry-Run mode;
7. approve and run versioned migrations;
8. start the matching web image;
9. verify health, authentication and closed-beta smoke tests;
10. record the deployed commit and migration versions.

Production deployment remains a separate human-approved action. No workflow in this package performs it.

## Rollback principle

A web rollback loads and starts the previously verified image archive. Firebase Functions, Rules and migrations require their own version-aware rollback or forward-fix plan. Never roll back Firestore data by copying an unverified production backup over the live database.

## Current limitation

The repository does not yet contain the versioned Firestore migration and seed registry. That is the next infrastructure workstream after this runtime package.
