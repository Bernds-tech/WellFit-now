# Beta-1 Client Read Projections Plan

Status: planning-only handoff artifact (no runtime changes)
Date: 2026-05-20
Branch context: `plan/beta1-server-api-read-projections-admin-panel`

## 1) Ziel
Die App soll **nur sichere Read-Projections** lesen und anzeigen, ohne jemals finale Produktautoritaet fuer XP, Missionsabschluss, Inventory, Mayor-Share, Reality-Glitch-Boosts oder Admin-Flows zu erhalten.

## 2) Erlaubte Client-Read-Bereiche
Folgende Bereiche sind als Read-only Client-Projections vorgesehen:

- Published `missions`
- Published `missionLocations`
- Active `regions`
- Safe `glitchEvents`
- Published `shopItems`
- Published `avatarDefinitions`
- User/guardian-owned `xpWallets`
- User/guardian-owned `xpLedgerEvents`
- User/guardian-owned `missionAttempts`
- User/guardian-owned `missionEvidence`
- User/guardian-owned `missionCompletions`
- User/guardian-owned `userInventory`
- User/guardian-owned `userAvatars`
- Guardian-linked `childProfiles` (read-only)
- Guardian-linked child profile progress/read projections

## 3) Verbotene Client-Autoritaet
Der Client darf **nicht** final entscheiden oder final schreiben fuer:

- XP grants
- XP spend finalization
- mission completion authorization
- final evidence review/approval
- inventory grants
- mayor assignment
- mayor share payout
- glitch boosts
- admin actions
- child public profile exposure
- live child location exposure

## 4) Mapping (UI/View -> Source -> Risiko)

| UI/Client View | Callable/Collection | Read-only? | Server-authoritative source | Risk | Needed tests |
| --- | --- | --- | --- | --- | --- |
| Profile overview | `users/{uid}` safe profile projection | Yes | Auth + Rules + server-written profile constraints | medium (PII boundary) | owner-only read tests, no child-standalone visibility |
| XP wallet card | `xpWallets/{ownerId}` or wallet projection doc | Yes | `beta1XpLedger` projection updates | high (economy trust) | read allowed owner/guardian only, no client write path |
| XP ledger list | `xpLedgerEvents` filtered by owner | Yes | append-only server ledger events | high | no tamper/no delete from client, sorted pagination checks |
| Mission list | `missions` (published only) | Yes | admin/server publish flow | medium | published-only query checks, no draft leakage |
| Mission detail | `missions/{id}` + `missionLocations/{id}` | Yes | server-published mission + location safety | high (location safety) | safe-location flag checks, child-safe filtering |
| Attempt status | `missionAttempts/{attemptId}` owner-scoped | Yes | `beta1Missions` attempt lifecycle | high | owner/guardian scope checks, state mutation blocked client-side |
| Evidence history | `missionEvidence` owner/guardian scope | Yes | server evidence ingest/review path | high (camera/evidence) | no cross-user read, review fields server-only |
| Completion history | `missionCompletions` owner/guardian scope | Yes | server completion authority | high | client cannot set completion/final reward fields |
| Inventory list | `userInventory` owner/guardian scope | Yes | `beta1ShopInventory` grant/spend authority | high | no client grant/equip authority bypass |
| Avatar state | `userAvatars` owner/guardian scope | Yes | server projection from valid events | medium | owner scope + no server-authority field edits |
| Shop catalog | `shopItems` published only | Yes | admin publish + server pricing policy | medium | no hidden/unpublished items; no real-money fields |
| Region/checkpoint list | `regions` + checkpoint projections | Yes | admin/server managed rollout + mayor runtime | medium | only active/safe regions, no mayor authority from client |
| Glitch event list | `glitchEvents` safe/active only | Yes | `beta1RealityGlitch` scheduling/cancel authority | high | cancelled/unsafe events hidden, no boost authority |
| Guardian child list | `guardianChildLinks` + `childProfiles` safe fields | Yes | `beta1GuardianChild` + consent policy | high (child safety) | guardian-linked only, no public child discoverability |
| Child progress projection | child-scoped wallet/attempt/completion read projection | Yes | server-derived aggregate projections | high | guardian consent/link required, no live location fields |

## 5) Erste empfohlene Client-Read Reihenfolge
1. Authenticated user profile
2. XP wallet projection
3. XP ledger list
4. mission list
5. mission detail
6. attempt status
7. inventory list
8. shop items
9. checkpoint list
10. glitch event list
11. guardian child profile list

## 6) Offene Fragen
- Welche exakten App-Routen (web/mobile) werden zuerst angebunden?
- Welche bestehenden Screens sind bereits mit kompatiblen Datenmodellen vorhanden?
- Welche Views liefern den hoechsten Beta-1 Nutzen bei geringstem Risiko zuerst?
- Welche Read-Projections fehlen noch als sichere, serverseitig abgeleitete Darstellung?

## Guardrails (verbindlich)
- WellFit-XP/WFXP bleibt internal-only ohne monetary/crypto value.
- Keine Blockchain, kein WFT/SUI Runtime-Import in diesem Schritt.
- Keine NFTs, kein Cashout, kein Real-Money-Shop, kein IAP.
- Kein DePIN, kein PvP-Stake.
- Keine oeffentlichen Kinderprofile, kein Child Standalone Login.
- Keine clientseitige Autoritaet fuer XP, Mission, Shop, Inventory, Mayor, Glitch oder Admin.
