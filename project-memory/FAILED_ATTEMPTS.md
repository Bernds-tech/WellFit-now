# WellFit-now Failed Attempts / Do-Not-Repeat Log

## WFN-FAIL-001
- Date: 2026-08-19
- Status: DONE
- Area: Project execution discipline
- Attempt: Rely on chat/model memory alone for small implementation attempts.
- Result: Duplicate troubleshooting or repeated setup can occur.
- Cause: Conversational context is not a durable execution ledger.
- Decision: Mandatory project-memory preflight/postflight.
- Do not repeat: Start from repository state, ledger and prior attempts, not remembered conversation alone.

## WFN-FAIL-002
- Date: 2026-08-19
- Status: DONE
- Area: Repository boundaries
- Attempt: Allow web, visual and native AR work to blur into one implementation stream.
- Result: Risk of duplicate UI/architecture and unclear source ownership.
- Cause: Cross-project scope not encoded as an operational rule.
- Decision: Keep WellFit, WellFit-now and WellFit-Buddy roles explicit.
- Do not repeat: Cross repository boundaries only through an accepted bridge task/change request.

## WFN-FAIL-003
- Date: 2026-09-03
- Status: CORRECTED_PENDING_VERIFICATION
- Area: Partner-operation rate-limit emulator test
- Attempt: Seed the currently discovered fixed-window counter and immediately assert that two parallel attempts stop at the exact limit.
- Result: Beta 1 Emulator #177 crossed the real minute boundary between seeding and the second attempt, so the valid new-window counter made the assertion fail although each window remained bounded.
- Cause: the test assumed wall-clock window stability without reserving enough time before the boundary.
- Decision: explicitly enter a rate window with at least eight seconds remaining, create/select that exact ISO window and then execute the parallel boundary assertion.
- Do not repeat: never assert a fixed-window boundary against an unspecific or nearly expired wall-clock bucket.
