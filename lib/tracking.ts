import { auth, db } from "@/lib/firebase";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";

export type TrackingSource = "manual" | "mobile" | "googleFit" | "appleHealth" | "watch" | "pose";

export type StartTrackingInput = {
  source?: TrackingSource;
  missionId?: string;
  missionTitle?: string;
  activityType?: "steps" | "walking" | "running" | "workout" | "pose" | "manual";
};

export type FinishTrackingInput = {
  sessionId: string;
  stepsAggregated?: number;
  distanceAggregated?: number;
  eventsCount?: number;
  validReps?: number;
  invalidReps?: number;
  notes?: string;
};

export async function startTrackingSession(input: StartTrackingInput = {}) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Bitte zuerst registrieren oder einloggen.");

  const sessionRef = await addDoc(collection(db, "trackingSessions"), {
    userId: currentUser.uid,
    source: input.source ?? "manual",
    missionId: input.missionId ?? null,
    missionTitle: input.missionTitle ?? null,
    activityType: input.activityType ?? "manual",
    status: "active",
    startTime: serverTimestamp(),
    endTime: null,
    stepsAggregated: 0,
    distanceAggregated: null,
    eventsCount: 0,
    validReps: null,
    invalidReps: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return sessionRef.id;
}

export async function finishTrackingSession(input: FinishTrackingInput) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Bitte zuerst registrieren oder einloggen.");

  const sessionRef = doc(db, "trackingSessions", input.sessionId);
  await updateDoc(sessionRef, {
    status: "completed",
    endTime: serverTimestamp(),
    stepsAggregated: input.stepsAggregated ?? 0,
    distanceAggregated: input.distanceAggregated ?? null,
    eventsCount: input.eventsCount ?? 0,
    validReps: input.validReps ?? null,
    invalidReps: input.invalidReps ?? null,
    notes: input.notes ?? null,
    updatedAt: serverTimestamp(),
  });

  return input.sessionId;
}
