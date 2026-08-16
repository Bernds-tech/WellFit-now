"use client";

import { useCallback, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import SettingsCard from "./SettingsCard";

type WebSession = { id: string; deviceLabel: string; createdAt: string | null; expiresAt: string | null; current: boolean };

function formatDate(value: string | null) {
  if (!value) return "–";
  return new Intl.DateTimeFormat("de-AT", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export default function ActiveSessionsCard() {
  const [sessions, setSessions] = useState<WebSession[]>([]);
  const [message, setMessage] = useState("Aktive Sitzungen werden geladen …");
  const load = useCallback(async () => {
    const response = await fetch("/api/auth/sessions", { cache: "no-store" });
    if (!response.ok) throw new Error("Sitzungen konnten nicht geladen werden.");
    const data = await response.json() as { sessions?: WebSession[] };
    setSessions(Array.isArray(data.sessions) ? data.sessions : []);
    setMessage("");
  }, []);
  useEffect(() => {
    queueMicrotask(() => void load().catch((error) => setMessage(error instanceof Error ? error.message : "Sitzungen konnten nicht geladen werden.")));
  }, [load]);

  const revoke = async (session: WebSession) => {
    setMessage("Sitzung wird beendet …");
    const response = await fetch("/api/auth/sessions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: session.id }) });
    if (!response.ok) { setMessage("Sitzung konnte nicht beendet werden."); return; }
    if (session.current) { await signOut(auth); window.location.assign("/login"); return; }
    await load();
    setMessage("Sitzung wurde beendet.");
  };

  return <SettingsCard title="Aktive Geräte"><p className="mb-3 text-xs text-white/65">WellFit speichert dafür keine IP-Adresse und keinen Standort.</p><div className="space-y-2">{sessions.map((session) => <div key={session.id} className="rounded-lg border border-cyan-300/10 bg-[#082f36] p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-white">{session.deviceLabel}{session.current ? " · dieses Gerät" : ""}</p><p className="mt-1 text-xs text-white/55">Angemeldet: {formatDate(session.createdAt)}<br />Gültig bis: {formatDate(session.expiresAt)}</p></div><button type="button" onClick={() => void revoke(session)} className="rounded-lg border border-red-400/30 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-400/10">Beenden</button></div></div>)}{!message && sessions.length === 0 ? <p className="text-sm text-white/60">Keine aktive Websitzung gefunden.</p> : null}</div>{message ? <p className="mt-3 text-xs text-cyan-100">{message}</p> : null}</SettingsCard>;
}
