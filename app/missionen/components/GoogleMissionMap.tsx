"use client";

import { useEffect, useRef, useState } from "react";
import type { DeviceLocationSnapshot } from "@/app/components/DeviceLocationCard";
import { WELLFIT_LAST_DEVICE_LOCATION_KEY } from "@/app/components/DeviceLocationCard";

export type GoogleMissionMapMarker = {
  id: number;
  title: string;
  subtitle?: string;
  icon: string;
  lat: number;
  lng: number;
  status?: string;
};

type GoogleMissionMapProps = {
  title: string;
  subtitle: string;
  markers: GoogleMissionMapMarker[];
  selectedMarkerId: number;
  onSelectMarker: (markerId: number) => void;
  zoom?: number;
  minHeightClassName?: string;
};

type GoogleMapsWindow = Window & {
  google?: any;
  __wellfitGoogleMapsPromise?: Promise<void>;
};

const GOOGLE_MAPS_SCRIPT_ID = "wellfit-google-maps-js";

const readLastDeviceLocation = (): DeviceLocationSnapshot | null => {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(WELLFIT_LAST_DEVICE_LOCATION_KEY);
    return saved ? (JSON.parse(saved) as DeviceLocationSnapshot) : null;
  } catch {
    return null;
  }
};

const loadGoogleMaps = (apiKey: string): Promise<void> => {
  const browserWindow = window as GoogleMapsWindow;
  if (browserWindow.google?.maps) return Promise.resolve();
  if (browserWindow.__wellfitGoogleMapsPromise) return browserWindow.__wellfitGoogleMapsPromise;

  browserWindow.__wellfitGoogleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Google Maps konnte nicht geladen werden.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps konnte nicht geladen werden."));
    document.head.appendChild(script);
  });

  return browserWindow.__wellfitGoogleMapsPromise;
};

const markerColor = (marker: GoogleMissionMapMarker) => {
  if (marker.status?.toLowerCase().includes("aktiv")) return "#f97316";
  if (marker.status?.toLowerCase().includes("gesperrt")) return "#eab308";
  if (marker.status?.toLowerCase().includes("live")) return "#22c55e";
  return "#0891b2";
};

const createOwnLocationOverlay = (google: any, position: { lat: number; lng: number }, accuracyMeters: number) => {
  const overlay = new google.maps.OverlayView();
  let container: HTMLDivElement | null = null;

  overlay.onAdd = () => {
    container = document.createElement("div");
    container.style.position = "absolute";
    container.style.transform = "translate(-50%, -50%)";
    container.style.zIndex = "99999";
    container.style.pointerEvents = "none";
    container.innerHTML = `
      <div style="position:relative;width:92px;height:92px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:92px;height:92px;border-radius:999px;background:rgba(37,99,235,0.20);border:4px solid rgba(37,99,235,0.95);box-shadow:0 0 30px rgba(37,99,235,0.7);"></div>
        <div style="position:absolute;width:58px;height:58px;border-radius:999px;background:#2563eb;border:5px solid #ffffff;display:flex;align-items:center;justify-content:center;font-size:30px;box-shadow:0 10px 30px rgba(0,0,0,0.45);">🐉</div>
        <div style="position:absolute;top:72px;left:50%;transform:translateX(-50%);white-space:nowrap;border-radius:999px;background:#0f172a;color:#ffffff;border:2px solid #60a5fa;padding:4px 10px;font-size:12px;font-weight:900;box-shadow:0 8px 22px rgba(0,0,0,0.35);">Mein Standort</div>
      </div>
    `;
    overlay.getPanes()?.overlayMouseTarget.appendChild(container);
  };

  overlay.draw = () => {
    if (!container) return;
    const projection = overlay.getProjection();
    const point = projection.fromLatLngToDivPixel(new google.maps.LatLng(position.lat, position.lng));
    if (!point) return;
    container.style.left = `${point.x}px`;
    container.style.top = `${point.y}px`;
    container.title = `Mein Standort · Genauigkeit ca. ${accuracyMeters} m`;
  };

  overlay.onRemove = () => {
    container?.remove();
    container = null;
  };

  return overlay;
};

