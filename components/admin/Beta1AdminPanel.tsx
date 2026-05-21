"use client";

import { useEffect, useState } from "react";
import { beta1AdminClient } from "@/lib/admin/beta1AdminClient";
import { verifyAdminClaim, type AdminGuardState } from "@/lib/admin/beta1AdminGuards";
import { BETA1_SMOKE_CHECKPOINT_TEMPLATE, BETA1_SMOKE_GLITCH_TEMPLATE, BETA1_SMOKE_MISSION_TEMPLATE, BETA1_SMOKE_XP_ADJUST_TEMPLATE } from "@/lib/admin/beta1SmokeTemplates";
import { Beta1SectionCard, Beta1StatusBadge } from "@/components/beta1/Beta1Foundation";
import {
  validateCheckpointCreate,
  validateGlitchCancel,
  validateGlitchSchedule,
  validateMissionCreate,
  validateMissionPublish,
  validateSafetyReview,
  validateXpAdjust,
} from "@/lib/admin/beta1AdminValidation";

const FORM_KEYS = ["mission-create", "mission-publish", "checkpoint-create", "glitch-schedule", "glitch-cancel", "safety-review", "xp-adjust", "agent-handoff", "agent-block", "agent-prompt-generate", "agent-prompt-copied"] as const;
type FormKey = (typeof FORM_KEYS)[number];

type FormFeedback = { error: string; success: string; loading: boolean };

type AdminActionResult = { accepted: boolean; message?: string };

const INITIAL: Record<FormKey, FormFeedback> = Object.fromEntries(FORM_KEYS.map((k) => [k, { error: "", success: "", loading: false }])) as Record<FormKey, FormFeedback>;

const normalize = (value: FormDataEntryValue | null) => String(value ?? "").trim();
const normalizeOptional = (value: FormDataEntryValue | null) => {
  const trimmed = normalize(value);
  return trimmed.length ? trimmed : undefined;
};

