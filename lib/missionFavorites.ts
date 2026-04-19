import { auth, db } from "@/lib/firebase";
import { deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";

export type MissionFavoriteInput = {
  missionId: string;
  title: string;
  category: string;
  description?: string;
  rewardLabel?: string;
  rewardPoints?: number;
  icon?: string;
  sourcePath?: string;
  source?: "prefab" | "ai" | "fallback" | "firestore" | string;
};

export type MissionFavorite = Required<Omit<MissionFavoriteInput, "rewardPoints" | "description" | "rewardLabel" | "icon" | "sourcePath" | "source">> & {
  id: string;
  userId: string;
  description: string;
  rewardLabel: string;
  rewardPoints: number;
  icon: string;
  sourcePath: string;
  source: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

const getFavoriteDocId = (userId: string, missionId: string) => `${userId}_${missionId}`;

export async function setMissionFavorite(input: MissionFavoriteInput) {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Bitte zuerst registrieren oder einloggen.");
  }

  const favoriteRef = doc(db, "favorites", getFavoriteDocId(currentUser.uid, input.missionId));

  await setDoc(
    favoriteRef,
    {
      userId: currentUser.uid,
      missionId: input.missionId,
      title: input.title,
      category: input.category,
      description: input.description ?? "",
      rewardLabel: input.rewardLabel ?? `+${input.rewardPoints ?? 0} WFT`,
      rewardPoints: input.rewardPoints ?? 0,
      icon: input.icon ?? "⭐",
      sourcePath: input.sourcePath ?? "/missionen/tagesmissionen",
      source: input.source ?? "prefab",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function removeMissionFavorite(missionId: string) {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Bitte zuerst registrieren oder einloggen.");
  }

  await deleteDoc(doc(db, "favorites", getFavoriteDocId(currentUser.uid, missionId)));
}

export async function toggleMissionFavorite(input: MissionFavoriteInput, isFavorite: boolean) {
  if (isFavorite) {
    await removeMissionFavorite(input.missionId);
    return false;
  }

  await setMissionFavorite(input);
  return true;
}

export function listenUserFavorites(userId: string, onChange: (favorites: MissionFavorite[]) => void, onError?: (error: Error) => void) {
  return onSnapshot(
    doc(db, "favoriteIndexes", userId),
    () => {
      // Reserved for later aggregated indexes. Kept intentionally empty so callers do not depend on this placeholder.
    },
    () => undefined
  );
}
