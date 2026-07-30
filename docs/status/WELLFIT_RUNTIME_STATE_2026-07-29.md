# WellFit Runtime State — 2026-07-29

Status: current implementation, deployment and execution reference
Repository: `Bernds-tech/WellFit-now`
Verified main commit: `c0ef7d921ee1499cd20ffdd086ebca4050f1a189`

This document supersedes `docs/status/WELLFIT_RUNTIME_STATE_2026-07-24.md` as the current runtime reference. It does not replace the owner-protected Beta-1 Canonical Truth.

## Evidence model

Every feature must be described with the strongest evidenced state only:

| State | Meaning |
|---|---|
| `planned` | documented idea or approved backlog only |
| `code_present` | implementation exists in the repository |
| `merged` | implementation is on `main` |
| `deployed` | a release containing it was delivered to an environment |
| `configured` | required server-side configuration is evidenced |
| `live_verified` | the behavior was checked on the named live environment |

`code_present` must never be reported as `configured` or `live_verified` without separate evidence.

## Repository and deployment

- Development uses scoped branches and pull requests. Direct work on `main` is forbidden.
- Pushes/merges to `main` currently trigger `.github/workflows/deploy.yml`.
- The workflow builds a standalone Docker release, transfers a checksummed image bundle over SSH and activates it with `infra/server/deploy-wellfit.sh`.
- The deployment script uses a candidate container, health verification and rollback.
- Staging address: `http://172.86.88.107`
- This staging system is not a production release.
- Historical PM2 instructions are not the current web deployment path.

## Live verification on 2026-07-29

The following read-only checks were performed against staging:

| Endpoint | Result | Evidence |
|---|---:|---|
| `/api/health` | HTTP 200 | production runtime, `staging` release channel, exact commit `c0ef7d9...`, Firebase client configuration present |
| `/api/buddy-ki` | HTTP 200 | `providerMode=rules`, model not configured, model provider disabled |
| `/` | HTTP 200 | public landing available |
| `/login` | HTTP 200 | login route available |
| `/register` | HTTP 200 | registration route available |
| `/datenschutz` | HTTP 200 | legal page available, content mismatch described below |
| `/agb` | HTTP 200 | legal page available, content mismatch described below |
| `/impressum` | HTTP 200 | legal page available, content mismatch described below |
| `/robots.txt` | HTTP 404 | missing |
| `/sitemap.xml` | HTTP 404 | missing |
| `/.well-known/security.txt` | HTTP 404 | missing |

## P0 operational findings

1. Staging is served over plain HTTP and a direct IP. TLS/domain rollout is incomplete.
2. Central browser security headers are not configured: CSP, frame protection, referrer policy, permissions policy and HSTS after HTTPS are missing.
3. The public legal pages describe SUI, zkLogin, DePIN, WFT, NFTs, token economics and crypto acquisition although these functions are inactive in the current Beta-1 product.
4. `npm audit --omit=dev` reported 1 critical, 9 high and 4 moderate production-dependency vulnerabilities for the current lockfile, including direct `next`/`firebase` and transitive findings. Dependency remediation needs an immediate dedicated PR.
5. The repository Quality Gate was red on the verified baseline. The source/register failures were repaired on the audit branch and the full gate passed in a clean temporary worktree containing exactly the audit diff. The primary worktree still sees an unrelated pre-existing untracked public image, which must not be included or modified.
6. Staging auto-deploys from `main`; therefore a merge is an external staging mutation and must be treated accordingly.

Legal text changes must be made in a dedicated, reviewed Legal/Privacy PR. This audit does not silently rewrite legal claims.

## Product runtime baseline

- Registration, login, dashboard, settings, Buddy, missions, family/profile work, account export/deletion and administration have substantial Beta code.
- Mission and Buddy-care command paths are primarily designed for server authority through Firebase Functions.
- The repository and runtime still use the historical `WFXP` name in several active paths.
- Protected Beta-1 truth requires separate internal spendable WFP and non-spendable XP. The naming/data migration remains an explicit compatibility task; no parallel economy may be introduced.
- WFT, SUI, Solana, blockchain, wallet, NFT, presale, trading, staking and cash-out remain inactive.

## Agent and automation baseline

- Most named agents in `project-register/` and `scripts/wellfit-dev-agent/` are report-only governance definitions or local validators.
- `project-register/agent-automation-control.json` has automation disabled.
- `project-register/agent-control-center.json` does not grant runtime authority.
- However, `functions/lib/agentGithubRunner.js` and `functions/lib/agentAdminRolesAudit.js` contain real GitHub branch, file-write, PR, check-status and merge implementations.
- Repository presence is `code_present`. A deployed Functions version, valid GitHub App/token configuration and live execution were not verified.
- Until a dedicated security/runtime acceptance proves otherwise, real runner, auto-merge, auto-repair and auto-deploy must remain disabled.

See `docs/architecture/WELLFIT_AGENT_AND_AI_RUNTIME_AUDIT_2026-07-29.md`.

## Buddy AI baseline

- `/mobile/ar` can call `/api/buddy-ki`.
- The live service is `rules`, with the model provider disabled and unconfigured.
- Repository code contains an optional OpenAI provider using server-side environment variables.
- Model activation is blocked until endpoint authentication/App Check, rate and spend limits, timeout/retry, schema-constrained output, moderation, under-18 safeguards, evaluation and monitoring are evidenced.

## Current execution order

1. Make source-of-truth, registers and Quality Gate consistent.
2. Remediate critical/high production dependencies in a dedicated PR.
3. Prepare a dedicated Legal/Privacy correction PR.
4. Add domain/TLS and security headers to staging.
5. Prove or contain Agent/GitHub-runner runtime activation.
6. Complete authenticated E2E, Firebase environment, device and backup/restore evidence.
7. Harden Buddy AI before any model activation.
8. Continue Community and Unity/AR only in their protected tracks.
9. Keep blockchain/token work in the later, inactive roadmap.

## Explicitly not verified

- SSH host configuration beyond repository/runbook evidence
- cloud console settings, secrets and IAM outside exposed evidence
- deployed Firebase Functions version and callable inventory
- real GitHub runner credentials or a live runner execution
- production readiness, legal approval or external security audit
- a forensic export of every historic chat

These areas must not be described as audited or safe until separate access and evidence exist.

## KI-Fortsetzungs-Prompt

Treat this file as the current runtime reference, then read the protected Beta-1 Canonical Truth and `todolist/CURRENT_EXECUTION_BOARD.md`. Preserve the distinction between repository code, merge, deployment, configuration and live verification. Do not infer Firebase, GitHub-runner, AI-provider or production activation from code alone. Update this file after any verified main deployment or material runtime change.
