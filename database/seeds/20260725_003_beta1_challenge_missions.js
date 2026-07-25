const {
  buildChallengeMissionSeedPlan,
} = require("../lib/missionSeedBuilders");

module.exports = {
  id: "20260725_003_beta1_challenge_missions",
  version: "1.1.0",
  destructive: false,
  buildPlan: buildChallengeMissionSeedPlan,
};
