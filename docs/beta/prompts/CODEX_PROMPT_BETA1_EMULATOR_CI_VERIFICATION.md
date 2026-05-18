# Codex Prompt: Beta-1 Emulator / CI Verification

Status: follow-up prompt for a separate verification PR  
Prepared: 2026-05-18  
Suggested next branch: `ci/beta1-emulator-verification`  
Suggested PR title: `Add Beta-1 emulator verification workflow`

## Mission

Run and report real Beta-1 emulator verification for the hardened Beta-1 runtime. This is a verification/CI-readiness task, not a product-runtime expansion task.

The primary goal is to prove whether the Beta-1 Firestore Rules and Callable emulator suites pass in an environment where Firebase emulators can actually run. Do not report fake success. If the environment is blocked, document the exact blocker and prepare the smallest safe next step.

## A. Required reading before any changes

Read these files first, in this order:

1. `AGENTS.md`
2. `firebase.json`
3. `functions/package.json`
4. `firestore.rules`
5. `functions/test/beta1FirestoreRulesEmulatorTest.js`
6. `functions/test/beta1CallableFunctionsEmulatorTest.js`
7. `project-register/progress-log.json`
8. `project-register/agent-work-log.json`

Also respect the current branch/task instructions and any nested `AGENTS.md` files that apply to changed files.

## B. Problem definition

PR #173 hardened the Beta-1 runtime and emulator-oriented tests, but the Codex container could not complete emulator execution:

- The Codex container could not download the Firestore Emulator JAR.
- Firebase CLI failed while downloading the `cloud-firestore-emulator` JAR with `403 Forbidden`.
- After the emulator failed to start, focused test scripts hit `ECONNREFUSED 127.0.0.1:8080` because Firestore Emulator was not running.
- The goal of this follow-up is real verification, not a fake green result.

Treat previous Codex-container emulator failures as environment-blocked until proven otherwise. A passing report is only valid if the emulator tests actually ran against local emulators.

## C. Verification goals

Run these checks and record exact pass/fail/warning results:

```bash
npm run agent:validate
npm run agent:quality-gate
npm run lint
npm --prefix functions run check
npm --prefix functions run beta1:rules
npm --prefix functions run beta1:callable
npm --prefix functions run beta1:test:emulator
npm --prefix functions run test:emulator
```

For the emulator scripts, ensure the relevant Firebase emulators are running locally with the demo project before declaring success. Prefer the existing Firebase CLI/project setup from the repo, for example using project `demo-no-project` and localhost emulator endpoints. Do not use production Firebase resources.

## D. If the local/Codex environment is still blocked

If the local or Codex environment still cannot run the emulator tests, the follow-up PR must do one of these scoped alternatives:

1. Add or update a reproducible local runbook section that explains how a developer can run the Beta-1 emulator tests in a prepared environment; or
2. After separate human approval for `.github/**`, propose the smallest possible GitHub Actions workflow that runs the Beta-1 emulator tests in CI.

Do not silently skip emulator execution. If execution is blocked, preserve the exact logs and state which checks did not actually run.

## E. Potentially allowed files in the later CI PR, only after approval

The later CI/verification PR may touch only these files if they are necessary and if required approvals are present:

- `.github/workflows/beta1-emulator-tests.yml` — only after separate human approval for `.github/**` changes.
- `docs/beta/BETA1_EMULATOR_VERIFICATION.md`
- `project-register/agent-work-log.json`
- `project-register/progress-log.json`
- `todolist/NEXT_ACTIONS.md`

If `.github/**` approval is not explicit, do not create or modify workflow files. Use docs/register reporting instead.

## F. Forbidden files in the later CI PR unless separately approved

Do not modify these areas unless the human explicitly expands scope in a separate approval:

- `app/**`
- `components/**`
- `functions/lib/**`
- `functions/index.js`
- `firestore.rules`
- `public/**`
- `native/**`
- `package-lock.json`
- Runtime product logic

This verification task must not change Beta-1 runtime behavior. Runtime security findings should become a documented follow-up, not an opportunistic code change inside the CI/verification PR.

## G. CI workflow requirements if workflow creation is approved

If and only if separate human approval allows `.github/**`, the proposed workflow must be minimal and safe:

- Use a Node version that matches the project requirements.
- Ensure Java is available for Firebase Emulator execution.
- Use `npm ci` or `npm install` only if the lockfile/repo state supports that command without unintended dependency changes.
- Use `firebase-tools` from an existing project dependency/devDependency when possible instead of installing an unrelated global version.
- Start emulators with `--project demo-no-project`.
- Run the Beta-1 focused tests:

```bash
npm --prefix functions run beta1:rules
npm --prefix functions run beta1:callable
```

- Optionally run broader emulator suites after the focused Beta-1 checks:

```bash
npm --prefix functions run beta1:test:emulator
npm --prefix functions run test:emulator
```

- Do not deploy anything.
- Do not require or read secrets.
- Do not use Firebase production project IDs.
- Do not access real user data.
- Use only emulators, localhost endpoints and the demo project.

## H. Stop conditions

Stop and report a blocker instead of widening scope if any of these conditions occur:

- Firebase production credentials would be required.
- Real Firebase project IDs would be required.
- `.github/**` would need changes but separate human approval for workflow edits is missing.
- Dependencies would need to be installed, removed or lockfile-modified without separate approval.
- Tests reveal runtime safety issues that require changes beyond this verification/CI scope.
- The Firestore Emulator download is also blocked in CI or the prepared environment.

When stopped, record the exact command, relevant logs, affected file/scope and a recommended next branch.

## I. PR report duty for the later CI/verification PR

The PR description and final agent report must state:

- Which tests truly ran.
- Which tests remained environment-blocked.
- Relevant error logs for blocked or failed checks.
- Confirmation that no fake successes are claimed.
- Whether dependencies were installed or changed.
- Whether real Firebase resources were touched; this must be `no`.
- Whether `.github/**` was changed and the exact approval basis if it was.
- The next recommended branch.

## Expected successful outcome

A successful follow-up either:

1. Produces real green Beta-1 emulator results for the focused rules and callable suites, with exact commands and logs summarized; or
2. Produces a scoped, honest blocked report plus a minimal human-approved CI/runbook path for getting those results.

In both cases, keep the PR narrow, avoid runtime changes, and preserve the Beta-1 safety stance: no blockchain, token, NFT marketplace, cashout, real-money shop, IAP, DePIN, real PvP stakes, public child profiles, child standalone login or client-authorized XP/mission/shop/inventory/mayor/glitch/admin decisions.
