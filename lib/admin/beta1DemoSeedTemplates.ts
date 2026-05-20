export const BETA1_DEMO_MISSIONS = [
  { missionKey: "beta1-vie-move-001", title: "Vienna Ring Walk Intro", type: "movement", region: "vienna", targetAudience: "adult", rewardXp: 120, evidenceType: "photo_optional", safetyNotes: "daylight only, public pathways", childAllowed: true, status: "planned_seed_template" },
  { missionKey: "beta1-vie-learn-001", title: "Museumsquartier Learning Loop", type: "learning", region: "vienna", targetAudience: "family", rewardXp: 90, evidenceType: "quiz_check", safetyNotes: "no road crossing challenge", childAllowed: true, status: "planned_seed_template" },
  { missionKey: "beta1-vie-family-001", title: "Prater Family Team Route", type: "family", region: "vienna", targetAudience: "family", rewardXp: 140, evidenceType: "checkpoint_visit", safetyNotes: "guardian supervision for children", childAllowed: true, status: "planned_seed_template" },
  { missionKey: "beta1-noe-nutri-001", title: "St. Poelten Healthy Snack Hunt", type: "nutrition", region: "lower-austria", targetAudience: "adult", rewardXp: 80, evidenceType: "checklist", safetyNotes: "no store purchase required", childAllowed: true, status: "planned_seed_template" },
  { missionKey: "beta1-vie-play-001", title: "Safe Playground Discovery", type: "playground", region: "vienna", targetAudience: "child_with_guardian", rewardXp: 110, evidenceType: "guardian_confirm", safetyNotes: "no child standalone participation", childAllowed: true, status: "planned_seed_template" },
  { missionKey: "beta1-noe-culture-001", title: "Melk Culture Steps", type: "culture", region: "lower-austria", targetAudience: "family", rewardXp: 100, evidenceType: "photo_optional", safetyNotes: "public landmark area only", childAllowed: true, status: "planned_seed_template" },
  { missionKey: "beta1-vie-break-001", title: "Office Active Break 10", type: "active_break", region: "vienna", targetAudience: "adult", rewardXp: 60, evidenceType: "timer_check", safetyNotes: "low intensity, stop if discomfort", childAllowed: false, status: "planned_seed_template" },
  { missionKey: "beta1-noe-beta-001", title: "Lower Austria Beta App Flow", type: "beta_test", region: "lower-austria", targetAudience: "adult", rewardXp: 70, evidenceType: "in_app_form", safetyNotes: "report UX blockers only", childAllowed: false, status: "planned_seed_template" },
  { missionKey: "beta1-vie-move-002", title: "Donaukanal Light Jog", type: "movement", region: "vienna", targetAudience: "adult", rewardXp: 130, evidenceType: "distance_check", safetyNotes: "avoid night sessions", childAllowed: false, status: "planned_seed_template" },
  { missionKey: "beta1-noe-family-002", title: "Tulln Family Mission Trial", type: "family", region: "lower-austria", targetAudience: "child_with_guardian", rewardXp: 125, evidenceType: "checkpoint_visit", safetyNotes: "guardian must accompany child", childAllowed: true, status: "planned_seed_template" }
] as const;

export const BETA1_DEMO_CHECKPOINTS = [
  { checkpointKey: "cp-vie-demo-01", title: "Vienna Public Square Intro", region: "vienna", safeLocationNotes: "central public square, no traffic lane challenge", childSuitable: true, status: "planned_seed_template" },
  { checkpointKey: "cp-vie-demo-02", title: "Vienna Park Loop Gate", region: "vienna", safeLocationNotes: "park entrance with open visibility", childSuitable: true, status: "planned_seed_template" },
  { checkpointKey: "cp-vie-demo-03", title: "Vienna Museum Outer Point", region: "vienna", safeLocationNotes: "public cultural district outdoor area", childSuitable: true, status: "planned_seed_template" },
  { checkpointKey: "cp-noe-demo-01", title: "Lower Austria City Center Point", region: "lower-austria", safeLocationNotes: "public center, no private property", childSuitable: true, status: "planned_seed_template" },
  { checkpointKey: "cp-noe-demo-02", title: "Lower Austria Family Park Point", region: "lower-austria", safeLocationNotes: "family park, daylight use only", childSuitable: true, status: "planned_seed_template" }
] as const;

