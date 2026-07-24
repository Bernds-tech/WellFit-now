"use client";

import { useEffect, useMemo, useState } from "react";
import {
  detectDeviceType,
  readLastDeviceLocation,
  readStoredPermissions,
  updateCurrentDeviceLocation,
  type DeviceLocationSnapshot,
  type StoredPermissions,
} from "@/app/lib/deviceLocation";

type DeviceLocationCardProps = {
  compact?: boolean;
  className?: string;
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
      setMessage("Letzter Standort dieser Browsersitzung ist temporär verfügbar.");
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

  const captureLocation = async () => {
    const currentPermissions = readStoredPermissions();
    setPermissions(currentPermissions);
    setIsLoading(true);
    setMessage("Standortfreigabe wird angefragt...");
    try {
      const result = await updateCurrentDeviceLocation();
      if (result.ok) {
        setLocation(result.snapshot);
        setMessage(result.message);
      } else {
        setMessage(result.message);
      }
    } finally {
      setIsLoading(false);
    }
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
        {isLoading ? "Standort wird ermittelt..." : "Standort dieser Sitzung aktualisieren"}
      </button>

      <p className="mt-3 text-xs leading-relaxed text-white/45">
        Rohkoordinaten bleiben nur bis zu 30 Minuten in dieser Browsersitzung. Sie werden nicht in Firestore gespeichert und autorisieren niemals Rewards, Mission Completion oder Wettkampf-Sieger.
      </p>
    </section>
  );
}
