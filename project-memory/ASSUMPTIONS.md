# Assumption Verification Register

Critical assumptions used to plan or execute work must be recorded here before they are relied upon.

Statuses: `NEEDS_VERIFICATION`, `VERIFIED`, `INVALIDATED`, `SUPERSEDED`.

Each active assumption must include:
- Assumption ID
- Date / Updated
- Related task/change ID
- Risk level
- Assumption
- Why it matters
- Verification source/evidence
- Status
- Recheck trigger
- Action if false

Template:
```text
## ASM-YYYY-NNN
- Date:
- Updated:
- Related task:
- Risk: R1|R2|R3|R4
- Assumption:
- Why it matters:
- Verification source/evidence:
- Status: NEEDS_VERIFICATION
- Recheck trigger:
- Action if false:
```

Do not silently delete invalid assumptions. Preserve them as `INVALIDATED` or `SUPERSEDED` so the same mistaken premise is not reused later.
