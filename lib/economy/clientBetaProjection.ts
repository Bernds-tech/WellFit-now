import type { AvatarState, User } from "@/types/user";

export type ClientBetaProjection = {
  userId: string;
  points: number;
  xp: number;
  level: number;
  stepsToday: number;
  avatar: AvatarState;
  updatedAt: string;
  source: "mission_completion" | "buddy_food" | "dashboard_cache" | "fallback";
  finalAuthority: false;
  tokenized: false;
};

const GLOBAL_KEY = "wellfit-client-beta-projection";
const userKey = (userId: string) => `wellfit-client-beta-projection-${userId}`;

const defaultAvatar = {
  hunger: 100,
  mood: 100,
  energy: 100,
  level: 1,
  cleanliness: 75,
  bond: 60,
  loyalty: 70,
  curiosity: 60,
} satisfies Required<Pick<AvatarState, "hunger" | "mood" | "energy" | "level">> &
  Required<Pick<AvatarState, "cleanliness" | "bond" | "loyalty" | "curiosity">>;

const numberFrom = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max);

function normalizeAvatar(value: Partial<AvatarState> | undefined, level: number): AvatarState {
  return {
    hunger: clamp(numberFrom(value?.hunger, defaultAvatar.hunger)),
    mood: clamp(numberFrom(value?.mood, defaultAvatar.mood)),
    energy: clamp(numberFrom(value?.energy, defaultAvatar.energy)),
    level: Math.max(1, numberFrom(value?.level, level)),
    cleanliness: clamp(numberFrom(value?.cleanliness, defaultAvatar.cleanliness)),
    bond: clamp(numberFrom(value?.bond, defaultAvatar.bond)),
    loyalty: clamp(numberFrom(value?.loyalty, defaultAvatar.loyalty)),
    curiosity: clamp(numberFrom(value?.curiosity, defaultAvatar.curiosity)),
    status: value?.status,
    dailyMode: value?.dailyMode,
  };
}

export function createProjectionFromUser(user: User): ClientBetaProjection {
  return {
    userId: user.id,
    points: Math.max(0, numberFrom(user.points, 0)),
    xp: Math.max(0, numberFrom(user.xp, 0)),
    level: Math.max(1, numberFrom(user.level, 1)),
    stepsToday: Math.max(0, numberFrom(user.stepsToday, 0)),
    avatar: normalizeAvatar(user.avatar, user.level),
    updatedAt: new Date().toISOString(),
    source: "dashboard_cache",
    finalAuthority: false,
    tokenized: false,
  };
}

export function readClientBetaProjection(userId?: string | null): ClientBetaProjection | null {
  if (typeof window === "undefined") return null;

  const keys = userId ? [userKey(userId), GLOBAL_KEY] : [GLOBAL_KEY];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as ClientBetaProjection;
      const id = typeof parsed.userId === "string" && parsed.userId ? parsed.userId : userId ?? "local-beta-user";
      const level = Math.max(1, numberFrom(parsed.level, 1));

      return {
        userId: id,
        points: Math.max(0, numberFrom(parsed.points, 0)),
        xp: Math.max(0, numberFrom(parsed.xp, 0)),
        level,
        stepsToday: Math.max(0, numberFrom(parsed.stepsToday, 0)),
        avatar: normalizeAvatar(parsed.avatar, level),
        updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
        source: parsed.source ?? "fallback",
        finalAuthority: false,
        tokenized: false,
      };
    } catch {}
  }

  return null;
}

export function writeClientBetaProjection(projection: ClientBetaProjection) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(GLOBAL_KEY, JSON.stringify(projection));
    localStorage.setItem(userKey(projection.userId), JSON.stringify(projection));
    window.dispatchEvent(new CustomEvent("wellfit-client-beta-projection-updated", { detail: projection }));
  } catch {}
}

export function mergeClientBetaProjection(
  userId: string | null | undefined,
  patch: Partial<Omit<ClientBetaProjection, "avatar">> & { avatar?: Partial<AvatarState> },
): ClientBetaProjection {
  const id = userId || "local-beta-user";
  const current = readClientBetaProjection(id);
  const level = Math.max(1, numberFrom(patch.level, current?.level ?? 1));
  const next: ClientBetaProjection = {
    userId: id,
    points: Math.max(0, numberFrom(patch.points, current?.points ?? 0)),
    xp: Math.max(0, numberFrom(patch.xp, current?.xp ?? 0)),
    level,
    stepsToday: Math.max(0, numberFrom(patch.stepsToday, current?.stepsToday ?? 0)),
    avatar: normalizeAvatar({ ...(current?.avatar ?? defaultAvatar), ...(patch.avatar ?? {}) }, level),
    updatedAt: new Date().toISOString(),
    source: patch.source ?? current?.source ?? "fallback",
    finalAuthority: false,
    tokenized: false,
  };

  writeClientBetaProjection(next);
  return next;
}
