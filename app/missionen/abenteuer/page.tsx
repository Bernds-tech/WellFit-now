"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppSidebar from "@/app/AppSidebar";
import { useWellFitBrightness } from "@/app/hooks/useWellFitBrightness";
import MissionLifecyclePanel from "@/components/mission/MissionLifecyclePanel";
import type { Beta1NearbyMissionLocation } from "@/lib/beta1/clientNearbyMissionLocations";
import {
  ADVENTURE_LIFECYCLE_STEPS,
  getMissionStatusPresentation,
} from "@/lib/beta1/missionStatusPresentation.mjs";
import GoogleMissionMap from "../components/GoogleMissionMap";
import {
  adventureCategories,
  adventures,
  missionTabs,
  type AdventureCategory,
} from "./adventureData";
import { useAdventureMissionFirebase } from "./useAdventureMissionFirebase";

const favoriteStorageKey = "wellfit-favorite-adventure-missions-v2";

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(favoriteStorageKey) ?? "[]");
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
  } catch {
    return [];
  }
}

function formatDistance(distanceKm: number) {
  return distanceKm < 1 ? `${Math.max(1, Math.round(distanceKm * 1000))} m` : `${distanceKm.toFixed(1)} km`;
}

export default function AbenteuerPage() {
  const [brightness, setBrightness] = useWellFitBrightness(100);
  const [message, setMessage] = useState("Abenteuer werden aus deiner aktuellen Umgebung geladen.");
  const [selectedCategory, setSelectedCategory] = useState<"Alle Orte" | AdventureCategory>("Alle Orte");
  const [selectedAdventureId, setSelectedAdventureId] = useState<number>(1);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [favoriteMissionIds, setFavoriteMissionIds] = useState<string[]>([]);
  const runtime = useAdventureMissionFirebase();

  const {
    userId,
    ready,
    locationReady,
    locationLoading,
    loadNearbyLocations,
  } = runtime;

  useEffect(() => {
    setFavoriteMissionIds(readFavorites());
  }, []);

  useEffect(() => {
    if (!userId || !ready || locationReady || locationLoading) return;
    loadNearbyLocations(25).then((locations) => {
      setMessage(
        locations.length > 0
          ? `${locations.length} sicher geprüfte WellFit-Orte in deiner Umgebung gefunden.`
          : "In deinem aktuellen Radius sind noch keine veröffentlichten WellFit-Abenteuerorte verfügbar.",
      );
    }).catch((error) => {
      setMessage(error instanceof Error ? error.message : "Deine Umgebung konnte nicht geladen werden.");
    });
  }, [loadNearbyLocations, locationLoading, locationReady, ready, userId]);

  const filteredAdventures = useMemo(
    () => selectedCategory === "Alle Orte"
      ? adventures
      : adventures.filter((adventure) => adventure.category === selectedCategory),
    [selectedCategory],
  );

  useEffect(() => {
    if (!filteredAdventures.some((adventure) => adventure.id === selectedAdventureId) && filteredAdventures[0]) {
      setSelectedAdventureId(filteredAdventures[0].id);
    }
  }, [filteredAdventures, selectedAdventureId]);

  const selectedAdventure = adventures.find((adventure) => adventure.id === selectedAdventureId) ?? adventures[0];
  const visibleMissionIds = useMemo(
    () => new Set(filteredAdventures.map((adventure) => adventure.missionId)),
    [filteredAdventures],
  );
  const visibleLocations = useMemo(
    () => runtime.nearbyLocations.filter((location) => location.missionIds.some((missionId) => visibleMissionIds.has(missionId))),
    [runtime.nearbyLocations, visibleMissionIds],
  );
  const adventureLocations = useMemo(
    () => runtime.nearbyLocations.filter((location) => location.missionIds.includes(selectedAdventure.missionId)),
    [runtime.nearbyLocations, selectedAdventure.missionId],
  );

  useEffect(() => {
    const currentAttempt = runtime.activeAttempts.find((attempt) => attempt.missionId === selectedAdventure.missionId);
    const activeLocation = currentAttempt
      ? runtime.nearbyLocations.find((location) => location.locationId === currentAttempt.locationId)
      : null;
    if (activeLocation) {
      setSelectedLocationId(activeLocation.locationId);
      return;
    }
    if (!adventureLocations.some((location) => location.locationId === selectedLocationId)) {
      setSelectedLocationId(adventureLocations[0]?.locationId ?? null);
    }
  }, [adventureLocations, runtime.activeAttempts, runtime.nearbyLocations, selectedAdventure.missionId, selectedLocationId]);

  const selectedLocation = adventureLocations.find((location) => location.locationId === selectedLocationId) ?? null;
  const activeAttempt = runtime.activeAttempts.find((attempt) => attempt.missionId === selectedAdventure.missionId) ?? null;
  const completed = runtime.completedMissionIds.includes(selectedAdventure.missionId);
  const started = Boolean(activeAttempt) || runtime.startedMissionIds.includes(selectedAdventure.missionId);
  const busy = runtime.busyMissionId === selectedAdventure.missionId;
  const statusPresentation = getMissionStatusPresentation({
    isAuthenticated: Boolean(runtime.userId),
    ready: runtime.ready,
    progressSource: runtime.progressSource,
    isStarted: started,
    isCompleted: completed,
    reviewStatus: activeAttempt?.reviewStatus ?? null,
    actionBusy: busy,
    missionKind: "adventure",
  });

  const accessBalanceMissing = !runtime.walletAvailable || runtime.walletBalance < selectedAdventure.accessCostWfxp;
  const primaryActionDisabled = statusPresentation.actionDisabled
    || busy
    || completed
    || !runtime.userId
    || runtime.progressSource !== "server"
    || (!started && (!selectedLocation || accessBalanceMissing));
  const primaryActionLabel = !runtime.userId
    ? "Login erforderlich"
    : !runtime.ready
      ? "Serverstatus wird geladen..."
      : runtime.progressSource !== "server"
        ? "Serverstatus aktualisieren"
        : !started && !selectedLocation
          ? "Kein naher Startort verfügbar"
          : !started && accessBalanceMissing
            ? `Mindestens ${selectedAdventure.accessCostWfxp} interne WFXP erforderlich`
            : statusPresentation.actionLabel;
  const displayedPresentation = primaryActionLabel === statusPresentation.actionLabel
    ? statusPresentation
    : { ...statusPresentation, actionLabel: primaryActionLabel };

  const mapMarkers = visibleLocations.map((location, index) => {
    const linkedAdventure = filteredAdventures.find((adventure) => location.missionIds.includes(adventure.missionId));
    return {
      id: index + 1,
      title: location.title,
      subtitle: `${formatDistance(location.distanceKm)}${location.locality ? ` · ${location.locality}` : ""}`,
      icon: location.icon || linkedAdventure?.icon || "📍",
      lat: location.latitude,
      lng: location.longitude,
      status: "sicher veröffentlicht",
    };
  });
  const selectedMarkerId = Math.max(0, visibleLocations.findIndex((location) => location.locationId === selectedLocationId) + 1);

  const selectMapLocation = (markerId: number) => {
    const location = visibleLocations[markerId - 1];
    if (!location) return;
    setSelectedLocationId(location.locationId);
    const matchingAdventure = filteredAdventures.find((adventure) => location.missionIds.includes(adventure.missionId));
    if (matchingAdventure) setSelectedAdventureId(matchingAdventure.id);
  };

  const toggleFavorite = (missionId: string) => {
    const next = favoriteMissionIds.includes(missionId)
      ? favoriteMissionIds.filter((id) => id !== missionId)
      : [...favoriteMissionIds, missionId];
    setFavoriteMissionIds(next);
    window.localStorage.setItem(favoriteStorageKey, JSON.stringify(next));
  };

  const reloadEnvironment = async () => {
    try {
      const locations = await runtime.loadNearbyLocations(runtime.locationRadiusKm || 25);
      setMessage(
        locations.length > 0
          ? `${locations.length} sicher geprüfte WellFit-Orte in deiner Umgebung gefunden.`
          : `Im Radius von ${runtime.locationRadiusKm || 25} km sind noch keine veröffentlichten Abenteuerorte verfügbar.`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Deine Umgebung konnte nicht geladen werden.");
    }
  };

  const refreshServerStatus = async () => {
    if (!runtime.userId) {
      setMessage("Bitte melde dich an, um den serverseitigen Abenteuerstatus zu laden.");
      return;
    }
    try {
      setMessage("Serverstatus, Zugangsbuchungen, Reviews und interne WFXP werden aktualisiert...");
      const projection = await runtime.refreshProgress();
      if (!projection) {
        setMessage("Serverstatus konnte ohne Anmeldung nicht geladen werden.");
        return;
      }
      setMessage(
        `Serverstatus aktualisiert · ${projection.activeAttempts.length} offene Abenteuer · ${projection.completedMissionIds.length} abgeschlossen · ${projection.walletBalance} interne WFXP.`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Der serverseitige Abenteuerstatus konnte nicht aktualisiert werden.");
    }
  };

  const continueAdventure = async () => {
    if (!runtime.userId) {
      setMessage("Bitte melde dich an, um Abenteuer serverseitig zu verwenden.");
      return;
    }
    if (runtime.progressSource !== "server") {
      setMessage("Die Serverprojektion ist nicht verfügbar. Aktualisiere zuerst den Serverstatus; lokale Daten besitzen keine Zugangs-, Abschluss- oder Reward-Autorität.");
      return;
    }
    if (completed) {
      setMessage(`${selectedAdventure.title} wurde bereits serverseitig abgeschlossen.`);
      return;
    }

    try {
      if (!started) {
        if (!selectedLocation) {
          setMessage("Wähle zuerst einen veröffentlichten Abenteuerort in deiner Umgebung.");
          return;
        }
        if (accessBalanceMissing) {
          setMessage(`Für den einmaligen Zugang werden ${selectedAdventure.accessCostWfxp} interne WFXP benötigt.`);
          return;
        }
        setMessage(`Standort und einmaliger interner WFXP-Zugang für „${selectedAdventure.title}“ werden serverseitig geprüft...`);
        const result = await runtime.activateAccess(selectedAdventure, selectedLocation);
        setMessage(result.message);
        return;
      }

      setMessage(
        activeAttempt?.evidenceId
          ? "Der bestehende Abenteuer-Vorgang wird fortgesetzt und sein Reviewstatus serverseitig geprüft..."
          : "Der bereits gebuchte Abenteuerzugang bleibt aktiv; der Abschluss wird jetzt zur Prüfung eingereicht...",
      );
      const result = await runtime.continueAdventure(selectedAdventure);
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Das Abenteuer konnte nicht sicher fortgesetzt werden.");
    }
  };

  const activeLocationLabel = activeAttempt?.locationTitle
    ?? selectedLocation?.title
    ?? "Kein veröffentlichter Startort ausgewählt";
  const serverPathLabel = !runtime.ready
    ? "Serverprojektion wird geladen"
    : runtime.progressSource === "server"
      ? "Veröffentlichter Startort → einmaliger Zugang → Bestätigung → Review → Completion → interne WFXP"
      : "Keine Serverprojektion · keine Zugangs-, Abschluss- oder Reward-Autorität";

  return (
    <main
      className="h-screen w-screen overflow-hidden text-white"
      style={{ background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))` }}
    >
      <div className="flex h-full">
        <AppSidebar brightness={brightness} onBrightnessChange={setBrightness} />

        <section className="relative flex h-full flex-1 flex-col overflow-hidden px-7 py-5 pb-0">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-5xl font-extrabold leading-none">Abenteuer</h1>
              <p className="mt-2 text-lg text-cyan-100/90">{runtime.lastError || runtime.locationError || message}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100/50">{serverPathLabel}</p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => void reloadEnvironment()}
                disabled={!runtime.userId || runtime.locationLoading || busy}
                className="rounded-xl border border-cyan-200/30 bg-cyan-200/10 px-4 py-2 text-sm font-bold text-cyan-50 disabled:opacity-50"
              >
                {runtime.locationLoading ? "Umgebung wird geprüft..." : "Meine Umgebung aktualisieren"}
              </button>
              <button
                type="button"
                onClick={() => void refreshServerStatus()}
                disabled={!runtime.userId || busy}
                className="rounded-xl border border-cyan-200/30 bg-cyan-200/10 px-4 py-2 text-sm font-bold text-cyan-50 disabled:opacity-50"
              >
                Serverstatus aktualisieren
              </button>
              <div className="rounded-full bg-[#073b44] px-4 py-2 text-sm">Level {runtime.level}</div>
              <div className="rounded-full border border-yellow-300/30 bg-yellow-300/10 px-4 py-2 text-sm font-black text-yellow-200">
                {runtime.walletBalance} interne WFXP
              </div>
            </div>
          </div>

          <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-5 rounded-full border border-white/10 bg-[#0b6d79]/35 px-5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm">
              {missionTabs.map((tab) => tab.label === "Abenteuer" ? (
                <div key={tab.label} className="relative pb-1 text-base font-semibold text-orange-400">
                  {tab.label}<span className="absolute -bottom-2 left-0 right-0 h-[2px] rounded-full bg-orange-400" />
                </div>
              ) : (
                <Link key={tab.label} href={tab.href} className="pb-1 text-base text-white/85 hover:text-white">{tab.label}</Link>
              ))}
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {adventureCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${
                  selectedCategory === category
                    ? "border-cyan-200 bg-cyan-300 text-slate-950"
                    : "border-white/15 bg-black/20 text-white/80 hover:bg-white/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[2.05fr_0.95fr] gap-4 overflow-hidden pb-20">
            <GoogleMissionMap
              title="WellFit-Abenteuer in deiner Umgebung"
              subtitle={runtime.locationReady
                ? `${visibleLocations.length} veröffentlichte Orte im Radius von ${runtime.locationRadiusKm} km`
                : "Standortfreigabe lädt nur nahe, serverseitig geprüfte Orte"}
              markers={mapMarkers}
              selectedMarkerId={selectedMarkerId}
              onSelectMarker={selectMapLocation}
              zoom={13}
              minHeightClassName="h-full min-h-[520px]"
              autoRequestLocation
            />

            <div className="min-h-0 overflow-y-auto rounded-[22px] border border-cyan-300/10 bg-[#032732]/95 p-5 shadow-[0_10px_28px_rgba(0,0,0,0.2)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/15 text-3xl">{selectedAdventure.icon}</div>
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-cyan-200">{selectedAdventure.category}</p>
                  <h2 className="mt-1 text-2xl font-black text-white">{selectedAdventure.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFavorite(selectedAdventure.missionId)}
                  className={`text-2xl ${favoriteMissionIds.includes(selectedAdventure.missionId) ? "text-yellow-300" : "text-white/30"}`}
                  aria-label="Abenteuer favorisieren"
                >
                  ★
                </button>
              </div>

              <div className="mt-4">
                <MissionLifecyclePanel
                  presentation={displayedPresentation}
                  periodLabel="Einmaliger Zugang · einmaliger Abschluss"
                  authorityLabel="Serverseitig veröffentlichter Abenteuerort"
                  attemptStatus={activeAttempt?.attemptStatus ?? null}
                  steps={ADVENTURE_LIFECYCLE_STEPS}
                  resumeDetail="Der bezahlte Zugang und der bestehende Abenteuer-Vorgang werden fortgesetzt. Ein erneuter Aufruf erzeugt keinen zweiten Zugang, Abzug oder Reward."
                  compact
                />
              </div>

              {completed ? (
                <div className="mt-4 rounded-xl border border-emerald-300/40 bg-emerald-400/15 px-3 py-2 text-center text-sm font-bold text-emerald-100">
                  🏆 Interne Reward-Buchung bestätigt · +{selectedAdventure.rewardWfxp} WFXP
                </div>
              ) : null}

              <p className="mt-4 text-sm leading-relaxed text-white/80">{selectedAdventure.description}</p>

              <div className="mt-4 rounded-2xl border border-cyan-200/20 bg-cyan-200/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">Aktueller Startort</p>
                <p className="mt-2 font-black text-white">{activeLocationLabel}</p>
                {selectedLocation && !activeAttempt && (
                  <p className="mt-1 text-xs text-white/65">
                    {formatDistance(selectedLocation.distanceKm)} entfernt
                    {selectedLocation.locality ? ` · ${selectedLocation.locality}` : ""}
                    {selectedLocation.countryCode ? ` · ${selectedLocation.countryCode}` : ""}
                  </p>
                )}
                {activeAttempt && (
                  <p className="mt-1 text-xs text-white/65">
                    Zugang bei {activeAttempt.accessStartDistanceMeters} m Entfernung serverseitig autorisiert.
                  </p>
                )}
                <p className="mt-2 text-[11px] leading-relaxed text-white/55">
                  Die erstmalige Zugangsaktivierung ist nur innerhalb von 500 Metern möglich. Übermittelte Rohkoordinaten werden nicht im Missionsdatensatz gespeichert.
                </p>
              </div>

              {adventureLocations.length > 1 && !activeAttempt && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-white/55">Verfügbare Orte</p>
                  <div className="space-y-2">
                    {adventureLocations.map((location) => (
                      <button
                        key={location.locationId}
                        type="button"
                        onClick={() => setSelectedLocationId(location.locationId)}
                        className={`w-full rounded-xl border px-3 py-2 text-left text-xs transition ${
                          selectedLocationId === location.locationId
                            ? "border-cyan-200 bg-cyan-200/15 text-white"
                            : "border-white/10 bg-black/15 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        <span className="font-black">{location.title}</span>
                        <span className="ml-2">{formatDistance(location.distanceKm)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5">
                <h3 className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Missions-Meilensteine</h3>
                <div className="mt-3 space-y-2">
                  {selectedAdventure.milestones.map((milestone, index) => (
                    <div key={milestone} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/15 px-3 py-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-black">{index + 1}</span>
                      <p className="text-xs text-white/80">{milestone}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-orange-300/25 bg-orange-300/10 p-3">
                  <p className="text-[10px] uppercase text-white/55">Einmaliger interner Zugang</p>
                  <p className="mt-1 text-xl font-black text-orange-200">{selectedAdventure.accessCostWfxp} WFXP</p>
                </div>
                <div className="rounded-xl border border-yellow-300/25 bg-yellow-300/10 p-3">
                  <p className="text-[10px] uppercase text-white/55">Interner Reward nach Review</p>
                  <p className="mt-1 text-xl font-black text-yellow-200">+{selectedAdventure.rewardWfxp} WFXP</p>
                </div>
              </div>

              {(runtime.lastError || runtime.locationError) && (
                <p className="mt-4 rounded-xl border border-rose-300/25 bg-rose-300/10 p-3 text-xs text-rose-100">
                  {runtime.lastError ?? runtime.locationError}
                </p>
              )}

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={() => void continueAdventure()}
                  disabled={primaryActionDisabled}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {displayedPresentation.actionLabel}
                </button>
                <button
                  type="button"
                  onClick={() => void refreshServerStatus()}
                  disabled={!runtime.userId || busy}
                  className="w-full rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-50 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Serverstatus aktualisieren
                </button>
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-white/50">
                Interne Beta-WFXP sind nicht übertragbare Fortschrittspunkte ohne Geldwert und ohne Auszahlung. Favoriten bleiben lokal; Zugang, Bestätigung, Review, Completion, Abzug und Reward sind ausschließlich serverautoritativ.
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-cyan-400/10 bg-[#062f35]/95 px-5 py-3">
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/65">
              <span className="rounded-lg bg-black/20 px-3 py-2">Weltweiter Katalog</span>
              <span className="rounded-lg bg-black/20 px-3 py-2">Umkreis: {runtime.locationRadiusKm} km</span>
              <span className="rounded-lg bg-black/20 px-3 py-2">Rohstandort serverseitig nicht gespeichert</span>
              <span className="rounded-lg bg-black/20 px-3 py-2">{runtime.completedMissionIds.length}/{adventures.length} Abenteuer abgeschlossen</span>
            </div>
            <span className="text-xs font-black text-yellow-200">Interne WFXP · nicht übertragbar · kein Cashout</span>
          </div>
        </section>
      </div>
    </main>
  );
}
