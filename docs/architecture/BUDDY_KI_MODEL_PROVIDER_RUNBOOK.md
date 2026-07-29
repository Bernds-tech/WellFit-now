# WellFit – Buddy KI Model Provider Runbook

Stand: 2026-07-29
Status: Rules live; model provider disabled and not approved for activation

## Current verified path

```text
/mobile/ar
  -> buddyKiRemoteProvider
  -> /api/buddy-ki
  -> Rules provider
  -> safety-normalized Buddy response
```

Live staging verification on 2026-07-29:

- `GET /api/buddy-ki`: HTTP 200
- `providerMode=rules`
- `modelConfigured=false`
- `modelProviderEnabled=false`

The repository contains an optional OpenAI provider, but repository code is not activation evidence.

## Authority boundary

The Buddy may explain, suggest, guide, celebrate and provide safe alternatives. It may never authorize:

- WFP/WFXP, XP, rewards, inventory or ledger writes,
- mission completion or evidence approval,
- health diagnosis or treatment,
- guardian consent or safety-critical location decisions,
- moderation sanctions,
- WFT, wallet, token, NFT, presale, payment, staking, trading or cash-out,
- GitHub changes, merges or deployments.

Backend/App policy remains authoritative. Rules fallback must remain available.

## Blocking prerequisites before model activation

- [ ] authenticated endpoint and Firebase App Check/abuse control
- [ ] per-user/IP privacy-safe rate limits and server spend ceilings
- [ ] hard request timeout, bounded retries, backoff and circuit breaker
- [ ] strict schema validation / Structured Outputs instead of JSON-mode-only parsing
- [ ] input/output moderation and high-risk escalation behavior
- [ ] specific under-18 policy, age-appropriate output and guardian/privacy review
- [ ] German and English eval set covering health, body image, minors, coercion, shame, rewards, privacy, prompt injection and unsafe places
- [ ] logging/monitoring without raw sensitive prompt retention by default
- [ ] latency, fallback-rate, safety and cost dashboards with rollback thresholds
- [ ] documented provider data-control/retention decision
- [ ] internal adult cohort approval before any wider user test

OpenAI recommends the Responses API for new projects, Structured Outputs over JSON mode when possible, and additional safeguards when serving minors:

- https://developers.openai.com/api/docs/guides/migrate-to-responses
- https://developers.openai.com/api/docs/guides/structured-outputs
- https://developers.openai.com/api/docs/guides/safety-best-practices
- https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance

Recheck current official documentation when implementing; do not assume this runbook freezes provider behavior.

## Server-only configuration

The current implementation reads:

- `BUDDY_KI_PROVIDER=openai`
- `BUDDY_KI_MODEL=<approved model>`
- `OPENAI_API_KEY=<server-only secret>`

Never commit values or expose them through `NEXT_PUBLIC_*`. Secret creation/rotation belongs to the secure deployment workflow, not application source.

The active web release is Docker-based. Do not follow the historical instruction to restart PM2.

## Safe activation sequence

1. Implement and test all blocking prerequisites on a scoped branch.
2. Keep production/staging provider mode on `rules`.
3. Run offline/versioned evals against a non-user test dataset.
4. Run the existing lint, TypeScript, build, Functions and Quality-Gate checks.
5. Review privacy, minor, health and cost evidence.
6. Configure server-only variables through the approved staging environment.
7. Deploy through the repository Docker workflow with rollback ready.
8. Verify `GET` reports `remote-ai` only in the approved test environment.
9. Exercise allowed intents, malformed input, prompt injection, provider timeout/error, rate limit and rules fallback.
10. Test `/mobile/ar` with the internal adult cohort.
11. Disable the provider immediately if safety, latency, cost or fallback thresholds fail.

## Required live evidence

- release SHA and environment,
- provider/model configuration state without secret values,
- auth/App Check and rate-limit denial results,
- eval version and pass thresholds,
- allowed-intent responses,
- malformed/high-risk/prompt-injection outcomes,
- provider timeout/error and circuit-breaker result,
- Rules fallback result,
- monitoring/rollback confirmation,
- reviewer/owner approval.

## KI-Fortsetzungs-Prompt

Read `docs/architecture/WELLFIT_AGENT_AND_AI_RUNTIME_AUDIT_2026-07-29.md`, the current runtime state and this runbook. Keep the live provider in Rules mode until every blocking prerequisite has evidence. Use the Docker staging workflow, never PM2. Do not expose keys, do not grant reward/mission/health/location/payment authority, and stop on missing under-18, moderation, rate, cost, timeout, eval or rollback evidence.
