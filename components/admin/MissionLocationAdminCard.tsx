"use client";

import { useEffect, useMemo, useState } from "react";
import { adventures } from "@/app/missionen/abenteuer/adventureData";
import { challenges } from "@/app/missionen/challenge/challengeData";
import { dailyMissions } from "@/app/missionen/tagesmissionen/missions";
import { weeklyMissions } from "@/app/missionen/wochenmissionen/missions";
import { Beta1EmptyState, Beta1SectionCard, Beta1StatusBadge } from "@/components/beta1/Beta1Foundation";
import { verifyAdminClaim, type AdminGuardState } from "@/lib/admin/beta1AdminGuards";
import {
  listAdminMissionLocations,
  upsertAdminMissionLocation,
  type AdminMissionLocation,
  type AdminMissionLocationStatus,
} from "@/lib/beta1/clientMissionLocationAdmin";
import { requestCurrentCoordinates } from "@/lib/beta1/clientUserContext";

type FormState = {
  locationId: string;
  title: string;
  subtitle: string;
  regionId: string;
  countryCode: string;
  locality: string;
  locationType: string;
  latitude: string;
  longitude: string;
  icon: string;
  partnerName: string;
  missionIds: string[];
  additionalMissionIds: string;
  safeLocationReviewed: boolean;
  safetyReviewNote: string;
  status: AdminMissionLocationStatus;
};

type MissionOption = {
  missionId: string;
  title: string;
  group: string;
};

const EMPTY_FORM: FormState = {
  locationId: "",
  title: "",
  subtitle: "",
  regionId: "",
  countryCode: "",
  locality: "",
  locationType: "public-space",
  latitude: "",
  longitude: "",
  icon: "📍",
  partnerName: "",
  missionIds: [],
  additionalMissionIds: "",
  safeLocationReviewed: false,
  safetyReviewNote: "",
  status: "draft",
};

const LOCATION_TYPES = [
  "public-space",
  "park",
  "museum",
  "zoo",
  "school",
  "playground",
  "historical-site",
  "sports-facility",
  "partner-location",
  "tourism-route",
];

function normalizeMissionIds(form: FormState) {
  const additional = form.additionalMissionIds
    .split(/[\n,;\s]+/)
    .map((value) => value.trim())
    .filter(Boolean);
  return [...new Set([...form.missionIds, ...additional])];
}

function formFromLocation(location: AdminMissionLocation): FormState {
  return {
    locationId: location.locationId,
    title: location.title,
    subtitle: location.subtitle ?? "",
    regionId: location.regionId,
    countryCode: location.countryCode ?? "",
    locality: location.locality ?? "",
    locationType: location.locationType,
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    icon: location.icon,
    partnerName: location.partnerName ?? "",
    missionIds: [...location.missionIds],
    additionalMissionIds: "",
    safeLocationReviewed: location.safeLocationReviewed,
    safetyReviewNote: location.safetyReviewNote ?? "",
    status: location.status,
  };
}

function distanceLabel(status: AdminMissionLocationStatus, reviewed: boolean) {
  if (status === "published" && reviewed) return "Weltweit abrufbar";
  if (status === "published") return "Unsichere Publikation blockiert";
  return "Entwurf";
}

