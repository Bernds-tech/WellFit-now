"use client";

import { useEffect, useState } from "react";
import { beta1AdminClient } from "@/lib/admin/beta1AdminClient";
import { verifyAdminClaim } from "@/lib/admin/beta1AdminGuards";

export default function Beta1AdminPanel() {
  const [guardMessage, setGuardMessage] = useState("Admin-Zugriff wird geprüft ...");
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    verifyAdminClaim().then((guard) => {
      setAllowed(guard.isAdmin && guard.isVerified);
      setGuardMessage(guard.message);
    });
  }, []);

  const run = async (label: string, action: () => Promise<{ accepted: boolean; message?: string }>) => {
    setLoading(label);
    const res = await action();
    setResult(res.accepted ? `${label}: erfolgreich.` : `${label}: ${res.message ?? "fehlgeschlagen."}`);
    setLoading(null);
  };

  if (!allowed) return <section className="rounded-lg border border-amber-400/40 bg-amber-300/10 p-4 text-sm text-amber-50">{guardMessage}</section>;

  return (
    <section className="space-y-4 text-sm text-white">
      <p className="rounded border border-cyan-400/30 bg-cyan-300/10 p-3">Admin-Panel (Beta-1): Nur bestehende serverseitige Callables, keine clientseitige Autorität.</p>
      <AdminForm title="Mission Draft/Create" fields={["title", "type", "rewardXp", "childAllowed"]} loading={loading === "mission-create"} onSubmit={(fd) => run("mission-create", () => beta1AdminClient.adminCreateMission({ title: String(fd.get("title") || ""), type: String(fd.get("type") || "movement"), rewardXp: Number(fd.get("rewardXp") || 25), childAllowed: fd.get("childAllowed") === "on" }))} />
      <AdminForm title="Mission Publish" fields={["missionId"]} loading={loading === "mission-publish"} onSubmit={(fd) => run("mission-publish", () => beta1AdminClient.adminPublishMission({ missionId: String(fd.get("missionId") || "") }))} />
      <AdminForm title="Checkpoint Create" fields={["title", "regionId", "locationId"]} loading={loading === "checkpoint-create"} onSubmit={(fd) => run("checkpoint-create", () => beta1AdminClient.adminCreateCheckpoint({ title: String(fd.get("title") || ""), regionId: String(fd.get("regionId") || "beta1-at"), locationId: String(fd.get("locationId") || "") || undefined }))} />
      <AdminForm title="Reality Glitch Schedule" fields={["regionId", "locationIds", "windowStart", "windowEnd", "multiplierCap", "maxParticipants", "reason"]} loading={loading === "glitch-schedule"} onSubmit={(fd) => run("glitch-schedule", () => beta1AdminClient.adminScheduleGlitchEvent({ regionId: String(fd.get("regionId") || "vienna"), locationIds: String(fd.get("locationIds") || "").split(",").map((v) => v.trim()).filter(Boolean), windowStart: String(fd.get("windowStart") || ""), windowEnd: String(fd.get("windowEnd") || ""), multiplierCap: Number(fd.get("multiplierCap") || 2), maxParticipants: Number(fd.get("maxParticipants") || 25), reason: String(fd.get("reason") || "") || undefined }))} />
      <AdminForm title="Glitch Cancel" fields={["glitchEventId", "reason"]} loading={loading === "glitch-cancel"} onSubmit={(fd) => run("glitch-cancel", () => beta1AdminClient.cancelGlitchEvent({ glitchEventId: String(fd.get("glitchEventId") || ""), reason: String(fd.get("reason") || "") }))} />
      <AdminForm title="Safety Report Review" fields={["reportId", "decision", "reason"]} loading={loading === "safety-review"} onSubmit={(fd) => run("safety-review", () => beta1AdminClient.adminReviewSafetyReport({ reportId: String(fd.get("reportId") || ""), decision: String(fd.get("decision") || "reviewed"), reason: String(fd.get("reason") || "") }))} />
      <AdminForm title="XP Adjust" fields={["ownerUserId", "delta", "reason", "idempotencyKey"]} loading={loading === "xp-adjust"} onSubmit={(fd) => run("xp-adjust", () => beta1AdminClient.adminAdjustXp({ ownerUserId: String(fd.get("ownerUserId") || ""), delta: Number(fd.get("delta") || 0), reason: String(fd.get("reason") || ""), idempotencyKey: String(fd.get("idempotencyKey") || "") || undefined }))} />
      {result ? <p className="rounded border border-white/15 bg-white/10 p-3">{result}</p> : null}
    </section>
  );
}

function AdminForm({ title, fields, onSubmit, loading }: { title: string; fields: string[]; onSubmit: (fd: FormData) => void; loading: boolean }) {
  return <form className="rounded border border-white/20 bg-slate-900/50 p-3" action={onSubmit}><p className="mb-2 font-semibold">{title}</p><div className="grid gap-2 sm:grid-cols-2">{fields.map((f) => <label key={f} className="flex flex-col gap-1"><span className="text-xs text-white/70">{f}</span>{f === "childAllowed" ? <input type="checkbox" name={f} className="h-4 w-4" /> : <input name={f} className="rounded border border-white/25 bg-slate-950/40 px-2 py-1" />}</label>)}</div><button disabled={loading} className="mt-3 rounded bg-cyan-500 px-3 py-1 text-black disabled:opacity-60">{loading ? "Lädt..." : "Ausführen"}</button></form>;
}
