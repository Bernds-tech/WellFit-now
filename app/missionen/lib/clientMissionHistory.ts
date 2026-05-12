export type ClientMissionHistoryStatus = "geschafft" | "nicht geschafft" | "in Prüfung";

export type ClientMissionHistoryEntry = {
  id: string;
  title: string;
  category: "Tagesmissionen" | "Wochenmissionen" | "Abenteuer" | "Challenge" | "Wettkämpfe" | string;
  rewardLabel: string;
  completedAt: string;
  icon: string;
  pointsDelta?: number;
  status: ClientMissionHistoryStatus;
  source: "client_beta_projection";
};

const CLIENT_MISSION_HISTORY_KEY = "wellfit-client-mission-history";
const CLIENT_MISSION_HISTORY_EVENT = "wellfit-client-mission-history-updated";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

const asString = (value: unknown, fallback: string) => {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
};

const asStatus = (value: unknown): ClientMissionHistoryStatus => {
  if (value === "nicht geschafft" || value === "in Prüfung" || value === "geschafft") return value;
  return "geschafft";
};

const normalizeEntry = (value: unknown): ClientMissionHistoryEntry | null => {
  if (!isRecord(value)) return null;
  return {
    id: asString(value.id, `client-history-${Date.now()}`),
    title: asString(value.title, "Mission"),
    category: asString(value.category, "Mission"),
    rewardLabel: asString(value.rewardLabel, "+0 interne Punkte"),
    completedAt: asString(value.completedAt, new Date().toISOString()),
    icon: asString(value.icon, "✅"),
    pointsDelta: typeof value.pointsDelta === "number" ? value.pointsDelta : undefined,
    status: asStatus(value.status),
    source: "client_beta_projection",
  };
};

export const readClientMissionHistory = () => {
  if (typeof window === "undefined") return [] as ClientMissionHistoryEntry[];

  try {
    const saved = localStorage.getItem(CLIENT_MISSION_HISTORY_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeEntry).filter((entry): entry is ClientMissionHistoryEntry => Boolean(entry)) : [];
  } catch {
    return [];
  }
};

export const writeClientMissionHistory = (entries: ClientMissionHistoryEntry[]) => {
  if (typeof window === "undefined") return;
  const deduped = entries
    .filter((entry) => Boolean(entry.id))
    .reduce<ClientMissionHistoryEntry[]>((accumulator, entry) => {
      if (!accumulator.some((existing) => existing.id === entry.id)) accumulator.push(entry);
      return accumulator;
    }, [])
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 100);

  localStorage.setItem(CLIENT_MISSION_HISTORY_KEY, JSON.stringify(deduped));
  window.dispatchEvent(new CustomEvent(CLIENT_MISSION_HISTORY_EVENT, { detail: deduped }));
};

export const appendClientMissionHistory = (entry: Omit<ClientMissionHistoryEntry, "source">) => {
  const current = readClientMissionHistory();
  const nextEntry: ClientMissionHistoryEntry = { ...entry, source: "client_beta_projection" };
  writeClientMissionHistory([nextEntry, ...current]);
  return nextEntry;
};

export const subscribeClientMissionHistory = (callback: (entries: ClientMissionHistoryEntry[]) => void) => {
  if (typeof window === "undefined") return () => {};

  const handler = () => callback(readClientMissionHistory());
  window.addEventListener(CLIENT_MISSION_HISTORY_EVENT, handler);
  return () => window.removeEventListener(CLIENT_MISSION_HISTORY_EVENT, handler);
};
