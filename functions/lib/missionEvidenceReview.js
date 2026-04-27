function clamp(value, min, max, fallback) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return fallback;
  return Math.min(max, Math.max(min, numericValue));
}

function hasDoc(doc) {
  return Boolean(doc && doc.data);
}

function evidenceTypeList(evidence) {
  const types = [];
  if (hasDoc(evidence.trackingSession)) types.push("trackingSession");
  if (hasDoc(evidence.trackingProof)) types.push("trackingProof");
  if (hasDoc(evidence.nfcScan)) types.push("nfcScan");
  if (hasDoc(evidence.buddyEvent)) types.push("missionBuddyEvent");
  if (hasDoc(evidence.contextEvaluation)) types.push("missionContextEvaluation");
  if (hasDoc(evidence.completionEvaluation)) types.push("missionCompletionEvaluation");
  if (hasDoc(evidence.rewardPreview)) types.push("missionRewardPreview");
  return types;
}

function calculateMissionEvidenceReview({ missionId, evidence = {} }) {
  const types = evidenceTypeList(evidence);
  const flags = [];
  const evidenceCount = types.length;

  let plausibilityScore = 20;
  let proofQualityScore = 20;
  let antiCheatRiskScore = 80;

  if (evidenceCount === 0) {
    flags.push("insufficient-evidence");
  }

  if (hasDoc(evidence.trackingSession)) {
    plausibilityScore += 12;
    proofQualityScore += 8;
    if (evidence.trackingSession.data.serverValidationStatus === "proof-received") {
      proofQualityScore += 8;
    }
  }

  if (hasDoc(evidence.trackingProof)) {
    plausibilityScore += 12;
    proofQualityScore += 14;
    if (evidence.trackingProof.data.proofType) {
      flags.push(`proof-${evidence.trackingProof.data.proofType}`);
    }
  }

  if (hasDoc(evidence.nfcScan)) {
    const status = evidence.nfcScan.data.status;
    if (status === "validated") {
      plausibilityScore += 18;
      proofQualityScore += 16;
      antiCheatRiskScore -= 12;
    } else {
      flags.push("rejected-nfc-scan");
      antiCheatRiskScore += 18;
    }
    if (evidence.nfcScan.data.rejectionReason === "duplicate-scan") {
      flags.push("duplicate-scan-evidence");
      antiCheatRiskScore += 25;
      proofQualityScore -= 15;
    }
  }

  if (hasDoc(evidence.buddyEvent)) {
    plausibilityScore += 8;
    proofQualityScore += 6;
  }

  if (hasDoc(evidence.contextEvaluation)) {
    const context = evidence.contextEvaluation.data;
    plausibilityScore += clamp(context.contextFitScore, 0, 100, 40) * 0.18;
    proofQualityScore += clamp(context.proofQualityScore, 0, 100, 40) * 0.12;
    if (Array.isArray(context.flags)) {
      context.flags.forEach((flag) => flags.push(`context-${flag}`));
    }
    if (context.recommendation === "reject-or-parent-review") {
      flags.push("context-rejected");
      antiCheatRiskScore += 25;
    }
  }

  if (hasDoc(evidence.completionEvaluation)) {
    const completion = evidence.completionEvaluation.data;
    plausibilityScore += clamp(completion.evidenceCount, 0, 5, 0) * 8;
    if (completion.rejectionReason === "insufficient-evidence") {
      flags.push("completion-insufficient-evidence");
      antiCheatRiskScore += 20;
    }
    if (completion.rejectionReason === "manual-review-required") {
      flags.push("manual-review-required");
    }
  }

  if (hasDoc(evidence.rewardPreview)) {
    const preview = evidence.rewardPreview.data;
    if (preview.previewStatus === "context-rejected-preview") {
      flags.push("reward-preview-context-rejected");
      antiCheatRiskScore += 15;
    }
    if (preview.rewardAuthorized || preview.xpAuthorized || preview.pointsAuthorized || preview.tokenAuthorized) {
      flags.push("unexpected-preview-authorization");
      antiCheatRiskScore += 40;
    }
  }

  plausibilityScore = Math.round(clamp(plausibilityScore, 0, 100, 0));
  proofQualityScore = Math.round(clamp(proofQualityScore, 0, 100, 0));
  antiCheatRiskScore = Math.round(clamp(antiCheatRiskScore, 0, 100, 100));

  let recommendation = "needs-more-evidence";
  if (evidenceCount === 0) {
    recommendation = "insufficient-evidence";
  } else if (antiCheatRiskScore >= 75 || flags.includes("context-rejected") || flags.includes("duplicate-scan-evidence")) {
    recommendation = "manual-review-required";
  } else if (plausibilityScore >= 65 && proofQualityScore >= 55 && antiCheatRiskScore <= 55) {
    recommendation = "evidence-ok-for-review";
  } else {
    recommendation = "needs-more-evidence";
  }

  return {
    missionId,
    evidenceTypes: types,
    evidenceCount,
    flags: Array.from(new Set(flags)),
    plausibilityScore,
    proofQualityScore,
    antiCheatRiskScore,
    recommendation,
    rewardAuthorized: false,
    xpAuthorized: false,
    pointsAuthorized: false,
    tokenAuthorized: false,
    missionCompletionAuthorized: false,
  };
}

module.exports = {
  calculateMissionEvidenceReview,
};
