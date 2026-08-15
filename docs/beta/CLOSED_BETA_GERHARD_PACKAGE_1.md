# Gerhard Closed-Beta Package 1 — Core User Journey Baseline

Status: package 1 complete (analysis and work-package preparation)  
Scope: adult normal-user Closed Beta; no product-authority changes  
Baseline reviewed: local checkout `c0ef7d9` on 2026-08-15

## Purpose and boundaries

This package defines the smallest end-to-end journey Gerhard must be able to test before WellFit can be called Closed-Beta ready. It does not change authentication, Functions, Firestore Rules, economy semantics, legal text, or UI behavior.

The following remain out of scope: WFXP/WFP/XP migration, token, NFT, blockchain, cash-out, Marketplace activation, Mayor, Reality Glitch, child/guardian activation, and native AR. Existing guarded or placeholder code in those areas is not evidence for the Gerhard journey.

## Definition of the Gerhard journey

The target journey is:

1. Open the public landing page and registration.
2. Create an email/password account as an eligible adult.
3. accept Terms and Privacy separately and leave optional consent off unless deliberately selected;
4. complete the server-authoritative onboarding once, including local time zone and Buddy selection;
5. verify the email address before entering protected Beta routes;
6. sign in again and reach the dashboard through a verified, initialized, active account;
7. load the server projections for profile, internal balance, Buddy, mission state, and history;
8. perform a server-authoritative Buddy action without a duplicate debit;
9. start a Daily or Weekly mission, submit evidence, observe pending review, receive an admin decision, and observe completion plus the internal ledger/wallet projection;
10. run the mobile squat flow, submit pose evidence, and observe the same review lifecycle;
11. reload and sign in on the Mobile/PWA surface without losing authoritative state;
12. inspect settings, request a password reset, sign out, and sign in again.

Adventure and Challenge are follow-up acceptance paths after Daily/Weekly and pose are green. Marketplace, child/guardian, Mayor, Reality Glitch, and native AR are not acceptance paths.

## What already works in code

### Account creation and onboarding

- Registration validates required identity fields, password strength, matching passwords, and separate Terms/Privacy acceptance.
- Health personalization, anonymous analytics, and marketing default to off.
- Firebase creates the email/password identity, then `initializeUserAccount` initializes server projections.
- The onboarding callable is authenticated, validates the authenticated email, derives an age band without retaining raw birth date, records consent events, creates the initial Buddy/avatar projection and calendar settings, and is idempotent.
- Registration attempts to send a Firebase verification email after successful initialization.
- Login calls `recordUserSessionActivity`; an account without an onboarding record is redirected back to registration.

### Core product runtime

- Dashboard reads Firebase-authenticated user and server projections.
- Buddy actions and feeding use callable Functions, atomic wallet/ledger behavior, cooldowns, and request identifiers for replay protection.
- Daily, Weekly, Challenge, and Adventure pages have callable-backed catalogs and progress projections.
- Mission attempts, evidence, review, completion, internal ledger, wallet, and mission-history server paths exist.
- Mobile squat uses camera/pose analysis and submits server-reviewed pose evidence.
- Firestore denies direct client writes to user identity/private records and protected mission/economy collections.
- Account status, export, deletion request, cancellation, and deletion processing primitives exist.

### Existing automated evidence

- The Next.js production build succeeds and includes the public, dashboard, settings, Buddy, mission, mobile, and API routes.
- `npm --prefix functions run check` succeeds, including syntax, startup, and focused unit tests.
- Dedicated emulator tests exist for onboarding, settings, preferences, lifecycle, deletion, Firestore Rules, mission review/status, Buddy actions/care, Daily/Weekly/Challenge/Adventure, pose, operations, history, and database operations.

## Actual blockers found

### CB-P0-01 — Protected routes have no server/session gate

`proxy.ts` only redirects the `www` host to the apex host. Dashboard, Buddy, settings, missions, mobile, and admin pages are delivered without a server-side authenticated-session decision. Individual clients may show an error or empty state and Firestore still protects data, but that is not a complete protected-route contract.

Impact: unauthenticated and invalid-account states are inconsistent; email verification and account freeze cannot be enforced before route delivery.

### CB-P0-02 — Email verification is sent but not enforced

Registration marks verification as required and sends the email, but its completion screen can continue directly to `/dashboard`. Login and landing-session redirects route initialized users to `/dashboard` without checking `user.emailVerified`. The onboarding record also captures the verification state at initialization time, so that stored value remains false unless a later authoritative refresh is added.

Impact: an unverified account can enter the normal user journey; verification is informational rather than a gate.

### CB-P0-03 — Active-account state is not a common client route decision

Account lifecycle Functions can freeze mutations for deletion or blocked states, and protected backend operations check lifecycle in several authority paths. The shared login/landing routing decision only distinguishes initialized from uninitialized. There is no common UI routing state for active, suspended/frozen, deletion-pending, or deleted accounts.

Impact: a blocked user can reach normal pages and encounter late, feature-specific failures rather than a single safe account-status screen.

