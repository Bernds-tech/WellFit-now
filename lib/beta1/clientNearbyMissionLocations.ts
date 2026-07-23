import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase";
import { requestCurrentCoordinates, type ClientCoordinates } from "@/lib/beta1/clientUserContext";

export type Beta1NearbyMissionLocation = {
  locationId: string;
  title: string;
  subtitle: string | null;
  regionId: string | null;
  countryCode: string | null;
  locality: string | null;
  locationType: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  icon: string;
  partnerName: string | null;
  missionIds: string[];
  safeLocationReviewed: true;
  status: "published";
};

export type Beta1NearbyMissionLocationResult = {
  radiusKm: number;
  locations: Beta1NearbyMissionLocation[];
  origin: ClientCoordinates;
  accuracyMeters: number | null;
  locationAuthority: "server-published-nearby";
  userLocationStored: false;
  globalCatalog: true;
};

type RawNearbyLocationResponse = {
  accepted?: boolean;
  radiusKm?: unknown;
  count?: unknown;
  locations?: unknown;
  locationAuthority?: unknown;
  userLocationStored?: unknown;
  globalCatalog?: unknown;
  noMonetaryValue?: unknown;
  tokenAuthorized?: unknown;
  cashoutAllowed?: unknown;
};

function requireSignedInUser() {
  if (!auth.currentUser) throw new Error("Bitte melde dich an, um Orte in deiner Umgebung zu laden.");
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function parseLocation(value: unknown): Beta1NearbyMissionLocation | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const latitude = Number(item.latitude);
  const longitude = Number(item.longitude);
  const distanceKm = Number(item.distanceKm);
  if (
    typeof item.locationId !== "string"
    || typeof item.title !== "string"
    || !Number.isFinite(latitude)
    || !Number.isFinite(longitude)
    || !Number.isFinite(distanceKm)
    || item.safeLocationReviewed !== true
    || item.status !== "published"
  ) {
    return null;
  }
  return {
    locationId: item.locationId,
    title: item.title,
    subtitle: asNullableString(item.subtitle),
    regionId: asNullableString(item.regionId),
    countryCode: asNullableString(item.countryCode),
    locality: asNullableString(item.locality),
    locationType: typeof item.locationType === "string" ? item.locationType : "public-space",
    latitude,
    longitude,
    distanceKm: Math.max(0, distanceKm),
    icon: typeof item.icon === "string" ? item.icon : "📍",
    partnerName: asNullableString(item.partnerName),
    missionIds: asStringArray(item.missionIds),
    safeLocationReviewed: true,
    status: "published",
  };
}

function errorMessage(error: unknown): string {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";
  const message = error instanceof Error ? error.message : "";
  const diagnostic = `${code} ${message}`.toLowerCase();
  if (diagnostic.includes("unauthenticated")) return "Bitte melde dich erneut an, um nahe WellFit-Orte zu laden.";
  if (diagnostic.includes("standortfreigabe") || diagnostic.includes("geolocation") || diagnostic.includes("standortdienste")) return message;
  if (diagnostic.includes("permission-denied")) return "Der Standortzugriff wurde nicht freigegeben.";
  if (diagnostic.includes("network") || diagnostic.includes("unavailable")) return "Die sichere Umgebungssuche ist gerade nicht erreichbar.";
  return message || "WellFit-Orte in deiner Umgebung konnten nicht geladen werden.";
}

export async function fetchNearbyMissionLocations(input?: {
  radiusKm?: number;
  missionIds?: string[];
  locationTypes?: string[];
}): Promise<Beta1NearbyMissionLocationResult> {
  requireSignedInUser();
  try {
    const coordinates = await requestCurrentCoordinates();
    const payload = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      radiusKm: input?.radiusKm ?? 25,
      missionIds: input?.missionIds ?? [],
      locationTypes: input?.locationTypes ?? [],
    };
    const callable = httpsCallable<typeof payload, RawNearbyLocationResponse>(
      getFunctions(),
      "getNearbyMissionLocations",
    );
    const result = await callable(payload);
    const data = result.data;
    const locations = Array.isArray(data.locations)
      ? data.locations.map(parseLocation).filter((location): location is Beta1NearbyMissionLocation => location !== null)
      : [];
    if (
      data.accepted !== true
      || data.locationAuthority !== "server-published-nearby"
      || data.userLocationStored !== false
      || data.globalCatalog !== true
      || data.noMonetaryValue !== true
      || data.tokenAuthorized === true
      || data.cashoutAllowed === true
      || Number(data.count) !== locations.length
    ) {
      throw new Error("failed-precondition: invalid nearby mission location response");
    }
    return {
      radiusKm: Number.isFinite(Number(data.radiusKm)) ? Math.max(0, Number(data.radiusKm)) : payload.radiusKm,
      locations,
      origin: coordinates,
      accuracyMeters: coordinates.accuracyMeters,
      locationAuthority: "server-published-nearby",
      userLocationStored: false,
      globalCatalog: true,
    };
  } catch (error) {
    throw new Error(errorMessage(error), { cause: error });
  }
}