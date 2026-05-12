import type { DailyMission } from "./missions";

export type DailyBuddySyncPreviewResult = {
  ok: boolean;
  source: "server" | "local";
  finalAuthority: false;
  writeNow: false;
  message: string;
};

export async function fetchDailyBuddySyncPreview(params: {
  userId: string | null;
  mission: DailyMission;
  rewardPoints: number;
}): Promise<DailyBuddySyncPreviewResult> {
  try {
    const response = await fetch("/api/economy/buddy-sync-preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: params.userId ?? "daily-mission-buddy-sync-preview",
        missionId: params.mission.id,
        missionTitle: params.mission.title,
        missionType: params.mission.type,
        rewardPoints: params.rewardPoints,
        source: "dailyMission",
      }),
    });

    if (!response.ok) {
      return {
        ok: false,
        source: "local",
        finalAuthority: false,
        writeNow: false,
        message: "Buddy-Sync-Draft konnte nicht gelesen werden. MVP-Bruecke bleibt aktiv.",
      };
    }

    const data = (await response.json()) as {
      ok?: boolean;
      bundle?: {
        writeNow?: boolean;
        finalAuthority?: boolean;
        source?: string;
      };
    };

    if (!data.ok) {
      return {
        ok: false,
        source: "local",
        finalAuthority: false,
        writeNow: false,
        message: "Buddy-Sync-Draft wurde nicht bestaetigt. MVP-Bruecke bleibt aktiv.",
      };
    }

    return {
      ok: true,
      source: "server",
      finalAuthority: false,
      writeNow: false,
      message: "Buddy-Sync serverseitig vorgemerkt; finale Projektion folgt spaeter.",
    };
  } catch {
    return {
      ok: false,
      source: "local",
      finalAuthority: false,
      writeNow: false,
      message: "Buddy-Sync laeuft im lokalen Fallback. Server-Draft wird spaeter erneut versucht.",
    };
  }
}
