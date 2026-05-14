# WellFit User Feedback Database Flow

Status: Planning only / no live tracking  
Stand: 2026-05-14  
Leading machine-readable register: `project-register/user-feedback.json`

## Purpose

This document designs a privacy-safe database-backed feedback flow for WellFit so future agents can evaluate product feedback without seeing real user data. It extends the existing feedback/analytics planning work instead of adding a parallel analytics system.

This plan does **not** implement production tracking, third-party analytics, heatmaps, session replay, or live feedback writes. It only defines the future Firestore shape, minimization rules, consent gates, agent-readable aggregation format, future API proposal, and admin review workflow.

## Existing files this plan extends

- `project-register/feedback-analytics-loop.json` keeps the broader feedback, analytics, and optimization guardrails.
- `project-register/user-feedback.json` is the machine-readable register for this feedback database flow.
- `todolist/WORK_MAP.md` remains the topic-to-file map for Analytics / Feedback work.
- `todolist/TODO_INDEX.md` indexes this architecture file and register.
- `docs/architecture/HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md` remains the guardrail for health, watch, location, camera, AR, and child/youth data.

## Non-goals and hard boundaries

- Do not activate live production feedback collection in this task.
- Do not add third-party analytics, heatmaps, session replay, or external tracking scripts.
- Do not expose raw user feedback to future agent reports, PR messages, or public docs.
- Do not collect or store sensitive health, child, location, camera, biometric, wallet, token, payment, betting, reward-authority, mission-completion evidence, or anti-cheat evidence data in feedback events.
- Do not use feedback as automatic approval for safety, compliance, economy, reward, privacy, or child-related product changes.
- Do not allow direct client writes to Firestore feedback collections.

## Proposed Firestore collections

### `userFeedback/{feedbackId}`

Purpose: admin-only storage for a single user-submitted feedback item after future server-side validation and minimization.

Access model:

- Writes: future server API only.
- Direct client writes: forbidden.
- Reads: admin review only.
- Agent access: forbidden for raw documents.

Notes:

- `feedbackId` should be server-generated and opaque.
- `createdAt` and `updatedAt` should be server timestamps.
- User-provided text must be length-limited and clearly warned not to include sensitive information.
- Raw text may include accidental personal data; therefore it must never be copied into agent-readable summaries without review and aggregation.

### `userFeedbackSummaries/{summaryId}`

Purpose: anonymized and aggregated product insight records for future agents and product optimization.

Access model:

- Writes: future admin or server-side curation only.
- Direct client writes: forbidden.
- Reads: agent-readable only after aggregation and redaction.
- Minimum cluster size: at least 5 feedback items before creating a route/feature/theme summary.

Notes:

- Summaries must avoid exact counts for small groups. Use count buckets such as `5-10`, `11-25`, or `26-50`.
- Summaries must not contain raw quotes, user identifiers, contact details, unique incidents, or sensitive attributes.

### `userFeedbackDeletionRequests/{requestId}`

Purpose: privacy-ops workflow for deletion/export requests related to feedback.

Access model:

- Writes: future server API only.
- Direct client writes: forbidden.
- Reads: admin privacy operations only.
- Agent access: forbidden.

## Allowed feedback fields

The future raw feedback schema should stay small and controlled:

| Field | Rule |
|---|---|
| `feedbackId` | Server-generated opaque id. |
| `createdAt` / `updatedAt` | Server timestamps only. |
| `source` | Controlled enum: `in_app_form`, `admin_import`, `support_triage`, `preview_review`. |
| `environment` | Controlled enum: `beta_preview`, `staging`, `production_after_approval`. |
| `routeKey` | Known route or route group, for example `/dashboard` or `/mobile/missionen`. |
| `featureId` | Existing feature id from `project-register/features.json` where possible. |
| `category` | Controlled enum: `bug`, `usability`, `content`, `performance`, `accessibility`, `idea`, `safety_flag`, `other`. |
| `sentiment` | Controlled enum: `positive`, `neutral`, `negative`, `mixed`, `unknown`. |
| `severity` | Controlled enum: `low`, `medium`, `high`; critical issues require admin safety review. |
| `message` | User-provided text after clear sensitive-data warning and length limit. |
| `tags` | Small controlled tag array, not open-ended personal labels. |
| `userRef` | Optional pseudonymous user reference only with auth context and explicit consent. |
| `contactAllowed` | Boolean controlled by separate contact consent. |
| `contactRef` | Optional reference to a separate support/contact system; never agent-readable. |
| `consent` | Snapshot of feedback storage, product-review use, and optional contact consent. |
| `moderation` | Admin-only status, redaction flags, and review notes. |
| `agentSummaryEligible` | False until reviewed/redacted or aggregated. |

## Forbidden fields and content

Feedback events must not store:

