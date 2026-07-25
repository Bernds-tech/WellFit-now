const {
  buildWeeklyMissionSeedPlan,
} = require("../lib/missionSeedBuilders");

module.exports = {
  id: "20260725_002_beta1_weekly_missions",
  version: "1.1.0",
  destructive: false,
  buildPlan: buildWeeklyMissionSeedPlan,
};
