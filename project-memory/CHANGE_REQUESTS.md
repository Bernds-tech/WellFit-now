# WellFit-now Change Requests

New owner ideas are captured here before changing active scope.

## WFN-CR-001
- Date: 2026-08-19
- Status: ACCEPTED
- Source: owner
- Idea: Add durable project-memory, duplicate checking and idea intake for ongoing development.
- Classification: Governance capability.
- Affected areas: engineering workflow and repository governance.
- Existing task/decision checked: WFN-MEM-001
- Decision: Implement Project Memory Protocol v1.
- Related task: WFN-MEM-001

## WFN-CR-002
- Date: 2026-08-20
- Status: MERGED_INTO_EXISTING_TASK
- Source: owner
- Idea: WellFit-now is the technical part, WellFit is graphical, WellFit-Buddy is the Buddy.
- Classification: cross-repository responsibility clarification
- Affected areas: technical ownership, graphical/Buddy migration boundaries, contracts/dependencies.
- Existing task/decision checked: WFN-XREPO-001 and V9 master.
- Dependencies: matching reconciliation in WellFit and WellFit-Buddy.
- Decision: general technical application/mobile logic remains WellFit-now; only Buddy-specific behavior/presentation/AR belongs in WellFit-Buddy.
- Related task: WFN-XREPO-001

## WFN-CR-003
- Date: 2026-08-20
- Status: ACCEPTED_FOR_RECONCILIATION
- Source: current GitHub state
- Idea: classify stale open PRs instead of leaving them as ambiguous unfinished work.
- Classification: governance/PR hygiene
- Affected areas: PR #13, #263, #363, #365, #376, #364.
- Existing task/decision checked: current main, finishline, Task Ledger, canonical truth.
- Dependencies: this reconciliation must preserve unique historical truth before closure.
- Decision: close #13/#263/#363/#365/#376 as superseded after this reconciliation merges; keep #364 deferred for explicit owner-reviewed future WFT decision.
- Related task: WFN-RECON-20260820

## WFN-CR-004
- Date: 2026-08-26
- Status: SUPERSEDED_BY_LIVE_VALIDATION
- Source: owner
- Idea: all WellFit mascot/avatar characters on the web should visually follow the pointer and show stronger attention when the pointer is over or activates important controls such as login/register CTAs.
- Classification: graphical interaction bridge in current physical web code
- Affected areas: web UI presentation only; no backend, reward, mission, auth authority or native Buddy AR behavior.
- Existing task/decision checked: WFN-XREPO-001, WFG-VIS-001, WF-CONTRACT-BUDDY-001 and current physical UI ownership drift.
- Dependencies: preserve WellFit graphical authority; implementation remains reversible while UI code is still physically hosted in WellFit-now.
- Decision: PR #387 whole-image transforms remain historical technical evidence but are not the accepted visual solution. Owner live validation on 2026-08-28 showed no visible movement on the actual ChatGPT Site and true head/body articulation is required.
- Related task: WFN-AVATAR-ATTN-001 / WFN-XREPO-001

## WFN-CR-005
- Date: 2026-08-28
- Status: ACCEPTED_FOR_IMPLEMENTATION
- Source: owner live validation + WFG-CR-007
- Idea: replace the flat whole-image cursor transform with a visibly articulated 2D puppet system where the character head moves independently from the body and attention targets important controls.
- Classification: corrective web presentation bridge
- Affected areas: existing web mascot/avatar rendering only; no backend, auth, mission, reward/economy, camera/location or native AR authority.
- Existing task/decision checked: WFN-AVATAR-ATTN-001, PR #387, closed superseded PR #388, WFG-CR-007, CTR-WFG-006 and WF-LOOP-005.
- Dependencies: WellFit remains graphical authority; the public ChatGPT Site remains a separate visual source and cannot be claimed updated by this branch. Existing transparent PNG assets may be rendered as overlapping head/body clips with per-asset pivots.
- Decision: create a shared articulated puppet engine. Head and body use separate layers from the same transparent PNG, with head-led pointer/CTA tracking, subtler torso lean, click/nod reaction, idle breathing, reduced-motion/coarse-pointer fallback and explicit per-asset crop/pivot configuration. Whole-image rotation is not accepted as head tracking.
- Related task: WFN-AVATAR-PUPPET-001 / WFG-AVATAR-PUPPET-001

## Intake template

```text
## WFN-CR-XXX
- Date: YYYY-MM-DD
- Status: NEW
- Source:
- Idea:
- Classification:
- Affected areas:
- Existing task/decision checked:
- Dependencies:
- Decision:
- Related task:
```