- Raw health data, diagnoses, symptoms, injuries, medications, biometric readings, heart rate, sleep, weight, or wearable raw streams.
- Child or minor identity details, school/class identifiers, guardian contact details, or precise ages.
- Precise GPS, address, route history, beacon data, Wi-Fi/Bluetooth identifiers, or persistent location traces.
- Camera images, video, audio, AR captures, face/body scans, or biometric templates.
- Wallet addresses, private keys, token/NFT holdings, payment details, payout data, betting/staking information, or purchase records.
- Mission-completion evidence, anti-cheat evidence, reward authorization signals, or final ledger decisions.
- Secrets, API keys, auth tokens, session identifiers, IP addresses, device fingerprints, advertising ids, or third-party analytics identifiers.
- Raw user feedback or user data in agent reports, PR descriptions, task summaries, or public documentation.

## Consent requirements

### Anonymous feedback

Anonymous feedback may be allowed in a future implementation if the UI provides:

- clear notice that the message is stored for product improvement,
- a warning not to enter health, child, location, camera, biometric, wallet, payment, betting, reward evidence, or other sensitive data,
- a deletion/contact limitation notice because no account reference may exist.

### Identified feedback

Identified feedback is review-required and should require:

- authenticated context,
- explicit feedback storage consent,
- pseudonymous `userRef` instead of directly exposed identity,
- deletion/export path,
- admin-only access to any contact linkage.

### Contact follow-up

Contact follow-up must be optional and separate from product-feedback storage consent. Contact references must not be included in agent-readable summaries.

### Analytics and behavior tracking

This plan does not approve analytics or behavior tracking. Any future analytics, heatmap, session replay, or third-party tracking requires a separate privacy review, separate consent design, and explicit approval.

## Retention and deletion notes

Recommended starting policy for future review:

- Raw feedback default retention: 180 days.
- Aggregated non-identifying summaries: up to 730 days.
- Deletion/export request target handling: 30 days.
- Accidental sensitive data: redact or delete as soon as detected.
- Aggregates may persist only when they cannot reasonably identify a user.

## Agent-readable summary format

Future agents may only read anonymized aggregate documents, not raw feedback. A summary can contain:

```json
{
  "period": "2026-W20",
  "routeKey": "/mobile/missionen",
  "featureId": "FEATURE-MISSIONS",
  "theme": "Users need clearer mission progress wording",
  "category": "usability",
  "sentimentTrend": "mixed-negative",
  "countBucket": "5-10",
  "impact": "medium",
  "recommendedExistingTask": "todolist/WORK_MAP.md#Missionen",
  "requiresHumanDecision": false
}
```

This example is synthetic and contains no real user data.

Agent-readable summaries must not contain:

- raw quotes,
- names,
- user ids,
- contact details,
- exact small counts,
- unique incidents that could identify a user,
- sensitive attributes or protected/special-category data.

## Future API route proposal

Proposed route: `POST /api/feedback/submit`  
Status: proposal only / not implemented in this task

Future requirements:

1. Validate payload schema and controlled enums.
2. Enforce message length limits.
3. Reject or quarantine forbidden-field indicators.
4. Add server timestamps only.
5. Allow anonymous feedback only with clear notice.
6. Allow identified feedback only after explicit consent and pseudonymous user reference.
7. Rate-limit submissions and apply abuse protection.
8. Write to Firestore only through server authority.
9. Keep direct client writes forbidden in Firestore rules.
10. Avoid third-party analytics, session recording, and tracking identifiers.
11. Require privacy/security review before production activation.

## Future admin review flow

1. Receive feedback through the future server API or manual preview review.
2. Validate schema, length, route key, feature id, and forbidden-field indicators.
3. Store raw feedback in an admin-only pending state.
4. Admin reviews and redacts accidental sensitive data.
5. Admin classifies category, severity, feature, route, and whether human decision is required.
6. Safety, compliance, privacy, economy, reward, child/youth, or sensitive-data items are escalated for human decision before product work.
7. Reviewed feedback is aggregated into clusters with a minimum cluster size of 5.
8. Only aggregated `userFeedbackSummaries` are made available to future agents.
9. Future agents map themes to existing TODO/register entries before creating any new task.

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/CURRENT_PROJECT_STATE.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md`, `project-register/feedback-analytics-loop.json`, `project-register/user-feedback.json` und diese Datei. Implementiere noch keine Live-Tracking- oder Feedback-Writes ohne explizite Freigabe. Wenn Feedback spaeter ausgewertet wird, nutze nur aggregierte, anonymisierte `userFeedbackSummaries`, verknuepfe Erkenntnisse mit bestehenden TODOs/Registereintraegen und eskaliere sicherheits-, compliance-, privacy-, economy-, reward-, child- oder sensitive-data-bezogene Themen an menschliche Reviewer.
