# WellFit Beta 1 Agent Instructions

Status: canonical Beta-1 docs/register runbook  
Updated: 2026-05-17

## Repository instruction hierarchy

`AGENTS.md` remains the top repository instruction file. This Beta-1 agent pack narrows the scope for coordinated Beta-1 planning, data modeling, API-contract and emulator-test preparation. If this file conflicts with `AGENTS.md` or a direct human instruction, the higher-level instruction wins.

## Canonical Beta-1 decisions

- Beta 1 is a closed, free test version with wave 1 at 25-50 testers and wave 2 at 250 testers.
- Internal points are `WellFit-XP` with suggested symbol `WFXP`.
- WellFit-XP has no monetary value, no crypto value, no exchange, no cashout and no blockchain backing.
- No blockchain, public token, cashout, NFT marketplace, DePIN, real-money shop, real PvP stake, school/teacher/corporate accounts or single/dating overlay is active in Beta 1.
- Sui is only a later release direction after the internal points system works; it is not implemented in Beta 1.
- Premium is not active in Beta 1. Beta testing remains free before release; release planning keeps a three-month free phase before premium starts.
- Children aged 8-13 are allowed only as child profiles under guardian/parent accounts. Children do not have standalone login.
- Beta 1 includes family/parent accounts only; no school, teacher or corporate accounts.
- The shop is included with WellFit-XP-only internal spend. No real money and no sandbox IAP in the first Beta-1 build.
- The mayor system is included with no Junior Mayors. Mayor share/revenue share is internal WellFit-XP only.
- Reality Glitch is included as controlled micro-events starting first in Vienna and Lower Austria.

## Runtime implementation boundary

These agents are docs/register agents. They may plan, validate, check, create prompts and prepare handoffs. They must not implement runtime behavior unless a future human-approved PR names exact files, allowed code paths and tests.

## Beta-1 agent pack overview

| Agent | Purpose | Runtime authority |
| --- | --- | --- |
| `beta1-scope-steward` | owns canonical Beta-1 decisions and prevents scope drift. | None by default; docs/register planning only. |
| `beta1-data-model-agent` | owns Firestore collection design and relation mapping. | None by default; docs/register planning only. |
| `beta1-api-contract-agent` | owns Firebase callable/HTTP function contract planning and request/response schemas. | None by default; docs/register planning only. |
| `firestore-rules-guard-agent` | checks that protected collections remain server-only. | None by default; docs/register planning only. |
| `guardian-child-safety-agent` | checks child profile, guardian consent, shop gate and location safety rules. | None by default; docs/register planning only. |
| `wellfit-xp-economy-agent` | checks XP ledger, wallet projection, no monetary value and no client authority. | None by default; docs/register planning only. |
| `mission-checkpoint-agent` | checks missions, evidence, completions, locations and Austria region support. | None by default; docs/register planning only. |
| `mayor-system-agent` | checks checkpoint mayor logic and XP-only share rules. | None by default; docs/register planning only. |
| `reality-glitch-safety-agent` | checks controlled micro-event safety, Vienna/Lower Austria start, admin cancel and multiplier caps. | None by default; docs/register planning only. |
| `shop-inventory-agent` | checks WellFit-XP-only shop, item definitions, inventory and no pay-to-win. | None by default; docs/register planning only. |
| `qa-emulator-agent` | defines emulator tests and quality-gate expectations. | None by default; docs/register planning only. |

## Safety boundaries

- Child safety: guardian-first onboarding, no public child profiles, no child standalone login, no open chat for child profiles, no live location visible to other users and guardian-gated shop flows.
- Location safety: Reality Glitch and mission locations must use safe, bounded locations and support admin cancellation.
- Reward safety: all final WellFit-XP grants, mission completion, mayor share, shop spend, inventory grants and glitch boost authority stay server-side.
- Client boundary: clients may preview, list, request and display state, but clients must never final-authorize XP, mission completion, mayor share, shop spend, inventory unlocks or glitch boosts.
- Economy boundary: no blockchain, no cashout, no public token, no NFTs, no monetary-value language and no real-money shop in Beta 1.

## File placement map

- Canonical scope: `docs/beta/WELLFIT_BETA1_SCOPE.yaml`
- Human-readable agent pack: `docs/beta/AGENTS_WELLFIT_BETA1.md`
- Human-readable data model: `docs/beta/WELLFIT_BETA1_DATA_MODEL.md`
- Machine-readable data model: `docs/beta/WELLFIT_BETA1_DATA_MODEL.yaml`
- Agent runbooks: `agents/beta1/*.md`
- Register pointers: `project-register/agent-catalog.json`, `project-register/approved-agent-build-backlog.json`, `project-register/agent-work-log.json`, `project-register/progress-log.json`
- Planning pointers: `todolist/TODO_INDEX.md`, `todolist/WORK_MAP.md`, `todolist/NEXT_ACTIONS.md`

## Handoff procedure for future runtime PRs

1. Confirm approval names exact runtime files and tests.
2. Re-read `AGENTS.md`, this agent pack, the scope YAML, the data model and current rules/functions files.
3. Open a new non-`main` branch scoped to one runtime slice.
4. Implement only server-authoritative Firebase/Firestore paths; do not add client authority.
5. Add emulator tests for protected client write failures and server-authorized success paths.
6. Run `npm run agent:validate`, `npm run agent:quality-gate`, `npm run lint`, `npm run build`, `npm --prefix functions run check` and relevant emulator tests where possible.
7. Update registers with checks, risks and the next safe step.
