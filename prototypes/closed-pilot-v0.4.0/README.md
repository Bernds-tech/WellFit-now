# WellFit Closed Pilot v0.4.0 – Integration Anchor

This directory records the independently validated closed-pilot prototype that was built before the existing `WellFit-now` repository baseline was connected.

## Status

- Local release tag: `wellfit-pilot-v0.4.0`
- Local commit: `868497f`
- Release archive SHA-256: `c65db1a095161801308e502326c041e2238f4035fba08176148cc59545f748bb`
- Validation: 25 automated tests, TypeScript check, JavaScript syntax check, HTML/YAML checks, runtime smoke test, backup/restore test, clean production dependency audit.

## Prototype capabilities

- Fastify/TypeScript API
- account, session, consent, audit and privacy functions
- persistent pilot storage and migration support
- activity verification and anti-duplication controls
- buddy XP, level, energy, mood and evolution
- streaks and achievements
- checkpoint, geofence and mayor scoring
- ordered quest routes with quiz and riddle stations
- one-time completion rewards and idempotency collision protection
- partner offers and redemption codes
- user and administration web surfaces
- Docker, CI, backup and PostgreSQL target migrations

## Integration rule

This prototype must **not** replace the existing Next.js/Firebase application or create a second production shell. Its functions should be mapped into the canonical modules of `WellFit-now` in small, reviewed tasks, following `AGENTS.md` and the repository registers.

The original release archive remains separately retained outside GitHub until a binary-capable upload channel or authenticated Git transport is available. No production deployment, Firebase write, reward authority, token logic or protected-data expansion is authorized by this integration anchor.
