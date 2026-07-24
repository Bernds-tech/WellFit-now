"use client";

export type DeviceLocationSnapshot = {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  source: "browser-geolocation";
  capturedAt: string;
};

export type StoredPermissions = {
  location?: boolean;
  locationTracking?: boolean;
};

export const WELLFIT_LAST_DEVICE_LOCATION_KEY = "wellfit-last-device-location";
export const DEVICE_LOCATION_CACHE_MAX_AGE_MS = 30 * 60 * 1000;

export const detectDeviceType = (): DeviceLocationSnapshot["deviceType"] => {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "tablet";
  if (/android|iphone|ipod|mobile/.test(ua)) return "mobile";
  if (/windows|macintosh|linux|x11/.test(ua)) return "desktop";
  return "unknown";
};

export const readStoredPermissions = (): StoredPermissions => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem("wellfit-permissions") ?? "{}") as StoredPermissions;
  } catch {
    return {};
  }
};

export const mergeStoredPermissions = (patch: StoredPermissions) => {
  if (typeof window === "undefined") return;
  try {
    const current = readStoredPermissions();
    window.localStorage.setItem("wellfit-permissions", JSON.stringify({ ...current, ...patch }));
  } catch {}
};

function isValidSnapshot(value: unknown): value is DeviceLocationSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<DeviceLocationSnapshot>;
  const capturedAt = typeof snapshot.capturedAt === "string" ? Date.parse(snapshot.capturedAt) : Number.NaN;
  const age = Date.now() - capturedAt;
  return Number.isFinite(snapshot.latitude)
    && Number.isFinite(snapshot.longitude)
    && Number.isFinite(snapshot.accuracyMeters)
    && snapshot.latitude! >= -90
    && snapshot.latitude! <= 90
    && snapshot.longitude! >= -180
    && snapshot.longitude! <= 180
    && Number.isFinite(capturedAt)
    && age >= -5 * 60 * 1000
    && age <= DEVICE_LOCATION_CACHE_MAX_AGE_MS;
}

export const clearLastDeviceLocation = () => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(WELLFIT_LAST_DEVICE_LOCATION_KEY);
    // Remove raw coordinates left by versions that persisted them beyond a session.
    window.localStorage.removeItem(WELLFIT_LAST_DEVICE_LOCATION_KEY);
  } catch {}
};

export const readLastDeviceLocation = (): DeviceLocationSnapshot | null => {
  if (typeof window === "undefined") return null;
  try {
    // Legacy persistent coordinates are deliberately removed rather than reused.
    window.localStorage.removeItem(WELLFIT_LAST_DEVICE_LOCATION_KEY);
    const saved = window.sessionStorage.getItem(WELLFIT_LAST_DEVICE_LOCATION_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as unknown;
    if (!isValidSnapshot(parsed)) {
      clearLastDeviceLocation();
      return null;
    }
    return parsed;
  } catch {
    clearLastDeviceLocation();
    return null;
  }
};

export const writeLastDeviceLocation = (snapshot: DeviceLocationSnapshot) => {
  if (typeof window === "undefined" || !isValidSnapshot(snapshot)) return;
  try {
    window.localStorage.removeItem(WELLFIT_LAST_DEVICE_LOCATION_KEY);
    window.sessionStorage.setItem(WELLFIT_LAST_DEVICE_LOCATION_KEY, JSON.stringify(snapshot));
    window.dispatchEvent(new CustomEvent("wellfit-device-location-updated", { detail: snapshot }));
  } catch {}
};

export type UpdateDeviceLocationResult =
  | { ok: true; snapshot: DeviceLocationSnapshot; message: string }
  | { ok: false; reason: "permission-disabled" | "geolocation-unavailable" | "denied" | "unavailable" | "timeout" | "unknown"; message: string };

export const updateCurrentDeviceLocation = async (): Promise<UpdateDeviceLocationResult> => {
  const permissions = readStoredPermissions();
  if (!permissions.location || !permissions.locationTracking) {
    return {
      ok: false,
      reason: "permission-disabled",
      message: "Standorttracking ist in WellFit nicht aktiviert.",
    };
  }

  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    return {
      ok: false,
      reason: "geolocation-unavailable",
      message: "Dieses Gerät unterstützt keine Standortfreigabe.",
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const snapshot: DeviceLocationSnapshot = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: Math.max(0, Math.round(position.coords.accuracy)),
          deviceType: detectDeviceType(),
          source: "browser-geolocation",
          capturedAt: new Date().toISOString(),
        };
        writeLastDeviceLocation(snapshot);
        resolve({
          ok: true,
          snapshot,
          message: "Standort wurde nur für diese Browsersitzung aktualisiert.",
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          resolve({ ok: false, reason: "denied", message: "Standortfreigabe wurde abgelehnt." });
          return;
        }
        if (error.code === error.POSITION_UNAVAILABLE) {
          resolve({ ok: false, reason: "unavailable", message: "Standort ist aktuell nicht verfügbar." });
          return;
        }
        if (error.code === error.TIMEOUT) {
          resolve({ ok: false, reason: "timeout", message: "Standortabfrage hat zu lange gedauert." });
          return;
        }
        resolve({ ok: false, reason: "unknown", message: "Standort konnte nicht ermittelt werden." });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  });
};
