"use client";

import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export type DeviceLocationSnapshot = {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  source: "browser-geolocation";
  capturedAt: string;
};

type StoredPermissions = {
  location?: boolean;
  locationTracking?: boolean;
};

export const WELLFIT_LAST_DEVICE_LOCATION_KEY = "wellfit-last-device-location";

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
    return JSON.parse(localStorage.getItem("wellfit-permissions") ?? "{}") as StoredPermissions;
  } catch {
    return {};
  }
};

export const readLastDeviceLocation = (): DeviceLocationSnapshot | null => {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(WELLFIT_LAST_DEVICE_LOCATION_KEY);
    return saved ? (JSON.parse(saved) as DeviceLocationSnapshot) : null;
  } catch {
    return null;
  }
};

export const writeLastDeviceLocation = (snapshot: DeviceLocationSnapshot) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(WELLFIT_LAST_DEVICE_LOCATION_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(new CustomEvent("wellfit-device-location-updated", { detail: snapshot }));
};

export type UpdateDeviceLocationResult =
  | { ok: true; snapshot: DeviceLocationSnapshot; message: string }
  | { ok: false; reason: "permission-disabled" | "geolocation-unavailable" | "not-authenticated" | "denied" | "unavailable" | "timeout" | "unknown" | "save-failed"; message: string };

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

  const currentUser = auth.currentUser;
  if (!currentUser) {
    return {
      ok: false,
      reason: "not-authenticated",
      message: "Bitte einloggen, damit der Standort gespeichert werden kann.",
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const snapshot: DeviceLocationSnapshot = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: Math.round(position.coords.accuracy),
          deviceType: detectDeviceType(),
          source: "browser-geolocation",
          capturedAt: new Date().toISOString(),
        };

        writeLastDeviceLocation(snapshot);

        try {
          await setDoc(
            doc(db, "users", currentUser.uid),
            {
              deviceLocation: snapshot,
              updatedAt: snapshot.capturedAt,
            },
            { merge: true },
          );
          resolve({ ok: true, snapshot, message: "Standort wurde aktualisiert." });
        } catch (error) {
          console.error("Standort konnte nicht gespeichert werden", error);
          resolve({
            ok: false,
            reason: "save-failed",
            message: "Standort wurde lokal aktualisiert, aber Firestore-Speichern wurde blockiert.",
          });
        }
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
