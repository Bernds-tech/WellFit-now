import { auth, db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, setDoc, doc } from "firebase/firestore";

export type AiMissionProfile = {
  age?: number;
  level?: number;
  stepsToday?: number;
  goal?: "fitness" | "abnehmen" | "lernen" | "sozial" | "gesundheit" | string;
  preferredType?: "Bewegung" | "Ernährung" | "Workout" | "Community" | "Abenteuer" | string;
};

export type GeneratedMission = {
  title: string;
  category: "Tagesmissionen" | "Wochenmissionen" | "Abenteuer" | "Challenge" | "Wettkämpfe";
  description: string;
  difficulty: "Leicht" | "Mittel" | "Schwer";
  type: "Bewegung" | "Ernährung" | "Workout" | "Community" | "Abenteuer";
  duration: string;
  reward: number;
  targetValue: number;
  unit: "steps" | "minutes" | "questions" | "checkin" | string;
};

const clampReward = (reward: number) => Math.max(5, Math.min(80, reward));

export function generateLocalAiMission(profile: AiMissionProfile = {}): GeneratedMission {
  const level = profile.level ?? 1;
  const stepsToday = profile.stepsToday ?? 0;
  const goal = profile.goal ?? "gesundheit";
  const lowActivity = stepsToday < 3000;

  if (goal === "lernen") {
    return {
      title: "KI Wissens-Sprint",
      category: "Tagesmissionen",
      description: "Löse 3 kurze Wissensfragen und kombiniere Lernen mit Bewegungspausen.",
      difficulty: level > 3 ? "Mittel" : "Leicht",
      type: "Community",
      duration: "10 Minuten",
      reward: clampReward(15 + level * 2),
      targetValue: 3,
      unit: "questions",
    };
  }

  if (goal === "abnehmen") {
    return {
      title: lowActivity ? "KI Sanfter Fettstoffwechsel-Start" : "KI Aktiv-Burn Mission",
      category: "Tagesmissionen",
      description: lowActivity ? "Gehe 2.500 echte Schritte und trinke ein großes Glas Wasser." : "Kombiniere 5.000 Schritte mit 10 Minuten aktiver Bewegung.",
      difficulty: lowActivity ? "Leicht" : "Mittel",
      type: "Bewegung",
      duration: "1 Tag",
      reward: clampReward(lowActivity ? 20 : 35),
      targetValue: lowActivity ? 2500 : 5000,
      unit: "steps",
    };
  }

  return {
    title: lowActivity ? "KI Tagesstart Bewegung" : "KI Fortschrittsrunde",
    category: "Tagesmissionen",
    description: lowActivity ? "Starte mit einer kleinen Bewegungsrunde, damit dein Buddy Energie bekommt." : "Halte deinen Bewegungsfluss aufrecht und sammle weitere echte Schritte.",
    difficulty: lowActivity ? "Leicht" : "Mittel",
    type: "Bewegung",
    duration: "1 Tag",
    reward: clampReward(lowActivity ? 18 : 30),
    targetValue: lowActivity ? 2000 : 4500,
    unit: "steps",
  };
}

export async function createAiMissionForCurrentUser(profile: AiMissionProfile = {}) {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Bitte zuerst registrieren oder einloggen.");
  }

  const mission = generateLocalAiMission(profile);
  const aiMissionRef = await addDoc(collection(db, "aiGeneratedMissions"), {
    ...mission,
    pointsReward: mission.reward,
    userId: currentUser.uid,
    source: "ai",
    generatedByAi: true,
    active: true,
    status: "testing",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(doc(db, "missions", aiMissionRef.id), {
    ...mission,
    pointsReward: mission.reward,
    source: "ai",
    generatedByAi: true,
    active: true,
    status: "testing",
    originCollection: "aiGeneratedMissions",
    originId: aiMissionRef.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return { id: aiMissionRef.id, ...mission };
}
