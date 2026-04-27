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

function calculateMissionPatternReview(input = {}) {
  const trackingSessions = input.trackingSessions || [];
  const trackingProofEvents = input.trackingProofEvents || [];
  const nfcScanEvents = input.nfcScanEvents || [];
  const missionBuddyEvents = input.missionBuddyEvents || [];
  const missionId = input.missionId || null;
  const requestedDeviceId = input.deviceId || null;
  const requestedAppSessionId = input.appSessionId || null;

  const allEvents = [
    ...trackingSessions,
    ...trackingProofEvents,
    ...nfcScanEvents,
    ...missionBuddyEvents,
  ];

  const flags = [];
  let patternRiskScore = 10;

  const proofCount = trackingProofEvents.length;
  const sessionCount = trackingSessions.length;
  const nfcCount = nfcScanEvents.length;
  const buddyCount = missionBuddyEvents.length;
  const totalEventCount = allEvents.length;

  const deviceCounts = countBy(allEvents, (event) => event.deviceId);
  const appSessionCounts = countBy(allEvents, (event) => event.appSessionId);
  const missionCounts = countBy(allEvents, (event) => event.missionId);
  const nfcStatusCounts = countBy(nfcScanEvents, (event) => event.status || event.rejectionReason);
  const nfcTagCounts = countBy(nfcScanEvents, (event) => event.tagId || event.publicCode);

  const maxDeviceBurst = requestedDeviceId ? (deviceCounts[requestedDeviceId] || 0) : maxCount(deviceCounts);
  const maxAppSessionBurst = requestedAppSessionId ? (appSessionCounts[requestedAppSessionId] || 0) : maxCount(appSessionCounts);
  const maxMissionBurst = missionId ? (missionCounts[missionId] || 0) : maxCount(missionCounts);
  const maxNfcTagBurst = maxCount(nfcTagCounts);
  const rejectedNfcCount = (nfcStatusCounts.rejected || 0) + (nfcStatusCounts["duplicate-scan"] || 0);

  if (proofCount >= 5) {
    flags.push("high-frequency-proofs");
    patternRiskScore += 20;
  }

  if (proofCount > 0 && sessionCount === 0) {
    flags.push("proof-without-session");
    patternRiskScore += 25;
  }

  if (nfcCount >= 4) {
    flags.push("high-frequency-nfc-scans");
    patternRiskScore += 15;
  }

  if (maxNfcTagBurst >= 3) {
    flags.push("repeated-same-nfc-target");
    patternRiskScore += 20;
  }

  if (rejectedNfcCount >= 2) {
    flags.push("repeated-rejected-nfc");
    patternRiskScore += 20;
  }

  if (maxMissionBurst >= 8) {
    flags.push("repeated-same-mission-pattern");
    patternRiskScore += 20;
  }

  if (maxDeviceBurst >= 8) {
    flags.push("same-device-event-burst");
    patternRiskScore += 15;
  }

  if (maxAppSessionBurst >= 8) {
    flags.push("same-app-session-event-burst");
    patternRiskScore += 15;
  }

  if (totalEventCount >= 15) {
    flags.push("high-total-event-volume");
    patternRiskScore += 15;
  }

  patternRiskScore = Math.min(100, Math.max(0, patternRiskScore));

  let recommendation = "pattern-ok-for-review";
  if (patternRiskScore >= 75) {
    recommendation = "manual-review-required";
  } else if (patternRiskScore >= 45) {
    recommendation = "pattern-watchlist";
  }

  return {
    missionId,
    eventCounts: {
      trackingSessions: sessionCount,
      trackingProofEvents: proofCount,
      nfcScanEvents: nfcCount,
      missionBuddyEvents: buddyCount,
      totalEvents: totalEventCount,
    },
    burstSignals: {
      maxDeviceBurst,
      maxAppSessionBurst,
      maxMissionBurst,
      maxNfcTagBurst,
      rejectedNfcCount,
    },
    flags: Array.from(new Set(flags)),
    patternRiskScore,
    recommendation,
    rewardAuthorized: false,
    xpAuthorized: false,
    pointsAuthorized: false,
    tokenAuthorized: false,
    missionCompletionAuthorized: false,
  };
}

module.exports = {
  calculateMissionPatternReview,
};
