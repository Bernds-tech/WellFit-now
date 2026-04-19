// ADD BELOW IMPORTS

function calculateDiversityMultiplier(todayMissions: string[]) {
  const unique = new Set(todayMissions).size;
  if (unique >= 3) return 1.2;
  if (unique === 2) return 1.1;
  return 1;
}

function calculateAntiFarmingMultiplier(todayMissions: string[], currentMission: string) {
  const sameCount = todayMissions.filter((m) => m === currentMission).length;
  if (sameCount >= 3) return 0.6;
  if (sameCount === 2) return 0.8;
  return 1;
}

// INSIDE startMission BEFORE calculateDynamicRewardScore

const historyRef = collection(db, "history");
const historySnap = await getDoc(doc(db, "userDailyRewards", `${currentUser.uid}_${todayKey()}`));
const todayData = historySnap.exists() ? historySnap.data() : {};
const todayMissions: string[] = todayData.missions ?? [];

const diversityMultiplier = calculateDiversityMultiplier(todayMissions);
const antiFarmingMultiplier = calculateAntiFarmingMultiplier(todayMissions, input.missionId);

// UPDATE SCORE CALL
const score = calculateDynamicRewardScore({
  baseReward: input.rewardPoints,
  systemRewardRate,
  avatarMultiplier: multipliers.avatarMultiplier,
  userEconomyMultiplier: multipliers.userEconomyMultiplier,
  precisionFactor: input.precisionFactor,
  socialMultiplier: input.socialMultiplier,
  streakMultiplier: input.streakMultiplier,
  sponsorMultiplier: input.sponsorMultiplier,
  validationRisk: input.validationRisk,
  diversityMultiplier,
  antiFarmingMultiplier,
});

// INSIDE completeMission AFTER updateDailyLoop

const dailyRef = doc(db, "userDailyRewards", `${currentUser.uid}_${todayKey()}`);
const dailySnap = await getDoc(dailyRef);
const dailyData = dailySnap.exists() ? dailySnap.data() : {};
const updatedMissions = [...(dailyData.missions ?? []), input.missionId];

await setDoc(dailyRef, { missions: updatedMissions }, { merge: true });
