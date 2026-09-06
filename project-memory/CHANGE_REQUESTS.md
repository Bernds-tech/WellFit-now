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

## WFN-CR-006
- Date: 2026-09-05
- Status: ACCEPTED_FOR_IMPLEMENTATION
- Source: owner direction and supplied Meshy model
- Idea: replace the flat Rudi presentation with a real autonomous 3D humanoid that appears to live on the website, moves independently from scrolling, speaks, points, passes in front of and behind content, and uses small props during rest/eating scenes.
- Classification: reversible graphical/Buddy-presentation bridge in the current physical web code
- Affected areas: public landing presentation and generated 3D assets only; no auth, backend, mission/reward, economy, location, camera or legal authority.
- Existing task/decision checked: WFN-AVATAR-PUPPET-001, WFN-XREPO-001, WFN-CR-005 and current Meshy workflow artifacts.
- Dependencies: WellFit remains graphical authority and WellFit-Buddy remains Buddy-presentation authority. Public ChatGPT Site publication is a separate source/release path.
- Decision: use the successfully generated textured 24-bone Meshy humanoid and named animation clips, keep the cape as a separately simulated mesh, provide WebGL/reduced-capability fallbacks, and keep expensive Meshy generation manually triggered.
- Related task: WFN-RUDI-3D-001

## WFN-CR-007
- Date: 2026-09-05
- Status: SUPERSEDED_BY_WFG_CR_008
- Source: owner live visual review
- Idea: Rudi must not feel attached to a separate viewport or to scrolling. He should remain at his content-world position while the page scrolls, then visibly climb, jump, walk or run after the user. The 3D version must also restore escalating pointer emotion around login/register and make the table scene unmistakably visible.
- Classification: historical corrective graphical/Buddy-presentation bridge
- Affected areas: public landing Rudi locomotion, CTA attention and prop staging only.
- Existing task/decision checked: WFN-RUDI-3D-001, WFN-CR-006, PR #401 and owner video/live review.
- Dependencies: preserve autonomous behavior independent of pointer input; pointer attention supplements rather than drives Rudi's life cycle. Public ChatGPT Site publication remains a separate source/release path.
- Historical decision: use a body-level transparent overlay, viewport-safe body bounds, scroll lag/catch-up, direct CTA attention and coffee/table/lounge staging; Site v105 synchronized this generation.
- Superseded by: owner graphical authority `WFG-CR-008` on 2026-09-05. The accepted current architecture is DOM-surface authority with **no viewport clamp**, full offscreen departure and grounded walk/climb routes. The viewport-safe body clamp, Site-v105 renderer generation and old props path are historical only.
- Related task: WFN-RUDI-3D-001 / WFG-RUDI-WORLD-001

## WFN-CR-008
- Date: 2026-09-06
- Status: MERGED_INTO_EXISTING_TASK
- Source: WellFit graphical authority `WFG-CR-008` plus merged WellFit-now PRs #401/#402
- Idea: bind the technical landing bridge to the current graphical DOM-world contract and close obsolete viewport/prop follow-ups after repository verification.
- Classification: cross-repository reconciliation of an existing implementation task
- Affected areas: Rudi technical Project Memory only; no new runtime scope.
- Existing task/decision checked: WFN-RUDI-3D-001, WFN-CR-006/007, WFG-CR-008, PR #401, PR #402 and WellFit `RUDI_SITE_SYNC_MANIFEST.json`.
- Dependencies: WellFit remains graphical authority and owns exact Site synchronization/visual acceptance; WellFit-now remains only the physical technical host until `WF-MIG-001` migrates the landing.
- Decision: technical Rudi is complete at hardened merge `b07d39938aeab4e32eddac7d19b8e15e22afacb7`. Do not restart viewport clamp, Site-v105 review, coffee/table/lounge props, finger-rig or custom-motion generation as current work. Only a new owner-approved scope after DOM-world Site acceptance may reintroduce those ideas.
- Related task: WFN-RUDI-3D-001 / WFG-RUDI-WORLD-001

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
