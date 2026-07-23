import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase";

export type AdminMissionLocationStatus = "draft" | "published";

export type AdminMissionLocation = {
  locationId: string;
  title: string;
  subtitle: string | null;
  regionId: string;
  countryCode: string | null;
  locality: string | null;
  locationType: string;
  latitude: number;
  longitude: number;
  icon: string;
  partnerName: string | null;
  missionIds: string[];
  safeLocationReviewed: boolean;
  safetyReviewNote: string | null;
  status: AdminMissionLocationStatus;
  globalCatalog: boolean;
};

export type UpsertAdminMissionLocationInput = {
  locationId: string;
  title: string;
  subtitle?: string;
  regionId: string;
  countryCode?: string;
  locality?: string;
  locationType: string;
  latitude: number;
  longitude: number;
  icon?: string;
  partnerName?: string;
  missionIds: string[];
  safeLocationReviewed: boolean;
  safetyReviewNote?: string;
  status: AdminMissionLocationStatus;
};

type AuthorityEnvelope = {
  accepted?: boolean;
  globalCatalog?: boolean;
};

type RawListResponse = AuthorityEnvelope & {
  count?: unknown;
  locations?: unknown;
};

type RawUpsertResponse = AuthorityEnvelope & {
  locationId?: unknown;
  regionId?: unknown;
  status?: unknown;
  missionIds?: unknown;
  safeLocationReviewed?: unknown;
};

function requireSignedInUser() {
  if (!auth.currentUser) throw new Error("Admin-Login erforderlich.");
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((entry): entry is string => typeof entry === "string" && Boolean(entry.trim())).map((entry) => entry.trim()))]
    : [];
}

function parseLocation(value: unknown): AdminMissionLocation | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  const latitude = Number(item.latitude);
  const longitude = Number(item.longitude);
  if (
    typeof item.locationId !== "string"
    || typeof item.title !== "string"
    || typeof item.regionId !== "string"
    || !Number.isFinite(latitude)
    || latitude < -90
    || latitude > 90
    || !Number.isFinite(longitude)
    || longitude < -180
    || longitude > 180
    || (item.status !== "draft" && item.status !== "published")
  ) {
    return null;
  }
  return {
    locationId: item.locationId,
    title: item.title,
    subtitle: nullableString(item.subtitle),
    regionId: item.regionId,
    countryCode: nullableString(item.countryCode),
    locality: nullableString(item.locality),
    locationType: typeof item.locationType === "string" ? item.locationType : "public-space",
    latitude,
    longitude,
    icon: typeof item.icon === "string" && item.icon ? item.icon : "📍",
    partnerName: nullableString(item.partnerName),
    missionIds: stringArray(item.missionIds),
    safeLocationReviewed: item.safeLocationReviewed === true,
    safetyReviewNote: nullableString(item.safetyReviewNote),
    status: item.status,
    globalCatalog: item.globalCatalog === true,
  };
}

function errorMessage(error: unknown): string {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";
  const message = error instanceof Error ? error.message : "";
  const diagnostic = `${code} ${message}`.toLowerCase();
  if (diagnostic.includes("unauthenticated")) return "Admin-Login erforderlich.";
  if (diagnostic.includes("permission-denied")) return "Der verifizierte Admin-Claim fehlt.";
  if (diagnostic.includes("regionid")) return "Die Regions-ID darf nur Buchstaben, Zahlen sowie . _ : - enthalten.";
  if (diagnostic.includes("sicherheitspruefung")) return "Ein veröffentlichter Ort benötigt eine dokumentierte Sicherheitsprüfung.";
  if (diagnostic.includes("mindestens eine mission")) return "Ordne dem Ort mindestens eine Mission zu.";
  if (diagnostic.includes("latitude") || diagnostic.includes("longitude")) return "Breiten- oder Längengrad ist ungültig.";
  return message || "Der weltweite Missionsort konnte nicht sicher verarbeitet werden.";
}

export async function listAdminMissionLocations(limit = 200): Promise<AdminMissionLocation[]> {
  requireSignedInUser();
  try {
    const callable = httpsCallable<{ limit: number }, RawListResponse>(getFunctions(), "adminListMissionLocations");
    const result = await callable({ limit: Math.max(1, Math.min(500, Math.floor(limit))) });
    const data = result.data;
    const locations = Array.isArray(data.locations)
      ? data.locations.map(parseLocation).filter((location): location is AdminMissionLocation => location !== null)
      : [];
    if (data.accepted !== true || data.globalCatalog !== true || Number(data.count) !== locations.length) {
      throw new Error("Ungültige serverseitige Missionsort-Projektion.");
    }
    return locations.sort((left, right) => left.countryCode?.localeCompare(right.countryCode || "") || left.locality?.localeCompare(right.locality || "") || left.title.localeCompare(right.title));
  } catch (error) {
    throw new Error(errorMessage(error), { cause: error });
  }
}

export async function upsertAdminMissionLocation(
  input: UpsertAdminMissionLocationInput,
): Promise<Pick<AdminMissionLocation, "locationId" | "regionId" | "status" | "missionIds" | "safeLocationReviewed">> {
  requireSignedInUser();
  const payload: UpsertAdminMissionLocationInput = {
    ...input,
    locationId: input.locationId.trim(),
    title: input.title.trim(),
    subtitle: input.subtitle?.trim(),
    regionId: input.regionId.trim().toLowerCase(),
    countryCode: input.countryCode?.trim().toUpperCase(),
    locality: input.locality?.trim(),
    locationType: input.locationType.trim() || "public-space",
    icon: input.icon?.trim() || "📍",
    partnerName: input.partnerName?.trim(),
    missionIds: [...new Set(input.missionIds.map((missionId) => missionId.trim()).filter(Boolean))],
    safetyReviewNote: input.safetyReviewNote?.trim(),
  };
  try {
    const callable = httpsCallable<UpsertAdminMissionLocationInput, RawUpsertResponse>(
      getFunctions(),
      "adminUpsertMissionLocation",
    );
    const result = await callable(payload);
    const data = result.data;
    const missionIds = stringArray(data.missionIds);
    if (
      data.accepted !== true
      || data.globalCatalog !== true
      || typeof data.locationId !== "string"
      || typeof data.regionId !== "string"
      || (data.status !== "draft" && data.status !== "published")
      || missionIds.length === 0
    ) {
      throw new Error("Ungültige serverseitige Missionsort-Bestätigung.");
    }
    return {
      locationId: data.locationId,
      regionId: data.regionId,
      status: data.status,
      missionIds,
      safeLocationReviewed: data.safeLocationReviewed === true,
    };
  } catch (error) {
    throw new Error(errorMessage(error), { cause: error });
  }
}