### CB-P0-04 — No proven browser-level end-to-end Gerhard test

The repository has strong callable and emulator coverage, but no browser automation that creates a normal user and proves registration through dashboard, Buddy, mission review, wallet update, reload, and logout. There is also no committed Firebase emulator connection mode for the web client in this journey.

Impact: individually tested server paths do not prove that the assembled user flow works.

### CB-P0-05 — Current audit environment cannot run the emulator suite

The focused onboarding emulator command reached Firebase CLI startup but failed while downloading `cloud-firestore-emulator-v1.19.8.jar` with HTTP 403. No Firebase web configuration is available for interactive browser testing in this checkout.

Impact: current-head emulator evidence could not be regenerated in this environment. This is an environment blocker, not evidence of a code failure.

### CB-P1-01 — Partial onboarding recovery is incomplete as a user experience

Login detects a missing onboarding record and redirects to `/register`; the callable is idempotent. However, the original registration form values are not recoverable after a refresh or another device. A Firebase identity created before a callable/network failure must re-enter the full form, and the flow has no explicit "resume account setup" state.

Impact: recoverable backend state exists, but Gerhard can become confused or stranded after a mid-registration failure.

### CB-P1-02 — Adult Closed-Beta eligibility is not enforced

Self-registration currently accepts users from age 14. The confirmed phase excludes child/guardian activation and calls for a small adult Closed Beta.

Impact: this does not block Gerhard personally, but it blocks opening the same registration route as an adult-only beta without an invitation/eligibility decision.

### CB-P1-03 — Normal-user navigation exposes out-of-scope surfaces

The shared sidebar links normal users to Marketplace Preview and Agent Center. Marketplace must not be activated in this phase, and Agent Center is not part of Gerhard's normal-user journey. Firestore claims protect Agent Center data, but visible navigation creates scope confusion and unnecessary failure states.

Impact: Gerhard cannot experience a focused core Beta and may interpret placeholders as incomplete required features.

### CB-P1-04 — Root quality gates are not green

The production build and Functions check pass, but root ESLint fails on the CommonJS database package and the repository quality gate reports register/TODO/route drift.

Impact: there is no fully green merge baseline for the Closed-Beta packages.

### CB-P1-05 — Real-device Mobile/PWA evidence is missing

Browser motion and MediaPipe pose code exist, but there is no current device matrix proving permissions, HTTPS requirements, camera lifecycle, performance, PWA install/reload, background/foreground, and network recovery on Android and iOS.

Impact: Mobile/PWA and pose cannot yet be accepted for Gerhard's real-device test.

## Files that later packages must change

Package 1 intentionally changes none of these runtime files.

### Authentication and route gating

- `proxy.ts`
- a new server-session/auth library under `lib/auth/` (exact name to be chosen by that package)
- route-group layouts or a minimal shared client gate for protected application pages
- `app/components/login/LoginForm.tsx`
- `app/components/landing/LandingSessionRedirect.tsx`
- `app/register/RegisterPageClient.tsx`
- `app/register/components/Step4Awakening.tsx`
- a new verification/account-status page or component
- focused auth/session tests

### Onboarding recovery

- `app/register/RegisterPageClient.tsx`
- `lib/beta1/clientUserOnboarding.ts`
- `functions/lib/beta1UserOnboarding.js`
- `functions/test/beta1UserOnboardingEmulatorTest.js`
- focused browser/unit tests for resume behavior

### Focused normal-user navigation

- `app/AppSidebar.tsx`
- potentially shared navigation tests

No Marketplace, Agent Center, Mayor, Reality Glitch, child, or native-AR implementation should be changed. The navigation package should hide or clearly exclude those surfaces from normal Beta navigation, not activate or delete them.

### Test infrastructure and mobile evidence

- test-only browser automation configuration and specifications, preferably without changing application dependencies until the selected runner is approved;
- Firebase emulator web-client configuration isolated from production configuration;
- CI workflow only after the local test is deterministic;
- device evidence under `docs/beta/` or `docs/status/`, without changing native AR.

### Quality baseline

- `eslint.config.mjs` and/or scoped CommonJS database lint configuration;
- the nine currently warned source files;
- governance/register files in a separate governance-only branch.

`functions/index.js`, `firestore.rules`, `package.json`, lockfiles, and protected Canonical Truth files are not expected to change for the analysis package and must not be casually included in any follow-up.

## Required acceptance tests

### Static and build gate

1. `npm run lint`
2. `npm --prefix functions run check`
3. `npm run build`
4. `npm run mission:quality-check`
5. `npm run agent:firestore-economy-rules-check`

### Emulator gate

At minimum:

