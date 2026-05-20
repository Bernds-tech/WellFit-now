"use client";

import { useEffect, useState } from "react";
import { beta1AdminClient } from "@/lib/admin/beta1AdminClient";
import { verifyAdminClaim, type AdminGuardState } from "@/lib/admin/beta1AdminGuards";
import {
  validateCheckpointCreate,
  validateGlitchCancel,
  validateGlitchSchedule,
  validateMissionCreate,
  validateMissionPublish,
  validateSafetyReview,
  validateXpAdjust,
} from "@/lib/admin/beta1AdminValidation";

const FORM_KEYS = ["mission-create", "mission-publish", "checkpoint-create", "glitch-schedule", "glitch-cancel", "safety-review", "xp-adjust"] as const;
type FormKey = (typeof FORM_KEYS)[number];

type FormFeedback = { error: string; success: string; loading: boolean };

const INITIAL: Record<FormKey, FormFeedback> = Object.fromEntries(FORM_KEYS.map((k) => [k, { error: "", success: "", loading: false }])) as Record<FormKey, FormFeedback>;

export default function Beta1AdminPanel() {
  const [guardState, setGuardState] = useState<AdminGuardState>("loading");
  const [guardMessage, setGuardMessage] = useState("Admin-Zugriff wird geprüft ...");
  const [feedback, setFeedback] = useState<Record<FormKey, FormFeedback>>(INITIAL);

  useEffect(() => {
    verifyAdminClaim().then((guard) => {
      setGuardState(guard.state);
      setGuardMessage(guard.message);
    });
  }, []);

  const run = async (key: FormKey, action: () => Promise<{ accepted: boolean; message?: string }>) => {
    setFeedback((prev) => ({ ...prev, [key]: { error: "", success: "", loading: true } }));
    const res = await action();
    setFeedback((prev) => ({
      ...prev,
      [key]: {
        loading: false,
        error: res.accepted ? "" : res.message ?? "Aktion fehlgeschlagen.",
        success: res.accepted ? "Aktion erfolgreich ausgeführt." : "",
      },
    }));
  };

  if (guardState !== "allowed") {
    const style = guardState === "loading" ? "border-cyan-400/40 bg-cyan-300/10 text-cyan-50" : "border-amber-400/40 bg-amber-300/10 text-amber-50";
    return <section className={`rounded-lg border p-4 text-sm ${style}`}>{guardMessage}</section>;
  }

  return (
    <section className="space-y-4 text-sm text-white">
      <p className="rounded border border-cyan-400/30 bg-cyan-300/10 p-3">Admin-Panel (Beta-1): Nur bestehende serverseitige Callables; Client validiert Payloads vor, ersetzt aber keine Server-Authority.</p>
      <AdminForm title="Mission Draft/Create" fields={["title", "type", "rewardXp", "childAllowed"]} feedback={feedback["mission-create"]} onSubmit={(fd) => {
        const payload = { title: String(fd.get("title") || ""), type: String(fd.get("type") || ""), rewardXp: Number(fd.get("rewardXp") || 0), childAllowed: fd.get("childAllowed") === "on" };
        const validationError = validateMissionCreate(payload);
        if (validationError) return setFeedback((prev) => ({ ...prev, ["mission-create"]: { ...prev["mission-create"], error: validationError, success: "" } }));
        run("mission-create", () => beta1AdminClient.adminCreateMission(payload));
      }} />
      <AdminForm title="Mission Publish" fields={["missionId"]} feedback={feedback["mission-publish"]} onSubmit={(fd) => {
        const payload = { missionId: String(fd.get("missionId") || "") };
        const validationError = validateMissionPublish(payload);
        if (validationError) return setFeedback((prev) => ({ ...prev, ["mission-publish"]: { ...prev["mission-publish"], error: validationError, success: "" } }));
        run("mission-publish", () => beta1AdminClient.adminPublishMission(payload));
      }} />
      <AdminForm title="Checkpoint Create" fields={["title", "regionId", "locationId"]} feedback={feedback["checkpoint-create"]} onSubmit={(fd) => {
        const payload = { title: String(fd.get("title") || ""), regionId: String(fd.get("regionId") || ""), locationId: String(fd.get("locationId") || "") || undefined };
        const validationError = validateCheckpointCreate(payload);
        if (validationError) return setFeedback((prev) => ({ ...prev, ["checkpoint-create"]: { ...prev["checkpoint-create"], error: validationError, success: "" } }));
        run("checkpoint-create", () => beta1AdminClient.adminCreateCheckpoint(payload));
      }} />
      <AdminForm title="Reality Glitch Schedule" fields={["regionId", "locationIds", "windowStart", "windowEnd", "multiplierCap", "maxParticipants", "reason"]} feedback={feedback["glitch-schedule"]} onSubmit={(fd) => {
        const payload = { regionId: String(fd.get("regionId") || ""), locationIds: String(fd.get("locationIds") || "").split(",").map((v) => v.trim()).filter(Boolean), windowStart: String(fd.get("windowStart") || ""), windowEnd: String(fd.get("windowEnd") || ""), multiplierCap: Number(fd.get("multiplierCap") || 0), maxParticipants: Number(fd.get("maxParticipants") || 0), reason: String(fd.get("reason") || "") };
        const validationError = validateGlitchSchedule(payload);
        if (validationError) return setFeedback((prev) => ({ ...prev, ["glitch-schedule"]: { ...prev["glitch-schedule"], error: validationError, success: "" } }));
        run("glitch-schedule", () => beta1AdminClient.adminScheduleGlitchEvent(payload));
      }} />
      <AdminForm title="Glitch Cancel" fields={["glitchEventId", "reason"]} feedback={feedback["glitch-cancel"]} onSubmit={(fd) => {
        const payload = { glitchEventId: String(fd.get("glitchEventId") || ""), reason: String(fd.get("reason") || "") };
        const validationError = validateGlitchCancel(payload);
        if (validationError) return setFeedback((prev) => ({ ...prev, ["glitch-cancel"]: { ...prev["glitch-cancel"], error: validationError, success: "" } }));
        run("glitch-cancel", () => beta1AdminClient.cancelGlitchEvent(payload));
      }} />
      <AdminForm title="Safety Report Review" fields={["reportId", "decision", "reason"]} feedback={feedback["safety-review"]} onSubmit={(fd) => {
        const payload = { reportId: String(fd.get("reportId") || ""), decision: String(fd.get("decision") || ""), reason: String(fd.get("reason") || "") };
        const validationError = validateSafetyReview(payload);
        if (validationError) return setFeedback((prev) => ({ ...prev, ["safety-review"]: { ...prev["safety-review"], error: validationError, success: "" } }));
        run("safety-review", () => beta1AdminClient.adminReviewSafetyReport(payload));
      }} />
      <AdminForm title="XP Adjust" fields={["ownerUserId", "delta", "reason", "idempotencyKey"]} feedback={feedback["xp-adjust"]} onSubmit={(fd) => {
        const payload = { ownerUserId: String(fd.get("ownerUserId") || ""), delta: Number(fd.get("delta") || 0), reason: String(fd.get("reason") || ""), idempotencyKey: String(fd.get("idempotencyKey") || "") || undefined };
        const validationError = validateXpAdjust(payload);
        if (validationError) return setFeedback((prev) => ({ ...prev, ["xp-adjust"]: { ...prev["xp-adjust"], error: validationError, success: "" } }));
        run("xp-adjust", () => beta1AdminClient.adminAdjustXp(payload));
      }} />
    </section>
  );
}

function AdminForm({ title, fields, onSubmit, feedback }: { title: string; fields: string[]; onSubmit: (fd: FormData) => void; feedback: FormFeedback }) {
  return <form className="rounded border border-white/20 bg-slate-900/50 p-3" action={onSubmit}><p className="mb-2 font-semibold">{title}</p><div className="grid gap-2 sm:grid-cols-2">{fields.map((f) => <label key={f} className="flex flex-col gap-1"><span className="text-xs text-white/70">{f}</span>{f === "childAllowed" ? <input type="checkbox" name={f} className="h-4 w-4" /> : <input name={f} className="rounded border border-white/25 bg-slate-950/40 px-2 py-1" />}</label>)}</div>{feedback.error ? <p className="mt-2 rounded border border-amber-400/40 bg-amber-300/10 p-2 text-amber-100">{feedback.error}</p> : null}{feedback.success ? <p className="mt-2 rounded border border-emerald-400/40 bg-emerald-300/10 p-2 text-emerald-100">{feedback.success}</p> : null}<button disabled={feedback.loading} className="mt-3 rounded bg-cyan-500 px-3 py-1 text-black disabled:opacity-60">{feedback.loading ? "Lädt..." : "Ausführen"}</button></form>;
}
