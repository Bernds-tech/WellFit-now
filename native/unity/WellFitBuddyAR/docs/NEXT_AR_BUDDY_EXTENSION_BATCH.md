# Next AR Buddy Extension Batch

Status: completed for current Android retest batch.

## Goal

Prepare the next larger AR-Buddy test batch before another Android build.

## Added in this batch

1. Visible auto-return countdown.
2. Auto-return last action label.
3. Camera-to-buddy distance display.
4. Buddy found / not-found display.
5. Near/far companion thresholds in diagnostics.
6. Debug overlay collapse toggle.
7. Last rejection reason display.
8. Auto-return safe cooldown display.
9. Request counter.
10. Reject counter.
11. Diagnostics reset function.
12. Diagnostics reset button.
13. Fast timing preset.
14. Normal timing preset.
15. Timing buttons in debug overlay.
16. Clearer German Auto-Return status texts.
17. Far-only mode label.
18. Manual return label.
19. Controller-missing error labels.
20. More readable debug panel box.
21. Test distance preset.
22. Product distance preset.
23. Distance preset buttons in debug overlay.
24. Near/Far threshold values in diagnostics.
25. Buddy idle breathing / bobbing motion.
26. Idle motion toggle.
27. Buddy look-at-camera distance guard.
28. Look-at-camera toggle.
29. Navigation diagnostics: move action, moving state, target surface, distance, height difference, reject reason.
30. Anchor diagnostics: anchor status, raycast status, surface id, hit position.
31. Native bridge event diagnostics: event count, last event name, shortened payload preview.
32. Ability diagnostics: enabled capabilities, started/rejected counts, last event, denied capability.
33. Ability toggles for demo mode.
34. Ability test buttons for scan, fetch clue, climb, jump, carry, point.
35. KI guide diagnostics: current mission, reason, last guide event, event count.
36. KI guide debug buttons: walk mission, scan mission, missing jump boost, clear guide.
37. Debug overlay pagination.
38. Quick page selection: return, visual, abilities, guide.
39. Diagnostics show/hide toggle.
40. Safer start-event behavior: action-start events only after navigation actually starts.

## Current retest focus

1. Pull latest branch.
2. Rebuild Android ARCore test build.
3. Verify Unity compiles after the accumulated controller updates.
4. Test page 1: placement, move, buddy recall, auto-return, timing, distance presets.
5. Test page 2: idle breathing and look-at-camera toggles.
6. Test page 3: capabilities off/on, scan/fetch/climb/jump/carry/point events.
7. Test page 4: guide walk mission, scan mission, missing capability, clear guide.
8. Confirm no Unity path authorizes rewards, XP, points, token, mission completion, leaderboard, jackpot, burn or anti-cheat.

## Still planned after retest

1. Compile-fix any Unity errors found by Android build.
2. Replace debug OnGUI with a cleaner production-safe dev overlay or hide it behind a dev flag.
3. Add tap target visual marker.
4. Add surface hit quality label.
5. Add plane missing hint text.
6. Add movement policy helper.
7. Add duplicate return request guard if still needed after navigation/anchor testing.
8. Add safer re-anchor after return/move completion.
9. Add occlusion / visibility notes and later implementation.
10. Add real companion-radius integration after stable retest.
11. Split debug overlay from product controllers if UI becomes too large.
12. Update scenes/prefabs only after compile is confirmed.

## Hard boundary

Unity remains visual only. No rewards, XP, points, token logic, mission completion, leaderboard, jackpot, burn, NFT, WFT or anti-cheat authority in Unity. Unity reports AR/Buddy events only. App/backend remain authority.