export const BETA1_DEMO_GLITCH_EVENTS = [
  { glitchKey: "glitch-vie-demo-01", regionId: "vienna", locationIds: ["vie-demo-loc-01", "vie-demo-loc-02"], durationMinutes: 10, multiplierCap: 3, maxParticipants: 40, safetyNotes: "public safe zone only, admin cancel ready", status: "planned_seed_template" },
  { glitchKey: "glitch-noe-demo-01", regionId: "lower-austria", locationIds: ["noe-demo-loc-01", "noe-demo-loc-02"], durationMinutes: 8, multiplierCap: 4, maxParticipants: 35, safetyNotes: "no night run, guardian for child audience", status: "planned_seed_template" },
  { glitchKey: "glitch-vie-demo-02", regionId: "vienna", locationIds: ["vie-demo-loc-03"], durationMinutes: 6, multiplierCap: 2, maxParticipants: 25, safetyNotes: "soft test event, monitor crowd density", status: "planned_seed_template" }
] as const;

export const BETA1_DEMO_SHOP_ITEMS = [
  { itemKey: "shop-beta1-water-badge", title: "Hydration Badge", category: "booster_cosmetic", priceWfxp: 45, rarity: "common", childSuitable: true, status: "planned_seed_template" },
  { itemKey: "shop-beta1-streak-frame", title: "Streak Frame Blue", category: "cosmetic_frame", priceWfxp: 120, rarity: "uncommon", childSuitable: true, status: "planned_seed_template" },
  { itemKey: "shop-beta1-family-pass", title: "Family Mission Pass Skin", category: "mission_cosmetic", priceWfxp: 160, rarity: "uncommon", childSuitable: true, status: "planned_seed_template" },
  { itemKey: "shop-beta1-map-pin", title: "Vienna Map Pin Style", category: "ui_cosmetic", priceWfxp: 80, rarity: "common", childSuitable: true, status: "planned_seed_template" },
  { itemKey: "shop-beta1-sprint-tag", title: "Sprint Tag Orange", category: "profile_tag", priceWfxp: 95, rarity: "common", childSuitable: true, status: "planned_seed_template" },
  { itemKey: "shop-beta1-focus-aura", title: "Focus Aura Lite", category: "avatar_cosmetic", priceWfxp: 210, rarity: "rare", childSuitable: true, status: "planned_seed_template" },
  { itemKey: "shop-beta1-noe-badge", title: "Lower Austria Explorer Badge", category: "badge_cosmetic", priceWfxp: 140, rarity: "uncommon", childSuitable: true, status: "planned_seed_template" },
  { itemKey: "shop-beta1-beta-ribbon", title: "Closed Beta Ribbon", category: "profile_tag", priceWfxp: 60, rarity: "common", childSuitable: true, status: "planned_seed_template" }
] as const;

export const BETA1_DEMO_AVATAR_ITEMS = [
  { avatarItemKey: "avatar-beta1-cap-vienna", title: "Vienna Runner Cap", effectType: "cosmetic_only", priceWfxp: 150, childSuitable: true, status: "planned_seed_template" },
  { avatarItemKey: "avatar-beta1-shirt-family", title: "Family Quest Shirt", effectType: "cosmetic_only", priceWfxp: 170, childSuitable: true, status: "planned_seed_template" },
  { avatarItemKey: "avatar-beta1-glow-soft", title: "Soft Glow Outline", effectType: "cosmetic_only", priceWfxp: 220, childSuitable: true, status: "planned_seed_template" },
  { avatarItemKey: "avatar-beta1-backpack-lite", title: "Lite Trail Backpack", effectType: "cosmetic_only", priceWfxp: 190, childSuitable: true, status: "planned_seed_template" },
  { avatarItemKey: "avatar-beta1-shoes-neon", title: "Neon Walk Shoes", effectType: "cosmetic_only", priceWfxp: 200, childSuitable: true, status: "planned_seed_template" }
] as const;

export const BETA1_TEST_USER_PLACEHOLDERS = Array.from({ length: 25 }, (_, index) => ({
  testerKey: `beta1-tester-${String(index + 1).padStart(3, "0")}`,
  status: "planned"
}));
