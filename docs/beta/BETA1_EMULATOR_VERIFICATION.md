# Beta-1 Emulator Verification

Status: **Green / verified in GitHub Actions after PR #178 merge**
Last checked: **2026-05-20 UTC**
Checked workflow: `.github/workflows/beta1-emulator-tests.yml` / **Beta 1 Emulator Tests**
Evidence scope: **PR #178 merged with successful CI checks**

## Verified evidence

- PR #178 merged successfully.
- Merge commit SHA: `f3643800272dd152b3d6a6d3811a6229522e7cc3`.
- Successful head commit SHA before merge: `e79f21ffbd5558aa8efa5936093faf63d522b7a4`.
- GitHub Actions check results for this PR context:
  - **Build:** success
  - **Beta 1 Emulator Tests:** success
  - **Job:** `Beta-1 Firestore and callable emulator tests` success
  - **Step:** `Run focused Beta-1 emulator suites` success

## Interpretation

The previous local/Codex blocker from earlier runs (Firestore Emulator JAR download `403 Forbidden`, followed by `ECONNREFUSED 127.0.0.1:8080`) is still possible in some local environments.

However, for PR #178 in GitHub Actions this blocker was **not** blocking anymore: the Firestore Emulator started, the Functions Emulator started, and the focused Beta-1 emulator test run completed green.

## Focused suite verification

The focused command path in CI ran through `beta1:test:emulator`, which executes:

- `npm --prefix functions run beta1:rules`
- `npm --prefix functions run beta1:callable`

Result in GitHub Actions for PR #178: **both suites passed within the green focused emulator run**.

## Safety and production-resource confirmation

This Beta-1 emulator verification remained emulator/demo-only:

- no real Firebase production resources
- no secrets required
- no deploys triggered
- no production Firebase project IDs used

## Security stance confirmation

`glitchSafetyRules` remains intentionally client-blocked (no client read/write).

The earlier failure was caused by an incorrect test expectation, not by a Firestore Rules weakness. The test was corrected without loosening Firestore Rules.

## Conclusion

Beta-1 emulator verification is now **green and verified in GitHub Actions** for PR #178 evidence, while the old `403` issue remains categorized as a **local/Codex environment-specific risk**, not the current CI blocker.
