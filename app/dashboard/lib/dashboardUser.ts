import type { User } from "@/types/user";

export const getDashboardCacheKey = (uid: string) => `wellfit-dashboard-user-${uid}`;

export const createDefaultUser = (firebaseUser: {
  uid: string;
  email: string | null;
  displayName: string | null;
}): User => ({
  id: firebaseUser.uid,
  firstName: firebaseUser.displayName?.split(" ")[0] ?? "",
  lastName: firebaseUser.displayName?.split(" ").slice(1).join(" ") ?? "",
  email: firebaseUser.email ?? "",
  points: 0,
  xp: 0,
  energy: 100,
  level: 1,
  stepsToday: 0,
  currency: "points",
  avatar: { hunger: 100, mood: 100, energy: 100, level: 1 },
  inventory: [],
});

export const normalizeUser = (rawUser: Partial<User>, userId: string): User => ({
  ...(rawUser as User),
  id: userId,
  firstName: rawUser.firstName ?? "",
  lastName: rawUser.lastName ?? "",
  email: rawUser.email ?? "",
  points: rawUser.points ?? 0,
  xp: rawUser.xp ?? 0,
  energy: rawUser.energy ?? 100,
  level: rawUser.level ?? 1,
  stepsToday: rawUser.stepsToday ?? 0,
  currency: rawUser.currency ?? "points",
  avatar: {
    hunger: rawUser.avatar?.hunger ?? 100,
    mood: rawUser.avatar?.mood ?? 100,
    energy: rawUser.avatar?.energy ?? 100,
    level: rawUser.avatar?.level ?? rawUser.level ?? 1,
  },
  inventory: rawUser.inventory ?? [],
});

export const readCachedUser = (uid: string): User | null => {
  try {
    const cached = localStorage.getItem(getDashboardCacheKey(uid));
    return cached ? normalizeUser(JSON.parse(cached) as Partial<User>, uid) : null;
  } catch {
    return null;
  }
};

export const writeCachedUser = (user: User) => {
  try {
    localStorage.setItem(getDashboardCacheKey(user.id), JSON.stringify(user));
  } catch {}
};
