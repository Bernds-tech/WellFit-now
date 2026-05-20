# Beta-1 Emulator Verification

Status: **GitHub Actions emulator startup verified / Beta-1 rules test fix pending rerun**
Last checked: **2026-05-18 14:10 UTC**
Checked workflow: `.github/workflows/beta1-emulator-tests.yml` / **Beta 1 Emulator Tests**
Checked run: **PR #178 log summary provided by owner; direct GitHub run metadata still unavailable in this container**

## Current result

The Beta-1 emulator status is **not green yet**. GitHub Actions for PR #178 downloaded and started the Firestore and Functions emulators, so the earlier Firestore Emulator JAR `403 Forbidden` blocker is no longer the current GitHub Actions failure. The failing `beta1:rules` case was the test's accidental expectation that `glitchSafetyRules/rule_beta1` should be readable, even though the rules intentionally keep `glitchSafetyRules` client-unreadable and client-unwritable.

Do **not** report the Beta-1 emulator suites as passing until a real workflow run or a prepared local emulator run proves that both focused suites ran against local Firebase emulators.

## What was checked

| Check | Result | Notes |
|---|---:|---|
| Workflow file exists in this checkout | **Yes** | `.github/workflows/beta1-emulator-tests.yml` is present after the PR #175 mergeability-only sync. |
| PR #175 workflow availability in this checkout | **Available locally after sync** | The sync restored the intended single workflow path: `.github/workflows/beta1-emulator-tests.yml`. |
| GitHub remote configured locally | **No** | `git remote -v` returned no configured remotes. |
| GitHub CLI available locally | **No** | `gh` is not installed in this container. |
| Direct GitHub fetch/API access from shell | **Blocked** | `git ls-remote https://github.com/Bernds-tech/WellFit-now.git ...` failed with `CONNECT tunnel failed, response 403`; a Python GitHub API request failed with `Tunnel connection failed: 403 Forbidden`. |
| Real GitHub Actions run for **Beta 1 Emulator Tests** | **Failed before this fix** | PR #178 logs showed Firestore and Functions emulators started, then `beta1:rules` failed with `permission-denied`: `false for 'get' @ L345, false for 'get' @ L358`. |

## Workflow run details

No concrete run ID, run URL, commit SHA, conclusion, or log artifact could be fetched from this environment. The owner-provided PR #178 log summary confirms that GitHub Actions executed the intended emulator command, downloaded/started the Firestore Emulator, started the Functions Emulator, and then failed in `beta1:rules` with `permission-denied` on the intentional `glitchSafetyRules` deny rule.

## Focused tests

| Test command | Actually ran in a verified workflow? | Result |
|---|---:|---|
| `npm --prefix functions run beta1:rules` | **Failed in PR #178 before this fix** | Firestore Emulator started; the rules test tried to read `glitchSafetyRules/rule_beta1` through the generic owner-readable loop, but `firestore.rules` line 345 intentionally denies all client reads/writes for `glitchSafetyRules`. |
| `npm --prefix functions run beta1:callable` | **No verified workflow evidence** | Not proven green. Existing local history says callable/emulator execution remained environment-blocked after emulator startup/download failures. |

The scripts still point only at local emulator endpoints:

- `beta1:rules`: `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node test/beta1FirestoreRulesEmulatorTest.js`
- `beta1:callable`: `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 FUNCTIONS_EMULATOR_URL=http://127.0.0.1:5001/demo-no-project/us-central1 node test/beta1CallableFunctionsEmulatorTest.js`

## Firestore Emulator status

| Question | Answer |
|---|---|
| Did this review verify that the Firestore Emulator started in GitHub Actions? | **Yes, from the provided PR #178 log summary** |
| Did this review verify a successful Firestore Emulator JAR download in GitHub Actions? | **Yes, from the provided PR #178 log summary** |
| Does the known Firestore Emulator JAR blocker remain critical in GitHub Actions? | **No, not for the latest PR #178 failure.** |
| Previous local blocker | Firebase CLI could not download `cloud-firestore-emulator-v1.19.8.jar`: `download failed, status 403: Forbidden`; after startup failure, focused tests hit `ECONNREFUSED 127.0.0.1:8080`. The latest GitHub Actions failure progressed beyond this blocker and failed on a rules-test expectation instead. |

## Safety and production-resource check

| Item | Answer |
|---|---:|
| Were real Firebase resources used by this verification? | **No** |
| Were secrets used? | **No** |
| Were deploys possible or triggered? | **No** |
| Were production Firebase project IDs required? | **No** |
| Were runtime product files changed? | **No** |

## Relevant local commands used for this review

```bash
which gh || echo no-gh
git remote -v
test -f .github/workflows/beta1-emulator-tests.yml
sed -n '1,220p' .github/workflows/beta1-emulator-tests.yml
git log --oneline --all -- .github/workflows/beta1-emulator-tests.yml docs/beta/BETA1_EMULATOR_VERIFICATION.md
git ls-remote https://github.com/Bernds-tech/WellFit-now.git HEAD refs/pull/175/head refs/pull/175/merge refs/heads/main refs/heads/ci/beta1-emulator-verification
```

Observed shell-network blocker:

```text
fatal: unable to access 'https://github.com/Bernds-tech/WellFit-now.git/': CONNECT tunnel failed, response 403
```

## Next recommended step

Trigger or provide access to a real run of **Beta 1 Emulator Tests** using either:

1. a manual `workflow_dispatch` run on the branch that contains `.github/workflows/beta1-emulator-tests.yml`, or
2. a PR run from the branch that added the workflow.

The run must capture logs proving whether:

- `npm --prefix functions run beta1:rules` actually ran,
- `npm --prefix functions run beta1:callable` actually ran,
- the Firestore Emulator started successfully,
- the Firestore Emulator JAR download still returns `403 Forbidden`, and
- any later failures are product/test failures rather than environment startup failures.

Recommended follow-up branch after a real run is available: `ci/beta1-emulator-run-log-review`.