export default function Beta1AdminPanel() {
  const [guardState, setGuardState] = useState<AdminGuardState>("loading");
  const [guardMessage, setGuardMessage] = useState("Admin-Zugriff wird geprüft ...");
  const [feedback, setFeedback] = useState<Record<FormKey, FormFeedback>>(INITIAL);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [generatedPromptId, setGeneratedPromptId] = useState("");

  useEffect(() => {
    verifyAdminClaim().then((guard) => {
      setGuardState(guard.state);
      setGuardMessage(guard.message);
    });
  }, []);

  const run = async (key: FormKey, action: () => Promise<AdminActionResult>) => {
    setFeedback((prev) => ({ ...prev, [key]: { error: "", success: "", loading: true } }));
    const res = await action();
    setFeedback((prev) => ({
      ...prev,
      [key]: {
        loading: false,
        error: res.accepted ? "" : res.message ?? "Aktion fehlgeschlagen. Bitte Eingaben prüfen oder erneut versuchen.",
        success: res.accepted ? "Aktion erfolgreich ausgeführt." : "",
      },
    }));
  };

  if (guardState !== "allowed") {
    const style = guardState === "loading" ? "border-cyan-400/40 bg-cyan-300/10 text-cyan-50" : "border-amber-400/40 bg-amber-300/10 text-amber-50";
    return <section className={`rounded-lg border p-4 text-sm ${style}`}>{guardMessage}</section>;
  }

  return (
    <section className="space-y-4 text-sm text-slate-100">
      <Beta1SectionCard title="Admin-Panel (Beta-1)" description="Nutzt nur bestehende serverseitige Callables. Clientseitige Validierung ergänzt die Eingabeprüfung, ersetzt aber keine Server-Authority.">
        <div className="flex flex-wrap gap-2">
          <Beta1StatusBadge tone="info">Callable-basierte Bedienoberfläche</Beta1StatusBadge>
          <Beta1StatusBadge tone="neutral">Keine neue Client-Authority</Beta1StatusBadge>
        </div>
      </Beta1SectionCard>
      <section className="rounded border border-white/20 bg-slate-900/40 p-3 text-xs text-white/80">
        <p className="font-semibold text-white">Empfohlener Smoke-Test Ablauf</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4">
          <li>Mission erstellen (Draft/Create) mit den statischen Smoke-Beispielwerten.</li>
          <li>Mission veroeffentlichen (Mission Publish) ueber bestehendes Callable.</li>
          <li>Dashboard pruefen: Published Missions, Checkpoint-/Glitch-Counts sowie Wallet/Ledger Read-Projections.</li>
        </ol>
        <p className="mt-2">Keine sensiblen IDs, Secrets oder produktiven Projektkennungen im UI anzeigen/eintragen.</p>
        <p className="mt-1">Hinweis: Server-Callables bleiben finale Authority; der Client ist nur Bedienoberflaeche und Read-Projections bleiben read-only.</p>
      </section>
      <details className="rounded border border-white/20 bg-black/20 p-3 text-xs text-white/75">
        <summary className="cursor-pointer font-semibold text-white">Smoke-Test Beispielwerte (statisch, nicht-autonom)</summary>
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">{JSON.stringify({ mission: BETA1_SMOKE_MISSION_TEMPLATE, checkpoint: BETA1_SMOKE_CHECKPOINT_TEMPLATE, glitch: BETA1_SMOKE_GLITCH_TEMPLATE, xpAdjust: BETA1_SMOKE_XP_ADJUST_TEMPLATE }, null, 2)}</pre>
      </details>
      <AdminForm title="Mission Draft/Create" fields={["title", "type", "rewardXp", "childAllowed"]} feedback={feedback["mission-create"]} onSubmit={async (fd) => {
        const payload = { title: normalize(fd.get("title")), type: normalize(fd.get("type")), rewardXp: Number(fd.get("rewardXp") || 0), childAllowed: fd.get("childAllowed") === "on" };
        const validationError = validateMissionCreate(payload);
        if (validationError) return setFeedback((prev) => ({ ...prev, ["mission-create"]: { ...prev["mission-create"], error: validationError, success: "" } }));
        await run("mission-create", () => beta1AdminClient.adminCreateMission(payload));
      }} />
      <AdminForm title="Mission Publish" fields={["missionId"]} feedback={feedback["mission-publish"]} onSubmit={async (fd) => {
        const payload = { missionId: normalize(fd.get("missionId")) };
        const validationError = validateMissionPublish(payload);
        if (validationError) return setFeedback((prev) => ({ ...prev, ["mission-publish"]: { ...prev["mission-publish"], error: validationError, success: "" } }));
        await run("mission-publish", () => beta1AdminClient.adminPublishMission(payload));
      }} />
      <AdminForm title="Checkpoint Create" fields={["title", "regionId", "locationId"]} feedback={feedback["checkpoint-create"]} onSubmit={async (fd) => {
        const payload = { title: normalize(fd.get("title")), regionId: normalize(fd.get("regionId")), locationId: normalizeOptional(fd.get("locationId")) };
        const validationError = validateCheckpointCreate(payload);
        if (validationError) return setFeedback((prev) => ({ ...prev, ["checkpoint-create"]: { ...prev["checkpoint-create"], error: validationError, success: "" } }));
        await run("checkpoint-create", () => beta1AdminClient.adminCreateCheckpoint(payload));
      }} />
      <AdminForm title="Reality Glitch Schedule" fields={["regionId", "locationIds", "windowStart", "windowEnd", "multiplierCap", "maxParticipants", "reason"]} feedback={feedback["glitch-schedule"]} onSubmit={async (fd) => {
        const payload = { regionId: normalize(fd.get("regionId")), locationIds: normalize(fd.get("locationIds")).split(",").map((v) => v.trim()).filter(Boolean), windowStart: normalize(fd.get("windowStart")), windowEnd: normalize(fd.get("windowEnd")), multiplierCap: Number(fd.get("multiplierCap") || 0), maxParticipants: Number(fd.get("maxParticipants") || 0), reason: normalize(fd.get("reason")) };
        const validationError = validateGlitchSchedule(payload);
        if (validationError) return setFeedback((prev) => ({ ...prev, ["glitch-schedule"]: { ...prev["glitch-schedule"], error: validationError, success: "" } }));
        await run("glitch-schedule", () => beta1AdminClient.adminScheduleGlitchEvent(payload));
      }} />
      <AdminForm title="Glitch Cancel" fields={["glitchEventId", "reason"]} feedback={feedback["glitch-cancel"]} onSubmit={async (fd) => {
        const payload = { glitchEventId: normalize(fd.get("glitchEventId")), reason: normalize(fd.get("reason")) };
        const validationError = validateGlitchCancel(payload);
        if (validationError) return setFeedback((prev) => ({ ...prev, ["glitch-cancel"]: { ...prev["glitch-cancel"], error: validationError, success: "" } }));
        await run("glitch-cancel", () => beta1AdminClient.cancelGlitchEvent(payload));
      }} />
      <AdminForm title="Safety Report Review" fields={["reportId", "decision", "reason"]} feedback={feedback["safety-review"]} onSubmit={async (fd) => {
        const payload = { reportId: normalize(fd.get("reportId")), decision: normalize(fd.get("decision")), reason: normalize(fd.get("reason")) };
        const validationError = validateSafetyReview(payload);
        if (validationError) return setFeedback((prev) => ({ ...prev, ["safety-review"]: { ...prev["safety-review"], error: validationError, success: "" } }));
        await run("safety-review", () => beta1AdminClient.adminReviewSafetyReport(payload));
      }} />
      <AdminForm title="XP Adjust" fields={["ownerUserId", "delta", "reason", "idempotencyKey"]} feedback={feedback["xp-adjust"]} onSubmit={async (fd) => {
        const payload = { ownerUserId: normalize(fd.get("ownerUserId")), delta: Number(fd.get("delta") || 0), reason: normalize(fd.get("reason")), idempotencyKey: normalizeOptional(fd.get("idempotencyKey")) };
        const validationError = validateXpAdjust(payload);
        if (validationError) return setFeedback((prev) => ({ ...prev, ["xp-adjust"]: { ...prev["xp-adjust"], error: validationError, success: "" } }));
        await run("xp-adjust", () => beta1AdminClient.adminAdjustXp(payload));
      }} />

      <section className="rounded border border-white/20 bg-slate-900/50 p-3 text-xs text-white/85">
        <p className="mb-2 font-semibold text-white">Agent Task PR-Handoff</p>
        <p className="mb-3 rounded border border-cyan-400/30 bg-cyan-300/10 p-2">Erzeugt nur Handoff-Metadaten. Kein Auto-Merge, kein Deploy, keine automatische Codeausfuehrung.</p>
        <AdminForm title="Prepare PR-Handoff" fields={["executionId", "branchName", "title", "summary"]} feedback={feedback["agent-handoff"]} onSubmit={async (fd) => {
          const payload = { executionId: normalize(fd.get("executionId")), branchName: normalize(fd.get("branchName")), title: normalize(fd.get("title")), summary: normalize(fd.get("summary")) };
          if (!payload.executionId || !payload.branchName || !payload.title || !payload.summary) return setFeedback((prev) => ({ ...prev, ["agent-handoff"]: { ...prev["agent-handoff"], error: "Alle Felder sind erforderlich.", success: "" } }));
          await run("agent-handoff", () => beta1AdminClient.prepareAgentTaskPrHandoff(payload));
        }} />
        <div className="mt-3">
          <AdminForm title="Generate Codex Prompt" fields={["executionId", "commitMessage", "prTitle"]} feedback={feedback["agent-prompt-generate"]} onSubmit={async (fd) => {
            const payload = { executionId: normalize(fd.get("executionId")), commitMessage: normalizeOptional(fd.get("commitMessage")), prTitle: normalizeOptional(fd.get("prTitle")) };
            if (!payload.executionId) return setFeedback((prev) => ({ ...prev, ["agent-prompt-generate"]: { ...prev["agent-prompt-generate"], error: "executionId fehlt.", success: "" } }));
            await run("agent-prompt-generate", async () => {
              const result = await beta1AdminClient.generateAgentTaskCodexPrompt(payload);
              if (result.accepted) {
                const data = result as AdminActionResult & { promptText?: string; handoffPromptId?: string };
                setGeneratedPrompt(data.promptText || "");
                setGeneratedPromptId(data.handoffPromptId || "");
              }
              return result;
            });
          }} />
          {generatedPrompt ? <div className="mt-3 rounded border border-white/20 bg-black/30 p-2"><p className="mb-2 font-semibold text-white">Generierter Codex Prompt (read-only)</p><pre className="max-h-64 overflow-auto whitespace-pre-wrap text-[11px] text-white/85">{generatedPrompt}</pre></div> : null}
          <AdminForm title="Mark Prompt Copied" fields={["handoffPromptId"]} feedback={feedback["agent-prompt-copied"]} onSubmit={async (fd) => {
            const handoffPromptId = normalize(fd.get("handoffPromptId")) || generatedPromptId;
            if (!handoffPromptId) return setFeedback((prev) => ({ ...prev, ["agent-prompt-copied"]: { ...prev["agent-prompt-copied"], error: "handoffPromptId fehlt.", success: "" } }));
            await run("agent-prompt-copied", () => beta1AdminClient.markAgentTaskCodexPromptCopied({ handoffPromptId }));
          }} />
          <AdminForm title="Block Execution" fields={["executionId", "reason"]} feedback={feedback["agent-block"]} onSubmit={async (fd) => {
            const payload = { executionId: normalize(fd.get("executionId")), reason: normalizeOptional(fd.get("reason")) };
            if (!payload.executionId) return setFeedback((prev) => ({ ...prev, ["agent-block"]: { ...prev["agent-block"], error: "executionId fehlt.", success: "" } }));
            await run("agent-block", () => beta1AdminClient.blockAgentTaskExecution(payload));
          }} />
        </div>
        <p className="mt-3 rounded border border-amber-400/40 bg-amber-300/10 p-2">Dieser Prompt startet nichts automatisch. Er wird manuell in Codex verwendet. Kein Auto-Merge, kein Deploy.</p>
      </section>
    </section>
  );
}

function AdminForm({ title, fields, onSubmit, feedback }: { title: string; fields: string[]; onSubmit: (fd: FormData) => Promise<void>; feedback: FormFeedback }) {
  return <form className="rounded border border-white/20 bg-slate-900/50 p-3" action={onSubmit}><p className="mb-2 font-semibold">{title}</p><div className="grid gap-2 sm:grid-cols-2">{fields.map((f) => <label key={f} className="flex flex-col gap-1"><span className="text-xs text-white/70">{f}</span>{f === "childAllowed" ? <input type="checkbox" name={f} className="h-4 w-4" /> : <input name={f} className="rounded border border-white/25 bg-slate-950/40 px-2 py-1" />}</label>)}</div>{feedback.error ? <p className="mt-2 rounded border border-amber-400/40 bg-amber-300/10 p-2 text-amber-100">{feedback.error}</p> : null}{feedback.success ? <p className="mt-2 rounded border border-emerald-400/40 bg-emerald-300/10 p-2 text-emerald-100">{feedback.success}</p> : null}<button disabled={feedback.loading} className="mt-3 rounded bg-cyan-500 px-3 py-1 text-black disabled:opacity-60">{feedback.loading ? "Lädt..." : "Ausführen"}</button></form>;
}
