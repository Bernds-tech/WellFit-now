# Beta-1 Admin Mission Evidence Review Queue

Status: implemented on branch `runtime/admin-mission-evidence-review-queue`; merge requires green Build and focused Beta-1 emulator checks.

## Added

- Admin-only callable to list mission evidence by review status.
- Queue response contains only bounded operational metadata, not raw metadata values, images, videos, or Storage content.
- Dedicated `/admin/beta1` review queue for pending evidence.
- Explicit decisions: approved, rejected, or needs-more-evidence.
- UI blocks approval after metadata-only review and requires an external, stored-artifact, or emulator/QA verification method plus a written reason.
- Existing `adminReviewMissionEvidence` remains the only write path and records an audit event.
- Focused emulator coverage for admin-only listing, privacy-minimized queue output, status transitions, and approved/pending filtering.

## Boundaries

- Evidence upload itself grants no WFXP and no mission completion.
- The queue does not display raw protected evidence.
- No Firebase deploy or production data write is part of this branch.
- Token, payment, cashout, NFT, and blockchain functions remain disabled.

## Next product step after merge

Use the same server-authoritative approach for the dashboard Buddy food sink: published WFXP shop item -> purchase intent -> server ledger debit -> inventory/consumable effect, with no direct browser writes to `users.points` or `users.avatar`.
