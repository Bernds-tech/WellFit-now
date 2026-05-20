# Beta-1 Seed Demo Content Plan

Status: planning + static template basis (no automatic writes)
Date: 2026-05-20
Branch context: `runtime/beta1-seed-demo-content-and-test-users`

## 1) Ziel
Demo-Content fuer die erste geschlossene Beta-1 Testphase mit **25-50** Testern vorbereiten, ohne produktive Firebase Writes aus diesem PR.

## 2) Regionen
- Wien
- Niederoesterreich

## 3) Demo-Missionen (planned_seed_template)

| missionKey | title | type | region | targetAudience | rewardXp | evidenceType | safetyNotes | childAllowed | status |
| --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- |
| beta1-vie-move-001 | Vienna Ring Walk Intro | movement | vienna | adult | 120 | photo_optional | daylight only, public pathways | true | planned_seed_template |
| beta1-vie-learn-001 | Museumsquartier Learning Loop | learning | vienna | family | 90 | quiz_check | no road crossing challenge | true | planned_seed_template |
| beta1-vie-family-001 | Prater Family Team Route | family | vienna | family | 140 | checkpoint_visit | guardian supervision for children | true | planned_seed_template |
| beta1-noe-nutri-001 | St. Poelten Healthy Snack Hunt | nutrition | lower-austria | adult | 80 | checklist | no store purchase required | true | planned_seed_template |
| beta1-vie-play-001 | Safe Playground Discovery | playground | vienna | child_with_guardian | 110 | guardian_confirm | no child standalone participation | true | planned_seed_template |
| beta1-noe-culture-001 | Melk Culture Steps | culture | lower-austria | family | 100 | photo_optional | public landmark area only | true | planned_seed_template |
| beta1-vie-break-001 | Office Active Break 10 | active_break | vienna | adult | 60 | timer_check | low intensity, stop if discomfort | false | planned_seed_template |
| beta1-noe-beta-001 | Lower Austria Beta App Flow | beta_test | lower-austria | adult | 70 | in_app_form | report UX blockers only | false | planned_seed_template |
| beta1-vie-move-002 | Donaukanal Light Jog | movement | vienna | adult | 130 | distance_check | avoid night sessions | false | planned_seed_template |
| beta1-noe-family-002 | Tulln Family Mission Trial | family | lower-austria | child_with_guardian | 125 | checkpoint_visit | guardian must accompany child | true | planned_seed_template |

## 4) Demo-Checkpoints

| checkpointKey | title | region | safeLocationNotes | childSuitable | status |
| --- | --- | --- | --- | --- | --- |
| cp-vie-demo-01 | Vienna Public Square Intro | vienna | central public square, no traffic lane challenge | true | planned_seed_template |
| cp-vie-demo-02 | Vienna Park Loop Gate | vienna | park entrance with open visibility | true | planned_seed_template |
| cp-vie-demo-03 | Vienna Museum Outer Point | vienna | public cultural district outdoor area | true | planned_seed_template |
| cp-noe-demo-01 | Lower Austria City Center Point | lower-austria | public center, no private property | true | planned_seed_template |
| cp-noe-demo-02 | Lower Austria Family Park Point | lower-austria | family park, daylight use only | true | planned_seed_template |

> Hinweis: Keine exakten sensiblen Koordinaten, keine privaten Orte.

## 5) Demo-Reality-Glitch-Events

| glitchKey | regionId | locationIds (demo IDs) | durationMinutes | multiplierCap | maxParticipants | safetyNotes | status |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
| glitch-vie-demo-01 | vienna | vie-demo-loc-01,vie-demo-loc-02 | 10 | 3 | 40 | public safe zone only, admin cancel ready | planned_seed_template |
| glitch-noe-demo-01 | lower-austria | noe-demo-loc-01,noe-demo-loc-02 | 8 | 4 | 35 | no night run, guardian for child audience | planned_seed_template |
| glitch-vie-demo-02 | vienna | vie-demo-loc-03 | 6 | 2 | 25 | soft test event, monitor crowd density | planned_seed_template |

## 6) Demo-ShopItems

| itemKey | title | category | priceWfxp | rarity | childSuitable | status |
| --- | --- | --- | ---: | --- | --- | --- |
| shop-beta1-water-badge | Hydration Badge | booster_cosmetic | 45 | common | true | planned_seed_template |
| shop-beta1-streak-frame | Streak Frame Blue | cosmetic_frame | 120 | uncommon | true | planned_seed_template |
| shop-beta1-family-pass | Family Mission Pass Skin | mission_cosmetic | 160 | uncommon | true | planned_seed_template |
| shop-beta1-map-pin | Vienna Map Pin Style | ui_cosmetic | 80 | common | true | planned_seed_template |
| shop-beta1-sprint-tag | Sprint Tag Orange | profile_tag | 95 | common | true | planned_seed_template |
| shop-beta1-focus-aura | Focus Aura Lite | avatar_cosmetic | 210 | rare | true | planned_seed_template |
| shop-beta1-noe-badge | Lower Austria Explorer Badge | badge_cosmetic | 140 | uncommon | true | planned_seed_template |
| shop-beta1-beta-ribbon | Closed Beta Ribbon | profile_tag | 60 | common | true | planned_seed_template |

## 7) Demo-Avatar/Cosmetic-Ideen

| avatarItemKey | title | effectType | priceWfxp | childSuitable | status |
| --- | --- | --- | ---: | --- | --- |
| avatar-beta1-cap-vienna | Vienna Runner Cap | cosmetic_only | 150 | true | planned_seed_template |
| avatar-beta1-shirt-family | Family Quest Shirt | cosmetic_only | 170 | true | planned_seed_template |
| avatar-beta1-glow-soft | Soft Glow Outline | cosmetic_only | 220 | true | planned_seed_template |
| avatar-beta1-backpack-lite | Lite Trail Backpack | cosmetic_only | 190 | true | planned_seed_template |
| avatar-beta1-shoes-neon | Neon Walk Shoes | cosmetic_only | 200 | true | planned_seed_template |

## 8) Akzeptanzkriterien
- Admin kann Content manuell ueber bestehende Callables vorbereiten.
- Dashboard zeigt published missions in den Read-Projections.
- Shop/Inventory bleibt WFXP-only.
- Keine echten personenbezogenen Daten im Seed-Plan.
- Keine Production-Firebase-Writes aus diesem PR.
