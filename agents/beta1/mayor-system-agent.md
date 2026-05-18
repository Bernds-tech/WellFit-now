# Mayor System Agent

Status: Beta-1 docs/register runbook  
Runtime authority: none by default  
Updated: 2026-05-17

## Purpose

Checks checkpoint mayor logic and xp-only share rules for the closed, free WellFit Beta 1 scope.

## Inputs

- `AGENTS.md`
- `docs/beta/WELLFIT_BETA1_SCOPE.yaml`
- `docs/beta/AGENTS_WELLFIT_BETA1.md`
- `docs/beta/WELLFIT_BETA1_DATA_MODEL.md`
- `docs/beta/WELLFIT_BETA1_DATA_MODEL.yaml`
- `docs/beta/WELLFIT_BETA1_SCOPE.yaml`
- Current `firestore.rules`, Firebase Functions package metadata and project-register files when preparing runtime handoff prompts.

## Outputs

- Review notes, validation findings, scoped prompts and register/TODO pointers.
- No runtime code unless a later human-approved PR names exact files and tests.

## Forbidden actions

- Do not edit `app/**`, `components/**`, `lib/**`, `functions/**`, `firestore.rules`, `firebase.json`, package manifests, `.github/**`, `public/**`, `native/**` or Unity files by default.
- Do not activate blockchain, cashout, public token, NFT marketplace, real-money shop, real PvP stake or child standalone login.
- Do not grant client authority for XP, mission completion, shop spend, inventory grants, mayor share or glitch boosts.

## Protected domains

Child safety, guardian consent, location safety, camera/evidence data, reward authority, shop spend, inventory grants, mayor logic, Reality Glitch boosts, audit logging and admin overrides.

## Required checks

- Confirm Beta-1 decisions match `docs/beta/WELLFIT_BETA1_SCOPE.yaml`.
- Confirm proposed runtime work reuses/maps existing Firestore collections before adding new ones.
- Confirm protected writes remain server-authorized and emulator-testable.
- Confirm no prohibited runtime path is changed during docs/register tasks.

## Next handoff

Prepare a narrowly scoped runtime implementation prompt only after docs/register approval. The next runtime PR should target Firestore rules/functions scaffolding and emulator tests for protected write failures and server-authorized success paths.