export default function MissionLocationAdminCard() {
  const [guardState, setGuardState] = useState<AdminGuardState>("loading");
  const [guardMessage, setGuardMessage] = useState("Admin-Zugriff wird geprüft ...");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [locations, setLocations] = useState<AdminMissionLocation[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const missionOptions = useMemo<MissionOption[]>(() => [
    ...dailyMissions.map((mission) => ({ missionId: mission.id, title: mission.title, group: "Tagesmission" })),
    ...weeklyMissions.map((mission) => ({ missionId: mission.id, title: mission.title, group: "Wochenmission" })),
    ...adventures.map((mission) => ({ missionId: mission.missionId, title: mission.title, group: "Abenteuer" })),
    ...challenges.map((mission) => ({ missionId: mission.missionId, title: mission.title, group: "Challenge" })),
  ], []);
  const missionGroups = useMemo(
    () => [...new Set(missionOptions.map((option) => option.group))],
    [missionOptions],
  );
  const knownMissionIds = useMemo(
    () => new Set(missionOptions.map((option) => option.missionId)),
    [missionOptions],
  );
  const selectedMissionIds = normalizeMissionIds(form);
  const unknownMissionIds = selectedMissionIds.filter((missionId) => !knownMissionIds.has(missionId));
  const publishedCount = locations.filter((location) => location.status === "published" && location.safeLocationReviewed).length;
  const countryCount = new Set(locations.map((location) => location.countryCode).filter(Boolean)).size;

  const loadLocations = async () => {
    if (guardState !== "allowed") return;
    try {
      setLoadingList(true);
      setError("");
      const result = await listAdminMissionLocations();
      setLocations(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Missionsorte konnten nicht geladen werden.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    verifyAdminClaim().then((guard) => {
      if (cancelled) return;
      setGuardState(guard.state);
      setGuardMessage(guard.message);
      if (guard.state === "allowed") {
        setLoadingList(true);
        listAdminMissionLocations()
          .then((result) => {
            if (!cancelled) setLocations(result);
          })
          .catch((cause) => {
            if (!cancelled) setError(cause instanceof Error ? cause.message : "Missionsorte konnten nicht geladen werden.");
          })
          .finally(() => {
            if (!cancelled) setLoadingList(false);
          });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const patchForm = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage("");
  };

  const toggleMission = (missionId: string) => {
    setForm((current) => ({
      ...current,
      missionIds: current.missionIds.includes(missionId)
        ? current.missionIds.filter((id) => id !== missionId)
        : [...current.missionIds, missionId],
    }));
    setMessage("");
  };

  const useCurrentLocation = async () => {
    if (locating) return;
    try {
      setLocating(true);
      setError("");
      const coordinates = await requestCurrentCoordinates({ enableHighAccuracy: true, maximumAge: 5000 });
      setForm((current) => ({
        ...current,
        latitude: coordinates.latitude.toFixed(6),
        longitude: coordinates.longitude.toFixed(6),
      }));
      setMessage(`Gerätestandort übernommen · Genauigkeit ca. ${coordinates.accuracyMeters ?? "?"} m. Vor Veröffentlichung bitte Sicherheitsprüfung dokumentieren.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gerätestandort konnte nicht gelesen werden.");
    } finally {
      setLocating(false);
    }
  };

  const saveLocation = async () => {
    if (saving || guardState !== "allowed") return;
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    const missionIds = normalizeMissionIds(form);
    if (!form.locationId.trim() || !form.title.trim() || !form.regionId.trim()) {
      setError("Location-ID, Titel und Regions-ID sind Pflichtfelder.");
      return;
    }
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      setError("Breiten- oder Längengrad ist ungültig.");
      return;
    }
    if (missionIds.length === 0) {
      setError("Ordne dem Ort mindestens eine Mission zu.");
      return;
    }
    if (form.status === "published" && (!form.safeLocationReviewed || !form.safetyReviewNote.trim())) {
      setError("Vor einer Veröffentlichung sind Sicherheitsprüfung und Prüfnotiz erforderlich.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");
      const result = await upsertAdminMissionLocation({
        locationId: form.locationId,
        title: form.title,
        subtitle: form.subtitle,
        regionId: form.regionId,
        countryCode: form.countryCode,
        locality: form.locality,
        locationType: form.locationType,
        latitude,
        longitude,
        icon: form.icon,
        partnerName: form.partnerName,
        missionIds,
        safeLocationReviewed: form.safeLocationReviewed,
        safetyReviewNote: form.safetyReviewNote,
        status: form.status,
      });
      setMessage(`${result.locationId} wurde als ${result.status === "published" ? "sicher veröffentlichter" : "Entwurfs-"}Ort gespeichert · ${result.missionIds.length} Missionen · Region ${result.regionId}.`);
      await loadLocations();
      window.dispatchEvent(new CustomEvent("wellfit-beta1-projection-updated"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Missionsort konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  };

  if (guardState !== "allowed") {
    return (
      <Beta1SectionCard
        title="Weltweite Missionsorte"
        description="Nur verifizierte Administratoren dürfen Ortskoordinaten und Sicherheitsstatus veröffentlichen."
      >
        <p className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-50">{guardMessage}</p>
      </Beta1SectionCard>
    );
  }

  return (
    <div className="space-y-5">
      <Beta1SectionCard
        title="Weltweite Missionsorte veröffentlichen"
        description="Jeder Ort ist global katalogisiert, aber nur Nutzer in seiner unmittelbaren Umgebung sehen und verwenden ihn. Veröffentlichung erfordert eine dokumentierte Sicherheitsprüfung."
      >
        <div className="mb-4 flex flex-wrap gap-2">
          <Beta1StatusBadge tone="info">{locations.length} Orte</Beta1StatusBadge>
          <Beta1StatusBadge tone="success">{publishedCount} sicher veröffentlicht</Beta1StatusBadge>
          <Beta1StatusBadge tone="neutral">{countryCount} Länder</Beta1StatusBadge>
          <Beta1StatusBadge tone="warning">Startgrenze: max. 500 m</Beta1StatusBadge>
        </div>

        {error && <p className="mb-4 rounded-lg border border-rose-300/30 bg-rose-300/10 p-3 text-sm text-rose-100">{error}</p>}
        {message && <p className="mb-4 rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-3 text-sm text-emerald-100">{message}</p>}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="text-xs text-slate-200">
            Location-ID *
            <input value={form.locationId} onChange={(event) => patchForm("locationId", event.target.value)} placeholder="jp-tokyo-ueno-park" className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white" />
          </label>
          <label className="text-xs text-slate-200">
            Titel *
            <input value={form.title} onChange={(event) => patchForm("title", event.target.value)} placeholder="Ueno Park Challenge Hub" className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white" />
          </label>
          <label className="text-xs text-slate-200">
            Untertitel
            <input value={form.subtitle} onChange={(event) => patchForm("subtitle", event.target.value)} placeholder="Sicherer Startpunkt am Haupteingang" className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white" />
          </label>
          <label className="text-xs text-slate-200">
            Regions-ID *
            <input value={form.regionId} onChange={(event) => patchForm("regionId", event.target.value.toLowerCase())} placeholder="jp-tokyo" className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white" />
          </label>
          <label className="text-xs text-slate-200">
            Ländercode
            <input value={form.countryCode} onChange={(event) => patchForm("countryCode", event.target.value.toUpperCase().slice(0, 3))} placeholder="JP" className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white" />
          </label>
          <label className="text-xs text-slate-200">
            Stadt / Gemeinde
            <input value={form.locality} onChange={(event) => patchForm("locality", event.target.value)} placeholder="Tokyo" className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white" />
          </label>
          <label className="text-xs text-slate-200">
            Ortstyp
            <select value={form.locationType} onChange={(event) => patchForm("locationType", event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white">
              {LOCATION_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <label className="text-xs text-slate-200">
            Partner
            <input value={form.partnerName} onChange={(event) => patchForm("partnerName", event.target.value)} placeholder="Museum, Stadt oder Sponsor" className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white" />
          </label>
          <label className="text-xs text-slate-200">
            Karten-Icon
            <input value={form.icon} onChange={(event) => patchForm("icon", event.target.value.slice(0, 12))} placeholder="📍" className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white" />
          </label>
          <label className="text-xs text-slate-200">
            Breitengrad *
            <input inputMode="decimal" value={form.latitude} onChange={(event) => patchForm("latitude", event.target.value)} placeholder="35.681236" className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white" />
          </label>
          <label className="text-xs text-slate-200">
            Längengrad *
            <input inputMode="decimal" value={form.longitude} onChange={(event) => patchForm("longitude", event.target.value)} placeholder="139.767125" className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white" />
          </label>
          <div className="flex items-end">
            <button type="button" onClick={useCurrentLocation} disabled={locating} className="w-full rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-sm font-bold text-cyan-100 disabled:opacity-50">
              {locating ? "Standort wird ermittelt ..." : "Gerätestandort übernehmen"}
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/35 p-4">
          <p className="text-sm font-black text-white">Missionen am Ort *</p>
          <p className="mt-1 text-xs text-slate-300">Nur zugeordnete Missionen werden Nutzern in der Umgebung dieses Ortes angeboten.</p>
          <div className="mt-4 space-y-4">
            {missionGroups.map((group) => (
              <div key={group}>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-200">{group}</p>
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {missionOptions.filter((option) => option.group === group).map((option) => (
                    <label key={option.missionId} className="flex cursor-pointer items-start gap-2 rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-slate-100">
                      <input type="checkbox" checked={form.missionIds.includes(option.missionId)} onChange={() => toggleMission(option.missionId)} className="mt-0.5" />
                      <span><strong>{option.title}</strong><span className="mt-0.5 block text-[10px] text-slate-400">{option.missionId}</span></span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <label className="mt-4 block text-xs text-slate-200">
            Zusätzliche publizierte Missions-IDs
            <textarea value={form.additionalMissionIds} onChange={(event) => patchForm("additionalMissionIds", event.target.value)} placeholder="Eine ID pro Zeile oder kommagetrennt" rows={3} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white" />
          </label>
          <p className="mt-2 text-xs text-slate-400">Ausgewählt: {selectedMissionIds.length}{unknownMissionIds.length > 0 ? ` · zusätzliche IDs: ${unknownMissionIds.join(", ")}` : ""}</p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-xs text-slate-200">
            Status
            <select value={form.status} onChange={(event) => patchForm("status", event.target.value as AdminMissionLocationStatus)} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white">
              <option value="draft">Entwurf</option>
              <option value="published">Sicher veröffentlichen</option>
            </select>
          </label>
          <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100">
            <input type="checkbox" checked={form.safeLocationReviewed} onChange={(event) => patchForm("safeLocationReviewed", event.target.checked)} />
            Sicherheitsprüfung dokumentiert
          </label>
          <label className="md:col-span-2 text-xs text-slate-200">
            Sicherheitsprüfnotiz {form.status === "published" ? "*" : ""}
            <textarea value={form.safetyReviewNote} onChange={(event) => patchForm("safetyReviewNote", event.target.value)} placeholder="Zugänglichkeit, Verkehr, Öffnungszeiten, Gefahrenpunkte und verantwortliche Prüfung dokumentieren." rows={4} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white" />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={saveLocation} disabled={saving} className="rounded-lg bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? "Server prüft und speichert ..." : form.status === "published" ? "Ort sicher veröffentlichen" : "Entwurf speichern"}
          </button>
          <button type="button" onClick={() => { setForm(EMPTY_FORM); setError(""); setMessage(""); }} className="rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white">
            Neues Formular
          </button>
          <button type="button" onClick={loadLocations} disabled={loadingList} className="rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
            {loadingList ? "Liste wird geladen ..." : "Liste aktualisieren"}
          </button>
        </div>
      </Beta1SectionCard>

      <Beta1SectionCard
        title="Globaler Ortskatalog"
        description="Orte sind nach Land und Gemeinde sortiert. Entwürfe und nicht geprüfte Orte werden Nutzern niemals als nahe Mission angeboten."
      >
        {locations.length === 0 && !loadingList ? (
          <Beta1EmptyState title="Noch keine Missionsorte" detail="Lege den ersten sicher geprüften Ort an. WellFit kann danach dieselbe Missions-Engine weltweit verwenden." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs text-slate-200">
              <thead className="border-b border-white/10 text-[10px] uppercase tracking-[0.14em] text-slate-400">
                <tr>
                  <th className="px-3 py-2">Ort</th>
                  <th className="px-3 py-2">Region</th>
                  <th className="px-3 py-2">Koordinaten</th>
                  <th className="px-3 py-2">Missionen</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location) => (
                  <tr key={location.locationId} className="border-b border-white/5 align-top">
                    <td className="px-3 py-3"><strong className="text-white">{location.icon} {location.title}</strong><span className="mt-1 block text-[10px] text-slate-400">{location.locationId}{location.locality ? ` · ${location.locality}` : ""}</span></td>
                    <td className="px-3 py-3">{location.regionId}<span className="mt-1 block text-[10px] text-slate-400">{location.countryCode || "—"} · {location.locationType}</span></td>
                    <td className="px-3 py-3 font-mono text-[11px]">{location.latitude.toFixed(6)}<br />{location.longitude.toFixed(6)}</td>
                    <td className="px-3 py-3">{location.missionIds.length}<span className="mt-1 block max-w-[260px] truncate text-[10px] text-slate-400" title={location.missionIds.join(", ")}>{location.missionIds.join(", ")}</span></td>
                    <td className="px-3 py-3"><Beta1StatusBadge tone={location.status === "published" && location.safeLocationReviewed ? "success" : location.status === "draft" ? "neutral" : "warning"}>{distanceLabel(location.status, location.safeLocationReviewed)}</Beta1StatusBadge></td>
                    <td className="px-3 py-3"><button type="button" onClick={() => { setForm(formFromLocation(location)); setMessage(`${location.locationId} zur Bearbeitung geladen.`); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-lg border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 font-bold text-cyan-100">Bearbeiten</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Beta1SectionCard>
    </div>
  );
}
