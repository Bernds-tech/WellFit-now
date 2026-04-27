const DEFAULT_COOLDOWN_POLICY = {
  proofSoftLimit: 4,
  proofHardLimit: 8,
  nfcSoftLimit: 3,
  nfcHardLimit: 6,
  missionSoftLimit: 5,
  missionHardLimit: 10,
  deviceSoftLimit: 8,
  deviceHardLimit: 14,
  appSessionSoftLimit: 8,
  appSessionHardLimit: 14,
  suggestedCooldownSeconds: 300,
  hardCooldownSeconds: 1800,
};

function countBy(items, selector) {
  const counts = {};
  for (const item of items || []) {
    const key = selector(item) || "unknown";
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function maxCount(counts) {
  return Math.max(0, ...Object.values(counts || {}));
}

function calculateMissionCooldownReview(input = {}) {
  const policy = { ...DEFAULT_COOLDOWN_POLICY, ...(input.policy || {}) };
  const missionId = input.missionId || null;
  const deviceId = input.deviceId || null;
  const appSessionId = input.appSessionId || null;
  const trackingSessions = input.trackingSessions || [];
  const trackingProofEvents = input.trackingProofEvents || [];
  const nfcScanEvents = input.nfcScanEvents || [];
  const missionBuddyEvents = input.missionBuddyEvents || [];
  const allEvents = [...trackingSessions, ...trackingProofEvents, ...nfcScanEvents, ...missionBuddyEvents];

  const flags = [];
  let cooldownRiskScore = 0;
  let suggestedCooldownSeconds = 0;

  const proofCount = trackingProofEvents.length;
  const nfcCount = nfcScanEvents.length;
  const totalEventCount = allEvents.length;
  const missionCounts = countBy(allEvents, (event) => event.missionId);
  const deviceCounts = countBy(allEvents, (event) => event.deviceId);
  const appSessionCounts = countBy(allEvents, (event) => event.appSessionId);

  const missionActionCount = missionId ? (missionCounts[missionId] || 0) : maxCount(missionCounts);
  const deviceActionCount = deviceId ? (deviceCounts[deviceId] || 0) : maxCount(deviceCounts);
  const appSessionActionCount = appSessionId ? (appSessionCounts[appSessionId] || 0) : maxCount(appSessionCounts);

  function applyLimit(count, soft, hard, softFlag, hardFlag) {
    if (count >= hard) {
      flags.push(hardFlag);
      cooldownRiskScore += 35;
      suggestedCooldownSeconds = Math.max(suggestedCooldownSeconds, policy.hardCooldownSeconds);
    } else if (count >= soft) {
      flags.push(softFlag);
      cooldownRiskScore += 15;
      suggestedCooldownSeconds = Math.max(suggestedCooldownSeconds, policy.suggestedCooldownSeconds);
    }
  }

  applyLimit(proofCount, policy.proofSoftLimit, policy.proofHardLimit, "proof-soft-cooldown", "proof-hard-cooldown");
  applyLimit(nfcCount, policy.nfcSoftLimit, policy.nfcHardLimit, "nfc-soft-cooldown", "nfc-hard-cooldown");
  applyLimit(missionActionCount, policy.missionSoftLimit, policy.missionHardLimit, "mission-soft-cooldown", "mission-hard-cooldown");
  applyLimit(deviceActionCount, policy.deviceSoftLimit, policy.deviceHardLimit, "device-soft-cooldown", "device-hard-cooldown");
  applyLimit(appSessionActionCount, policy.appSessionSoftLimit, policy.appSessionHardLimit, "app-session-soft-cooldown", "app-session-hard-cooldown");

  if (proofCount > 0 && trackingSessions.length === 0) {
    flags.push("proof-without-session-cooldown");
    cooldownRiskScore += 20;
    suggestedCooldownSeconds = Math.max(suggestedCooldownSeconds, policy.suggestedCooldownSeconds);
  }

  cooldownRiskScore = Math.min(100, Math.max(0, cooldownRiskScore));

  let cooldownStatus = "clear";
  if (cooldownRiskScore >= 75 || suggestedCooldownSeconds >= policy.hardCooldownSeconds) {
    cooldownStatus = "hard-cooldown-recommended";
  } else if (cooldownRiskScore >= 30 || suggestedCooldownSeconds > 0) {
    cooldownStatus = "soft-cooldown-recommended";
  }

  return {
    missionId,
    cooldownStatus,
    cooldownRiskScore,
    suggestedCooldownSeconds,
    policy,
    eventCounts: {
      trackingSessions: trackingSessions.length,
      trackingProofEvents: proofCount,
      nfcScanEvents: nfcCount,
      missionBuddyEvents: missionBuddyEvents.length,
      totalEvents: totalEventCount,
      missionActionCount,
      deviceActionCount,
      appSessionActionCount,
    },
    flags: Array.from(new Set(flags)),
    rewardAuthorized: false,
    xpAuthorized: false,
    pointsAuthorized: false,
    tokenAuthorized: false,
    missionCompletionAuthorized: false,
  };
}

module.exports = {
  DEFAULT_COOLDOWN_POLICY,
  calculateMissionCooldownReview,
};
