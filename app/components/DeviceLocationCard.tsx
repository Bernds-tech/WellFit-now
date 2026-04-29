"use client";

import { useEffect, useMemo, useState } from "react";
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

type DeviceLocationCardProps = {
  compact?: boolean;
  className?: string;
};

export const WELLFIT_LAST_DEVICE_LOCATION_KEY = "wellfit-last-device-location";

const detectDeviceType = (): DeviceLocationSnapshot["deviceType"] => {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "tablet";
  if (/android|iphone|ipod|mobile/.test(ua)) return "mobile";
  if (/windows|macintosh|linux|x11/.test(ua)) return "desktop";
  return "unknown";
};

const readStoredPermissions = (): StoredPermissions => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("wellfit-permissions") ?? "{}") as StoredPermissions;
  } catch {
    return {};
  }
};

const readLastDeviceLocation = (): DeviceLocationSnapshot | null => {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(WELLFIT_LAST_DEVICE_LOCATION_KEY);
    return saved ? (JSON.parse(saved) as DeviceLocationSnapshot) : null;
  } catch {
    return null;
  }
};

const writeLastDeviceLocation = (snapshot: DeviceLocationSnapshot) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(WELLFIT_LAST_DEVICE_LOCATION_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(new CustomEvent("wellfit-device-location-updated", { detail: snapshot }));
};

const formatCoordinate = (value: number) => value.toFixed(6);

export default function DeviceLocationCard({ compact = false, className = "" }: DeviceLocationCardProps) {
  const [location, setLocation] = useState<DeviceLocationSnapshot | null>(null);
  const [message, setMessage] = useState("Standort dieses Geräts noch nicht freigegeben.");
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState<StoredPermissions>({});

  useEffect(() => {
    setPermissions(readStoredPermissions());
    const savedLocation = readLastDeviceLocation();
    if (savedLocation) {
      setLocation(savedLocation);
      setMessage("Letzter Standort dieses Geräts ist lokal verfügbar.");
    }
  }, []);

  const deviceLabel = useMemo(() => {
    const type = location?.deviceType ?? detectDeviceType();
    if (type === "desktop") return "PC / Desktop";
    if (type === "mobile") return "Handy";
    if (type === "tablet") return "Tablet";
    return "Unbekanntes Gerät";
  }, [location?.deviceType]);

  const canRequestLocation = permissions.location === true && permissions.locationTracking === true;

  const captureLocation = () => {
    const currentPermissions = readStoredPermissions();
    setPermissions(currentPermissions);

    if (!currentPermissions.location || !currentPermissions.locationTracking) {
      setMessage("Bitte aktiviere Standort und Geräte-Standorttracking zuerst in den Einstellungen.");
      return;
    }

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setMessage("Dieses Gerät unterstützt keine Browser-Standortfreigabe.");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setMessage("Bitte einloggen, damit der Standort diesem Gerät zugeordnet werden kann.");
      return;
    }

    setIsLoading(true);
    setMessage("Standortfreigabe wird angefragt...");

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

        setLocation(snapshot);
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
          setMessage("Standort dieses Geräts wurde gespeichert.");
        } catch (error) {
          console.error("Standort konnte nicht gespeichert werden", error);
          setMessage("Standort erkannt, lokal gespeichert, aber Firestore-Speichern wurde blockiert.");
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
        if (error.code === error.PERMISSION_DENIED) setMessage("Standortfreigabe wurde abgelehnt.");
        else if (error.code === error.POSITION_UNAVAILABLE) setMessage("Standort ist aktuell nicht verfügbar.");
        else if (error.code === error.TIMEOUT) setMessage("Standortabfrage hat zu lange gedauert.");
        else setMessage("Standort konnte nicht ermittelt werden.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  };

  return (
    <section className={`rounded-[24px] border border-cyan-200/20 bg-[#053841]/90 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.14)] ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/55">Geräte-Standort</p>
          <h2 className="mt-2 text-xl font-black text-white">{deviceLabel}</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${canRequestLocation ? "bg-cyan-300 text-[#042f35]" : "bg-white/15 text-white/70"}`}>{canRequestLocation ? "Aktiv" : "Aus"}</span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-white/72">{message}</p>

      {location && (
        <div className={`mt-4 grid gap-2 text-sm text-white/82 ${compact ? "grid-cols-1" : "grid-cols-2"}`}>
          <div className="rounded-xl bg-black/20 px-3 py-2">Lat: {formatCoordinate(location.latitude)}</div>
          <div className="rounded-xl bg-black/20 px-3 py-2">Lng: {formatCoordinate(location.longitude)}</div>
          <div className="rounded-xl bg-black/20 px-3 py-2">Genauigkeit: ca. {location.accuracyMeters} m</div>
          <div className="rounded-xl bg-black/20 px-3 py-2">Zeit: {new Date(location.capturedAt).toLocaleString("de-DE")}</div>
        </div>
      )}

      <button type="button" onClick={captureLocation} disabled={isLoading} className="mt-4 w-full rounded-xl bg-orange-400 px-4 py-3 text-sm font-black text-[#042f35] transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-60">
        {isLoading ? "Standort wird ermittelt..." : "Standort dieses Geräts aktualisieren"}
      </button>

      <p className="mt-3 text-xs leading-relaxed text-white/45">Standortdaten dienen später als Kontext/Evidence. Sie entscheiden nicht clientseitig über Rewards, Mission Completion oder Wettkampf-Sieger.</p>
    </section>
  );
}
