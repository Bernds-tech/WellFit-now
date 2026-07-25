const {
  buildDailyMissionSeedPlan,
} = require("../lib/missionSeedBuilders");

module.exports = {
  id: "20260725_001_beta1_daily_missions",
  version: "1.2.0",
  destructive: false,
  buildPlan: buildDailyMissionSeedPlan,
};
