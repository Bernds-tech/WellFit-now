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
  geoIndexVersion: string | null;
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

export type AdminMissionLocationReindexSummary = {
  pages: number;
  scannedCount: number;
  updatedCount: number;
  skippedCount: number;
  geoIndexVersion: string;
};

type AuthorityEnvelope = {
  accepted?: boolean;
  globalCatalog?: boolean;
};

type RawListResponse = AuthorityEnvelope & {
  count?: unknown;
  locations?: unknown;
  geoIndexVersion?: unknown;
};

type RawUpsertResponse = AuthorityEnvelope & {
  locationId?: unknown;
  regionId?: unknown;
  status?: unknown;
  missionIds?: unknown;
  safeLocationReviewed?: unknown;
  geoIndexVersion?: unknown;
};

type RawReindexResponse = AuthorityEnvelope & {
  scannedCount?: unknown;
  updatedCount?: unknown;
  skippedCount?: unknown;
  nextAfterLocationId?: unknown;
  hasMore?: unknown;
  geoIndexVersion?: unknown;
};

type ReindexPageResult = {
  scannedCount: number;
  updatedCount: number;
  skippedCount: number;
  nextAfterLocationId: string | null;
  hasMore: boolean;
  geoIndexVersion: string;
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

function nonNegativeInteger(value: unknown): number | null {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : null;
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
    geoIndexVersion: nullableString(item.geoIndexVersion),
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
  if (diagnostic.includes("geo-index") || diagnostic.includes("geo index")) return "Der weltweite Geo-Index konnte nicht sicher abgeglichen werden.";
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
    if (
      data.accepted !== true
      || data.globalCatalog !== true
      || typeof data.geoIndexVersion !== "string"
      || Number(data.count) !== locations.length
    ) {
      throw new Error("Ungültige serverseitige Missionsort-Projektion.");
    }
    return locations.sort((left, right) => left.countryCode?.localeCompare(right.countryCode || "") || left.locality?.localeCompare(right.locality || "") || left.title.localeCompare(right.title));
  } catch (error) {
    throw new Error(errorMessage(error), { cause: error });
  }
}

export async function upsertAdminMissionLocation(
  input: UpsertAdminMissionLocationInput,
): Promise<Pick<AdminMissionLocation, "locationId" | "regionId" | "status" | "missionIds" | "safeLocationReviewed" | "geoIndexVersion">> {
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
      || typeof data.geoIndexVersion !== "string"
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
      geoIndexVersion: data.geoIndexVersion,
    };
  } catch (error) {
    throw new Error(errorMessage(error), { cause: error });
  }
}

async function reindexAdminMissionLocationsPage(input: {
  limit: number;
  afterLocationId: string | null;
}): Promise<ReindexPageResult> {
  const callable = httpsCallable<
    { limit: number; afterLocationId: string | null; reason: string },
    RawReindexResponse
  >(getFunctions(), "adminReindexMissionLocations");
  const result = await callable({
    limit: Math.max(1, Math.min(400, Math.floor(input.limit))),
    afterLocationId: input.afterLocationId,
    reason: "Admin-Oberfläche: weltweiten Geo-Index abgleichen",
  });
  const data = result.data;
  const scannedCount = nonNegativeInteger(data.scannedCount);
  const updatedCount = nonNegativeInteger(data.updatedCount);
  const skippedCount = nonNegativeInteger(data.skippedCount);
  const nextAfterLocationId = nullableString(data.nextAfterLocationId);
  if (
    data.accepted !== true
    || data.globalCatalog !== true
    || scannedCount === null
    || updatedCount === null
    || skippedCount === null
    || typeof data.hasMore !== "boolean"
    || typeof data.geoIndexVersion !== "string"
    || (data.hasMore && !nextAfterLocationId)
  ) {
    throw new Error("Ungültige serverseitige Geo-Index-Bestätigung.");
  }
  return {
    scannedCount,
    updatedCount,
    skippedCount,
    nextAfterLocationId,
    hasMore: data.hasMore,
    geoIndexVersion: data.geoIndexVersion,
  };
}

export async function reindexAllAdminMissionLocations(pageSize = 300): Promise<AdminMissionLocationReindexSummary> {
  requireSignedInUser();
  try {
    let afterLocationId: string | null = null;
    let scannedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let geoIndexVersion = "";

    for (let pages = 1; pages <= 100; pages += 1) {
      const page = await reindexAdminMissionLocationsPage({ limit: pageSize, afterLocationId });
      scannedCount += page.scannedCount;
      updatedCount += page.updatedCount;
      skippedCount += page.skippedCount;
      geoIndexVersion = page.geoIndexVersion;
      if (!page.hasMore) {
        return { pages, scannedCount, updatedCount, skippedCount, geoIndexVersion };
      }
      if (!page.nextAfterLocationId || page.nextAfterLocationId === afterLocationId) {
        throw new Error("Geo-Index-Paginierung hat keinen sicheren Fortschritt geliefert.");
      }
      afterLocationId = page.nextAfterLocationId;
    }
    throw new Error("Geo-Index-Abgleich hat die sichere Seitengrenze überschritten.");
  } catch (error) {
    throw new Error(errorMessage(error), { cause: error });
  }
}
