import type { User } from "@/types/user";
import type { BuddyDailyMode, BuddyState, BuddyStatus } from "../types";

const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max);

export function getBuddyStatus(state: Pick<BuddyState, "energy" | "hunger" | "cleanliness" | "bond" | "loyalty">): BuddyStatus {
  if (state.loyalty <= 12 && state.bond <= 15) return "ranAway";
  if (state.cleanliness <= 25) return "messy";
  if (state.energy <= 30 || state.hunger <= 30 || state.bond <= 30) return "needsCare";
  if (state.energy <= 45 || state.hunger <= 45) return "tired";
  return "active";
}

export function getBuddyDailyMode(state: Pick<BuddyState, "energy" | "hunger" | "cleanliness" | "mood" | "curiosity">): BuddyDailyMode {
  if (state.cleanliness < 35) return "chaotisch";
  if (state.hunger < 40) return "hungrig";
  if (state.energy < 45) return "muede";
  if (state.mood > 78) return "stolz";
  if (state.curiosity > 72) return "abenteuerlustig";
  if (state.mood > 58) return "verspielt";
  return "neugierig";
}

export function createBuddyStateFromUser(user: User | null): BuddyState {
  const level = user?.avatar?.level ?? user?.level ?? 1;
  const xp = user?.xp ?? 0;
  const energy = clamp(user?.avatar?.energy ?? 78);
  const hunger = clamp(user?.avatar?.hunger ?? 72);
  const mood = clamp(user?.avatar?.mood ?? 68);
  const points = user?.points ?? 0;

  const baseState = {
    name: "Flammi",
    title: level >= 10 ? "Legendärer Feuerdrache" : level >= 5 ? "Mutiger Abenteuer-Buddy" : "Junger Feuerdrache",
    level,
    xp,
    nextLevelXp: Math.max(100, level * 150),
    points,
    energy,
    hunger,
    mood,
    cleanliness: clamp(76 - Math.max(0, 60 - hunger) / 2),
    bond: clamp(64 + Math.min(level * 4, 26)),
    loyalty: clamp(72 + Math.min(level * 3, 20)),
    curiosity: clamp(62 + Math.min(level * 2, 24)),
  } satisfies Omit<BuddyState, "status" | "dailyMode">;

  const status = getBuddyStatus(baseState);
  const dailyMode = getBuddyDailyMode(baseState);

  return { ...baseState, status, dailyMode };
}

export function getNextLevelProgress(buddy: BuddyState) {
  return Math.min(100, Math.round((buddy.xp / buddy.nextLevelXp) * 100));
}
