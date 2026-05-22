<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# WellFit Repository Agent Rules

## 1. Project overview

WellFit is a Move-Learn-Social-Earn platform that combines movement, learning, social challenges, gamification, an AI buddy, AR experiences, PvP/challenge mechanics, a planned token/NFT economy, and future B2B modules.

The current codebase is an existing product baseline. Do not restart or rewrite the app. Extend the current architecture in small, reviewable steps and preserve existing working behavior unless a task explicitly requests a change.

## 2. Branching rules

- Do not work directly on `main`.
- Create a task-specific branch before making changes.
- Keep each branch focused on one clear goal.
- Do not merge or close old Unity PR #13 unless the repository owner explicitly instructs you to do so.
- Do not merge PR #13 into current work as a shortcut.
- Before committing, verify `git status` and ensure only intentional files are changed.

## 3. Pull request rules

- Keep pull requests minimal, reviewable, and scoped to the requested task.
- Summarize changed files, checks run, known risks, and the next recommended task.
- Do not hide failing checks. If a command fails, include the command, failure reason, and whether it is an environment limitation or a code issue.
- Do not include secrets, local-only machine paths, generated build output, or unrelated `.vscode` changes.
- If documentation or TODO state changes, update only the relevant planning/register files and do not delete historical context.

## 4. Build, lint, and test rules

- Run `npm install` only when dependencies are missing or clearly out of sync.
- Prefer the existing package scripts:
  - `npm run lint`
  - `npm run build`
  - `npm run agent:quality-gate` when project governance or broader quality checks are relevant
  - `npm --prefix functions run check` for Firebase Functions syntax checks
- Emulator-based tests may require Firebase emulators, Java, ports, and local environment setup. If they cannot run, document the limitation clearly.
- For Next.js code changes, read the relevant guide in `node_modules/next/dist/docs/` before changing APIs, routing, rendering behavior, metadata, caching, or build configuration.

## 5. UI/UX rules

- Preserve the current visual identity, header, sidebar, footer, routes, navigation structure, and existing working pages unless a task explicitly requests otherwise.
- Do not introduce a parallel design system or duplicate UI shell.
- Keep mobile, dashboard, mission, buddy, legal, and settings flows consistent with the existing app structure.
- Avoid broad restyling when a small targeted fix is enough.
- If a perceptible UI change is made to a runnable web page, capture or request a screenshot/preview when the environment supports it.

## 6. Safety and compliance rules

Do not modify compliance-critical logic without explicit instruction and a clear review plan. This includes:

- token, NFT, wallet, payment, purchase, payout, marketplace, staking, presale, or trading logic
- health data, watch data, location data, camera data, child-safety, privacy, consent, or medical-adjacent logic
- betting, PvP stakes, competition payouts, anti-cheat, reward authorization, mission completion authority, or financial-equivalent mechanics
- legal, AGB, Datenschutz, Impressum, or compliance messaging

Default product safety stance:

- Mobile must not activate token/NFT/trading/presale features.
- Rewards, XP, points, mission completion, anti-cheat, inventory unlocks, and rare-item grants must not be final-authorized by the client.
- Internal points/XP simulations may exist for beta UX, but final ledger authority must remain server-side or explicitly marked as draft/preview.
- Never expose secrets or server API keys to the frontend.

## 7. Unity / WellFitBuddyAR protection rules

- Do not delete `native/unity/WellFitBuddyAR` or any local Unity files under it.
- Treat `native/unity/WellFitBuddyAR/Assets/Scripts/` as potentially important local Unity work.
- Do not overwrite Unity scripts with templates unless explicitly instructed.
- Do not merge, close, or depend on old Unity PR #13 without explicit owner instruction.
- Keep Unity AR work separate from web beta work unless the task explicitly bridges them.
- Unity may emit AR events, but backend/app logic must decide rewards, mission completion, and anti-cheat.

## 8. TODO, list, and planning file protection rules

- Do not delete TODO, list, roadmap, status, planning, register, or handoff files.
- If a TODO/list file is stale, mark it as stale and link to the leading file instead of removing it.
- If a TODO/list file duplicates another file, mark it as duplicate and point to the canonical source.
- Important planning areas include `todolist/`, `project-register/`, `docs/architecture/`, and `agents/`.
- Keep planning edits small and preserve historical decisions unless a task explicitly asks for consolidation.

## 9. Reporting completed work

When finishing a task, report:

- branch name
- concise summary of changed files
- commands/checks run and their results
- known risks, skipped checks, or environment limitations
- whether dependencies were installed or left unchanged
- next recommended task

For code changes, cite the affected files and keep the summary tied to the actual diff.

## 10. Staged roadmap before continuing mission development

Before continuing larger mission development, prepare WellFit in staged, low-risk steps:

1. **Repository baseline**: confirm branch state, dependency state, lint/build status, and current route/API inventory.
2. **Governance alignment**: ensure `AGENTS.md`, TODO index, project registers, and handoff/status files agree on safe working rules.
3. **UI shell stability**: preserve and verify landing, dashboard, sidebar, footer, mobile navigation, legal/help pages, and existing mission routes.
4. **Safety wording pass**: remove or clearly defer premature token/NFT/wallet/payment/betting language from beta-facing mobile and mission flows unless explicitly approved.
5. **Economy guardrails**: keep points/XP/rewards as internal beta mechanics; maintain draft/preview status for final ledger writes until server authority, rules, and emulator tests are ready.
6. **Data protection review**: confirm health, child-safety, camera, location, and consent flows are documented and not expanded without explicit instruction.
7. **Backend readiness**: validate Firebase Functions syntax, Firestore rules guardrails, server preview APIs, and persistence status before moving more reward authority off the client.
8. **Unity AR isolation**: inventory WellFitBuddyAR state without deleting or overwriting local Unity assets; plan AR work separately from web beta work.
9. **Mission development continuation**: only after the above checks, continue mission features in small increments using existing mission, economy, buddy, and register modules rather than creating parallel systems.

## 11. Canonical Truth owner-only protection

The WellFit Beta-1 canonical truth is owner-controlled and read-only for normal agent/autonomous/Codex work.

Protected owner-only concept files:

- `project-register/wellfit-beta1-canonical-truth.json`
- `docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md`
- `todolist/CODEX_CONTEXT_WELLFIT_BETA1.md`

Rules:

- Agents must read these files before Beta-1 governance, roadmap, register, or planning changes that depend on Beta-1 concept truth.
- Agents must not modify these files unless the prompt contains explicit Bernd/owner approval for that change.
- If a task would require edits there without approval, stop and document a blocker plus proposed patch in a non-protected planning/register handoff artifact.