1. `npm --prefix functions run beta1:rules`
2. `npm --prefix functions run beta1:onboarding`
3. `npm --prefix functions run beta1:user-settings`
4. `npm --prefix functions run beta1:user-preferences`
5. `npm --prefix functions run beta1:account-lifecycle`
6. `npm --prefix functions run beta1:mission-status`
7. `npm --prefix functions run beta1:evidence-admin`
8. `npm --prefix functions run beta1:buddy-care`
9. `npm --prefix functions run beta1:buddy-actions`
10. `npm --prefix functions run beta1:daily-progress`
11. `npm --prefix functions run beta1:weekly-progress`
12. `npm --prefix functions run beta1:mobile-pose`
13. `npm --prefix functions run beta1:mission-history`

Before Closed-Beta acceptance, run the complete `npm --prefix functions run beta1:test:emulator` suite from a single deterministic emulator harness.

### Browser journey gate

Automate or manually capture, against emulators/staging:

1. unverified user is held outside protected routes;
2. verified but uninitialized user resumes setup;
3. initialized active user reaches dashboard;
4. signed-out access to each protected route returns to login;
5. deletion-pending/frozen user reaches account status, not dashboard;
6. Buddy request replay causes no duplicate debit;
7. Daily/Weekly evidence remains pending until admin review;
8. approved review creates exactly one completion and ledger event;
9. rejected/needs-more-evidence states do not reward;
10. pose evidence follows the same authority lifecycle;
11. reload preserves server projections;
12. logout removes protected access.

### Real-device gate

Record Android Chrome/PWA and iOS Safari/PWA evidence for login persistence, camera permission, motion permission, pose start/stop, background/foreground, offline/reconnect, and sign-out. Raw camera frames, raw coordinates, and health data must not be added to evidence documents.

## Parallel-safe next Cloud work packages

The following packages have disjoint primary ownership and can start in parallel after rebasing on this package.

### Cloud Task A — Auth contract and route-guard implementation

Primary ownership: `proxy.ts`, new `lib/auth/*`, login/landing redirects, new verification/account-status UI, auth-focused tests.  
Do not touch: mission/economy Functions, Firestore Rules, Marketplace, child/guardian, native AR, Canonical Truth.  
Acceptance: verified + initialized + active is the only state admitted to normal protected routes; explicit recovery states exist for signed-out, unverified, uninitialized, frozen, and deletion-pending users.

This task owns the `proxy.ts` hotspot exclusively and must be serialized with any other proxy/session work.

### Cloud Task B — Closed-Beta quality baseline

Primary ownership: `eslint.config.mjs`, database lint scoping, currently reported warning sites.  
Do not touch: `proxy.ts`, Login/Register behavior, Functions authority, Firestore Rules, package dependencies.  
Acceptance: `npm run lint`, Functions check, and build pass without changing runtime behavior.

### Cloud Task C — Gerhard browser-test design and emulator harness

Primary ownership: new test/harness files and test documentation.  
Do not touch initially: runtime UI, Functions authority, Firestore Rules, `package.json`/lockfile. If a new browser-test dependency is necessary, stop with an explicit dependency proposal rather than editing the hotspot.  
Acceptance: deterministic plan or executable harness for account creation, verification-state setup, initialization, dashboard, Buddy, reviewed mission, wallet/history, pose, reload, and logout.

### Cloud Task D — Mobile/PWA real-device evidence plan

Primary ownership: test-only documentation and evidence templates.  
Do not touch: native Unity/AR, child/guardian, economy schema, production Firebase configuration.  
Acceptance: Android/iOS device matrix, privacy-safe capture rules, permission/reset steps, expected results, and defect format.

### Cloud Task E — Normal-user navigation scope

Primary ownership: `app/AppSidebar.tsx` plus a focused navigation test.  
Do not touch: Marketplace implementation, Agent Center implementation, route guards, Functions, Rules.  
Acceptance: normal-user navigation contains only current core-Beta destinations; out-of-scope modules remain in the repository and accessible only through their separately authorized development/admin context.

Cloud Tasks A, B, C, and D are immediately independent. Task E is also code-independent from A in file ownership, but should consume A's final role/session contract before introducing any role-conditional navigation; until then it should use a static Closed-Beta navigation allowlist only.

## Decisions required from the owner

These decisions are separate from work that can proceed autonomously:

1. **Adult Beta admission:** choose invite-only adult allowlist, minimum age 18 on the public registration route, or another reviewed eligibility mechanism. Current self-registration permits age 14+.
2. **Session architecture:** approve server-managed Firebase session cookies for real Next.js route enforcement, or explicitly accept a client-only gate. Server-managed sessions are recommended.
3. **Browser test runner dependency:** approve the existing-environment option if available, or approve adding a named browser automation dependency in its own package/lockfile PR.

No WFXP/WFP/XP decision is required to execute packages A-E, and none of those packages may alter that model.

## Work that can proceed without further product decisions

- repair lint without runtime changes;
- build the test matrix and emulator harness without adding dependencies;
- prepare privacy-safe mobile/PWA device evidence;
- implement explicit signed-out, unverified, uninitialized, and lifecycle UI states after the session architecture is approved;
- hide out-of-scope navigation from the normal Closed-Beta shell without deleting or activating those modules;
- run all existing static, build, and emulator tests where the environment provides cached emulator binaries or download access.
