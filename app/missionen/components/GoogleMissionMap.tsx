"use client";

import { useEffect, useRef, useState } from "react";

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
  const [loadState, setLoadState] = useState<"missing-key" | "loading" | "ready" | "error">("loading");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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
        const center = selected ? { lat: selected.lat, lng: selected.lng } : { lat: 48.2082, lng: 16.3738 };

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
            label: {
              text: markerItem.id === selectedMarkerId ? "★" : markerItem.icon,
              fontSize: markerItem.id === selectedMarkerId ? "24px" : "20px",
            },
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

    return () => {
      cancelled = true;
    };
  }, [apiKey, markers, onSelectMarker, selectedMarkerId, zoom]);

  useEffect(() => {
    const google = (window as GoogleMapsWindow).google;
    const map = mapRef.current;
    if (!google?.maps || !map) return;

    const selected = markers.find((marker) => marker.id === selectedMarkerId);
    if (selected) {
      map.panTo({ lat: selected.lat, lng: selected.lng });
      markerRefs.current.forEach((marker, index) => {
        const markerItem = markers[index];
        if (!markerItem) return;
        marker.setLabel({
          text: markerItem.id === selectedMarkerId ? "★" : markerItem.icon,
          fontSize: markerItem.id === selectedMarkerId ? "24px" : "20px",
        });
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: markerColor(markerItem),
          fillOpacity: 0.95,
          strokeColor: markerItem.id === selectedMarkerId ? "#fde047" : "#ffffff",
          strokeWeight: markerItem.id === selectedMarkerId ? 4 : 2,
          scale: markerItem.id === selectedMarkerId ? 17 : 14,
        });
      });
    }
  }, [markers, selectedMarkerId]);

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
    </div>
  );
}