export default function GoogleMissionMap({
  title,
  subtitle,
  markers,
  selectedMarkerId,
  onSelectMarker,
  zoom = 12,
  minHeightClassName = "min-h-[520px]",
}: GoogleMissionMapProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRefs = useRef<any[]>([]);
  const ownLocationOverlayRef = useRef<any>(null);
  const ownLocationCircleRef = useRef<any>(null);
  const [loadState, setLoadState] = useState<"missing-key" | "loading" | "ready" | "error">("loading");
  const [ownLocation, setOwnLocation] = useState<DeviceLocationSnapshot | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    setOwnLocation(readLastDeviceLocation());
    const onLocationUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<DeviceLocationSnapshot>;
      setOwnLocation(customEvent.detail ?? readLastDeviceLocation());
    };
    window.addEventListener("wellfit-device-location-updated", onLocationUpdate);
    return () => window.removeEventListener("wellfit-device-location-updated", onLocationUpdate);
  }, []);

  useEffect(() => {
    if (!apiKey) {
      setLoadState("missing-key");
      return;
    }

    let cancelled = false;
    setLoadState("loading");

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !mapElementRef.current) return;
        const google = (window as GoogleMapsWindow).google;
        if (!google?.maps) throw new Error("Google Maps API nicht verfuegbar.");

        const selected = markers.find((marker) => marker.id === selectedMarkerId) ?? markers[0];
        const center = ownLocation
          ? { lat: ownLocation.latitude, lng: ownLocation.longitude }
          : selected
            ? { lat: selected.lat, lng: selected.lng }
            : { lat: 48.2082, lng: 16.3738 };

        const map = new google.maps.Map(mapElementRef.current, {
          center,
          zoom,
          minZoom: 2,
          maxZoom: 20,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          gestureHandling: "greedy",
        });

        mapRef.current = map;
        markerRefs.current.forEach((marker) => marker.setMap(null));
        markerRefs.current = markers.map((markerItem) => {
          const marker = new google.maps.Marker({
            position: { lat: markerItem.lat, lng: markerItem.lng },
            map,
            title: `${markerItem.title}${markerItem.subtitle ? ` · ${markerItem.subtitle}` : ""}`,
            label: { text: markerItem.id === selectedMarkerId ? "★" : markerItem.icon, fontSize: markerItem.id === selectedMarkerId ? "24px" : "20px" },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: markerColor(markerItem),
              fillOpacity: 0.95,
              strokeColor: markerItem.id === selectedMarkerId ? "#fde047" : "#ffffff",
              strokeWeight: markerItem.id === selectedMarkerId ? 4 : 2,
              scale: markerItem.id === selectedMarkerId ? 17 : 14,
            },
          });
          marker.addListener("click", () => onSelectMarker(markerItem.id));
          return marker;
        });

        setLoadState("ready");
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) setLoadState("error");
      });

    return () => { cancelled = true; };
  }, [apiKey, markers, onSelectMarker, ownLocation, selectedMarkerId, zoom]);

  useEffect(() => {
    const google = (window as GoogleMapsWindow).google;
    const map = mapRef.current;
    if (!google?.maps || !map) return;

    markerRefs.current.forEach((marker, index) => {
      const markerItem = markers[index];
      if (!markerItem) return;
      marker.setLabel({ text: markerItem.id === selectedMarkerId ? "★" : markerItem.icon, fontSize: markerItem.id === selectedMarkerId ? "24px" : "20px" });
      marker.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: markerColor(markerItem),
        fillOpacity: 0.95,
        strokeColor: markerItem.id === selectedMarkerId ? "#fde047" : "#ffffff",
        strokeWeight: markerItem.id === selectedMarkerId ? 4 : 2,
        scale: markerItem.id === selectedMarkerId ? 17 : 14,
      });
    });
  }, [markers, selectedMarkerId]);

  useEffect(() => {
    const google = (window as GoogleMapsWindow).google;
    const map = mapRef.current;
    if (!google?.maps || !map) return;

    if (!ownLocation) {
      ownLocationOverlayRef.current?.setMap(null);
      ownLocationCircleRef.current?.setMap(null);
      ownLocationOverlayRef.current = null;
      ownLocationCircleRef.current = null;
      return;
    }

    const position = { lat: ownLocation.latitude, lng: ownLocation.longitude };

    ownLocationOverlayRef.current?.setMap(null);
    const overlay = createOwnLocationOverlay(google, position, ownLocation.accuracyMeters);
    overlay.setMap(map);
    ownLocationOverlayRef.current = overlay;

    const visibleRadius = Math.max(ownLocation.accuracyMeters, 180);
    if (!ownLocationCircleRef.current) {
      ownLocationCircleRef.current = new google.maps.Circle({
        map,
        center: position,
        radius: visibleRadius,
        strokeColor: "#1d4ed8",
        strokeOpacity: 0.95,
        strokeWeight: 5,
        fillColor: "#60a5fa",
        fillOpacity: 0.32,
        zIndex: 9998,
      });
    } else {
      ownLocationCircleRef.current.setCenter(position);
      ownLocationCircleRef.current.setRadius(visibleRadius);
      ownLocationCircleRef.current.setOptions({ strokeOpacity: 0.95, strokeWeight: 5, fillOpacity: 0.32 });
      ownLocationCircleRef.current.setMap(map);
    }
  }, [ownLocation]);

  const focusOwnLocation = () => {
    const map = mapRef.current;
    if (!map || !ownLocation) return;
    map.panTo({ lat: ownLocation.latitude, lng: ownLocation.longitude });
    map.setZoom(Math.max(map.getZoom?.() ?? zoom, 15));
  };

  if (loadState === "missing-key") {
    return (
      <div className={`relative flex ${minHeightClassName} flex-col items-center justify-center rounded-[22px] border border-yellow-300/30 bg-[#053841]/95 p-8 text-center shadow-[0_14px_34px_rgba(0,0,0,0.2)]`}>
        <div className="text-5xl">🗺️</div>
        <h2 className="mt-4 text-3xl font-extrabold text-white">Google Maps Key fehlt</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75">Setze `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, dann erscheint hier die echte Google-Straßenkarte mit Zoom, Drag und Markern.</p>
      </div>
    );
  }

  return (
    <div className={`relative ${minHeightClassName} overflow-hidden rounded-[22px] border border-cyan-300/20 bg-[#053841] shadow-[0_14px_34px_rgba(0,0,0,0.2)]`}>
      <div ref={mapElementRef} className="absolute inset-0" />
      {loadState === "loading" && <div className="absolute inset-0 flex items-center justify-center bg-[#053841]/90 text-lg font-bold text-white">Google Maps wird geladen ...</div>}
      {loadState === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#053841]/95 p-8 text-center">
          <div className="text-5xl">⚠️</div>
          <h2 className="mt-4 text-2xl font-extrabold text-white">Google Maps konnte nicht geladen werden</h2>
          <p className="mt-3 max-w-xl text-sm text-white/70">Bitte API-Key, Domain-Referrer, Billing und Maps JavaScript API prüfen.</p>
        </div>
      )}
      <div className="pointer-events-none absolute left-5 top-5 z-10 rounded-xl bg-white/95 px-4 py-3 text-slate-800 shadow-lg backdrop-blur-sm">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-700">{title}</p>
        <p className="mt-1 text-sm font-semibold">{subtitle}</p>
      </div>
      {ownLocation && (
        <button type="button" onClick={focusOwnLocation} className="absolute bottom-5 right-5 z-10 rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white shadow-lg transition hover:bg-blue-500">
          🐉 Zu meinem Standort
        </button>
      )}
    </div>
  );
}
