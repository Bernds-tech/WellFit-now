# WellFit protected Firebase release workflow

Updated: 2026-07-25  
Status: workflow and runbook prepared in GitHub; no Firebase deployment performed

## Scope

This package connects the already-tested repository artifacts into one manually controlled Firebase backend release path:

```text
exact merged main commit
→ repository validation
→ protected GitHub environment
→ short-lived Google Cloud authentication
→ Firestore managed export
→ database migration and seed Dry-Runs
→ Firestore indexes
→ Firestore Rules
→ Firebase Functions
→ optionally approved migrations and seeds
→ immutable release evidence artifact
```

The standalone Next.js web image is deliberately not deployed by this workflow. The matching web release remains a separate server/container step.

## GitHub environments

Create two repository environments outside the codebase:

```text
wellfit-firebase-staging
wellfit-firebase-production
```

Both environments should allow only `main`. Production should require at least one reviewer and should prevent self-review where the GitHub plan supports it.

Configure these non-secret environment variables:

```text
FIREBASE_PROJECT_ID
FIREBASE_BACKUP_BUCKET
GCP_WORKLOAD_IDENTITY_PROVIDER
GCP_SERVICE_ACCOUNT
```

Use `infra/firebase/environment-contract.example.json` as the exact naming contract.

No Firebase CI token or service-account JSON key is required by the workflow. Authentication is designed for Google Cloud Workload Identity Federation through a tightly scoped service account. The Workload Identity provider must restrict admission to `Bernds-tech/WellFit-now`, and the service account must have only the roles needed for the selected Firebase resources and Firestore export bucket.

## Manual inputs

The workflow is `workflow_dispatch` only. It has no `push`, `pull_request` or schedule trigger.

Required inputs:

```text
target                 staging | production
release_sha             full 40-character commit SHA already contained in main
confirm_project         exact Firebase project ID
deployment_confirmation DEPLOY-STAGING | DEPLOY-PRODUCTION
change_ticket           owner-approved release/change reference
```

Safety inputs default to false:

```text
apply_release
execute_database
allow_destructive_migrations
```

With `apply_release=false`, only the planning job runs and no cloud authentication, backup, deployment or database write is attempted.

## Ordered release

For an approved apply run, the workflow:

1. checks out the exact requested SHA with full history;
2. proves that the commit is part of `origin/main`;
3. validates runtime, database manifests, checksums, Functions syntax and the production application build;
4. authenticates through the protected environment;
5. proves that the confirmed project, authenticated gcloud project and environment project are identical;
6. verifies the pre-existing backup bucket;
7. creates a managed Firestore export under a target/SHA/timestamp path;
8. creates read-only migration and seed plans against the target database;
9. deploys indexes, then Rules, then Functions;
10. runs database writes only when `execute_database=true`;
11. permits destructive migrations only when the separate destructive approval input is true;
12. uploads plan, backup URI, migration plans, deployment logs and release evidence as a GitHub artifact.

The workflow never imports a backup and never runs recursive Firestore deletion. Recovery remains a separate incident procedure with owner approval.

## Why the backup is mandatory

The release job will not reach Firebase deployment until the managed Firestore export command succeeds. The backup location is recorded in the final evidence artifact. This gives a concrete recovery source without pretending that Rules, indexes, Functions and data migrations all have identical rollback semantics.

## Database execution

The database operator retains its own independent gates even inside the protected workflow:

```text
WELLFIT_DATABASE_EXECUTION_APPROVED=true
WELLFIT_DATABASE_TARGET_PROJECT=<exact project>
WELLFIT_DATABASE_OPERATOR=<GitHub actor>
WELLFIT_DATABASE_CHANGE_TICKET=<input change ticket>
WELLFIT_RELEASE_SHA=<exact SHA>
--confirm-project=<exact project>
```

Destructive migrations additionally require:

```text
WELLFIT_DATABASE_ALLOW_DESTRUCTIVE=true
--allow-destructive
```

A release can deploy Firebase code while leaving `execute_database=false`. That is the safer default until the generated Dry-Run plans have been reviewed.

## Setup boundary

Repository code can define and validate the workflow, but these infrastructure facts must later be supplied by the owner or cloud administrator:

- the staging and production Firebase project IDs;
- the Cloud Storage backup buckets;
- Workload Identity pool/provider resources;
- the release service accounts and least-privilege IAM roles;
- GitHub environment reviewers and branch restrictions.

None of those values or credentials are currently present in the repository, and no real release has been attempted.
