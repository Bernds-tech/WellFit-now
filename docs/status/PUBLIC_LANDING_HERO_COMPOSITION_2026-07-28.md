# Public Landing Hero Composition — 2026-07-28

## Scope

This change corrects the first public landing-page section only.

## Implemented

- renders the supplied WellFit landscape above the section background instead of behind it;
- uses explicit positive z-index layers for landscape, overlays and content;
- restores a visible phone presentation and Buddy stage on desktop;
- keeps the existing public copy, CTA routes, feature cards and highlights;
- keeps mobile, login/register internals, Firebase, missions, WFXP authority, Buddy AI, dashboard, Unity and AR unchanged.

## Root cause

The previous hero used negative z-index layers inside a section with its own background. In the deployed composition the landscape could end up behind the section paint layer, producing a nearly black hero. The corrected composition uses explicit `z-0`, `z-10` and `z-20+` layers.

## Validation required

- Build
- Container Build and health endpoint
- Database Package Tests
- deployed desktop screenshot after automatic staging deployment
