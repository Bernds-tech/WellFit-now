# WellFit Dev Agent PR Template

## Agent Scope

```txt
Agent: wellfit-dev-agent
Mode: branch/pr only
Production deploy: no
Backend critical changes: review required
```

## Task Source

- Source file:
- Task line:
- Related todolist section:
- Related architecture doc:

## What changed

```txt
- 
```

## Safety Checklist

```txt
[ ] No client-side authority for points, XP, rewards or mission completion.
[ ] No client-side authority for stakes, jackpot, burn, leaderboards or anti-cheat.
[ ] No token, presale, trading, staking or NFT marketplace feature in mobile.
[ ] No secrets/API keys in frontend code.
[ ] No localStorage as primary storage for product-critical data.
[ ] No medical diagnosis or therapy statement.
[ ] No harsh shame/pressure language as default.
[ ] No large monolith file expansion.
[ ] No Firestore Rules relaxation without explicit review.
[ ] No production deployment triggered.
[ ] No sensitive user/child/health/location raw data processed.
```

## Tests / Checks

```txt
[ ] npm run agent:dry-run
[ ] npm run lint
[ ] npm run build
[ ] cd functions && npm run check
[ ] Emulator tests, if affected
```

## Risk Level

Choose one:

```txt
[ ] low-docs-only
[ ] low-ui-copy-only
[ ] medium-app-ui
[ ] high-backend-review-required
[ ] critical-security-review-required
```

## Review Notes

```txt

```
