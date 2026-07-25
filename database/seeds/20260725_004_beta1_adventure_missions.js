const {
  buildAdventureMissionSeedPlan,
} = require("../lib/missionSeedBuilders");

module.exports = {
  id: "20260725_004_beta1_adventure_missions",
  version: "1.1.0",
  destructive: false,
  buildPlan: buildAdventureMissionSeedPlan,
};
