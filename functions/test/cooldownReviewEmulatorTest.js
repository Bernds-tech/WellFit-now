/*
  WellFit Mission Cooldown Review Test

  Zweck:
  Testet die Cooldown-/Rate-Limit-Grundlage als reinen Helper-Review.
  Dieser Test braucht keine echte Auszahlung, keine XP/Punkte und keine Mission Completion.
*/

const { calculateMissionCooldownReview } = require("../lib/missionCooldownReview");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function makeEvent(index, type) {
  return {
    id: `${type}_${index}`,
    userId: "cooldown-user",
    missionId: "demo_tree_clue_001",
    deviceId: "cooldown-device-001",
    appSessionId: "cooldown-session-001",
    createdAt: new Date().toISOString(),
  };
}

async function run() {
  console.log("WellFit Mission Cooldown Review Test startet...");

  const trackingSessions = Array.from({ length: 2 }, (_, index) => makeEvent(index, "session"));
  const trackingProofEvents = Array.from({ length: 9 }, (_, index) => makeEvent(index, "proof"));
  const nfcScanEvents = Array.from({ length: 6 }, (_, index) => makeEvent(index, "nfc"));
  const missionBuddyEvents = Array.from({ length: 3 }, (_, index) => makeEvent(index, "buddy"));

  const review = calculateMissionCooldownReview({
    missionId: "demo_tree_clue_001",
    deviceId: "cooldown-device-001",
    appSessionId: "cooldown-session-001",
    trackingSessions,
    trackingProofEvents,
    nfcScanEvents,
    missionBuddyEvents,
  });

  assert(review.cooldownStatus === "hard-cooldown-recommended", "Cooldown Review muss hard-cooldown-recommended liefern.");
  assert(review.cooldownRiskScore >= 75, "Cooldown Risk Score muss hoch sein.");
  assert(review.suggestedCooldownSeconds >= 1800, "Hard Cooldown muss mindestens 1800 Sekunden empfehlen.");
  assert(review.flags.includes("proof-hard-cooldown"), "proof-hard-cooldown muss gesetzt sein.");
  assert(review.flags.includes("nfc-hard-cooldown"), "nfc-hard-cooldown muss gesetzt sein.");
  assert(review.flags.includes("mission-hard-cooldown"), "mission-hard-cooldown muss gesetzt sein.");
  assert(review.flags.includes("device-hard-cooldown"), "device-hard-cooldown muss gesetzt sein.");
  assert(review.flags.includes("app-session-hard-cooldown"), "app-session-hard-cooldown muss gesetzt sein.");
  assert(review.rewardAuthorized === false, "Cooldown Review darf keinen Reward autorisieren.");
  assert(review.xpAuthorized === false, "Cooldown Review darf keine XP autorisieren.");
  assert(review.pointsAuthorized === false, "Cooldown Review darf keine Punkte autorisieren.");
  assert(review.tokenAuthorized === false, "Cooldown Review darf keine Token autorisieren.");
  assert(review.missionCompletionAuthorized === false, "Cooldown Review darf keine Mission Completion autorisieren.");

  const clearReview = calculateMissionCooldownReview({
    missionId: "demo_tree_clue_001",
    deviceId: "clear-device-001",
    appSessionId: "clear-session-001",
    trackingSessions: [makeEvent(1, "session")],
    trackingProofEvents: [makeEvent(1, "proof")],
    nfcScanEvents: [],
    missionBuddyEvents: [],
  });

  assert(clearReview.cooldownStatus === "clear", "Niedrige Aktivitaet muss clear liefern.");
  assert(clearReview.cooldownRiskScore === 0, "Niedrige Aktivitaet muss cooldownRiskScore 0 liefern.");

  console.log("WellFit Mission Cooldown Review Test erfolgreich.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
