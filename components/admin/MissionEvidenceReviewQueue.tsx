"use client";

import { useCallback, useEffect, useState } from "react";
import { Beta1SectionCard, Beta1StatusBadge } from "@/components/beta1/Beta1Foundation";
import {
  missionEvidenceAdminClient,
  type MissionEvidenceQueueItem,
  type MissionEvidenceReviewDecision,
} from "@/lib/admin/missionEvidenceAdminClient";

type VerificationMethod =
  | "external-manual-observation"
  | "stored-artifact-reviewed"
  | "emulator-qa"
  | "metadata-review";

const verificationLabels: Record<VerificationMethod, string> = {
  "external-manual-observation": "Extern manuell beobachtet",
  "stored-artifact-reviewed": "Gespeichertes Evidence-Artefakt geprüft",
  "emulator-qa": "Emulator-/QA-Nachweis",
  "metadata-review": "Nur Metadaten geprüft",
};

const shortId = (value?: string | null) => {
  if (!value) return "–";
  return value.length <= 18 ? value : `${value.slice(0, 8)}…${value.slice(-6)}`;
};

export default function MissionEvidenceReviewQueue() {
  const [items, setItems] = useState<MissionEvidenceQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEvidenceId, setActiveEvidenceId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [methods, setMethods] = useState<Record<string, VerificationMethod>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await missionEvidenceAdminClient.list("pending-server-review");
    setItems(result.evidence);
    setError(result.accepted ? "" : result.message || "Evidence Queue konnte nicht geladen werden.");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (item: MissionEvidenceQueueItem, decision: MissionEvidenceReviewDecision) => {
    const note = (notes[item.evidenceId] || "").trim();
    const method = methods[item.evidenceId] || "metadata-review";
    if (!note) {
      setError("Eine nachvollziehbare Review-Begründung ist erforderlich.");
      setSuccess("");
      return;
    }
    if (decision === "approved" && method === "metadata-review") {
      setError("Freigabe ist nach reiner Metadatenprüfung nicht erlaubt. Bitte externen, gespeicherten oder QA-Nachweis wählen.");
      setSuccess("");
      return;
    }

    setActiveEvidenceId(item.evidenceId);
    setError("");
    setSuccess("");
    const result = await missionEvidenceAdminClient.review({
      evidenceId: item.evidenceId,
      decision,
      reviewNote: `[${method}] ${note}`,
    });
    setActiveEvidenceId(null);
    if (!result.accepted) {
      setError(result.message || "Evidence Review fehlgeschlagen.");
      return;
    }
    setSuccess(`Evidence ${shortId(item.evidenceId)} wurde als „${decision}“ gespeichert.`);
    setNotes((prev) => ({ ...prev, [item.evidenceId]: "" }));
    await load();
  };

  return (
    <Beta1SectionCard
      title="Mission Evidence Review Queue"
      description="Admin-only Warteschlange für serverseitige Evidence-Entscheidungen. Die Queue zeigt absichtlich keine Rohbilder, Videos oder freien Metadateninhalte."
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Beta1StatusBadge tone="info">Server-Authority</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Keine XP beim Evidence-Upload</Beta1StatusBadge>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="ml-auto rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-50 disabled:opacity-50"
        >
          {loading ? "Lädt..." : "Queue aktualisieren"}
        </button>
      </div>

      <div className="mb-4 rounded-lg border border-amber-300/25 bg-amber-300/10 p-3 text-xs leading-relaxed text-amber-50">
        <strong>Freigabe-Regel:</strong> „Approved“ ist nach reiner Metadatenprüfung gesperrt. Für eine Freigabe muss der Admin einen extern beobachteten, gespeicherten oder Emulator-/QA-Nachweis auswählen und begründen. Das Callable protokolliert die Begründung im Audit.
      </div>

      {error && <p className="mb-3 rounded-lg border border-rose-300/30 bg-rose-400/10 p-3 text-xs text-rose-100">{error}</p>}
      {success && <p className="mb-3 rounded-lg border border-emerald-300/30 bg-emerald-400/10 p-3 text-xs text-emerald-100">{success}</p>}
      {loading && <p className="text-sm text-slate-200/75">Pending Evidence wird geladen ...</p>}
      {!loading && items.length === 0 && (
        <p className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-slate-200/75">Keine Evidence wartet derzeit auf Review.</p>
      )}

      <div className="space-y-3">
        {items.map((item) => {
          const active = activeEvidenceId === item.evidenceId;
          const method = methods[item.evidenceId] || "metadata-review";
          return (
            <article key={item.evidenceId} className="rounded-xl border border-white/15 bg-slate-950/45 p-4">
              <div className="grid gap-2 text-xs text-slate-200/80 md:grid-cols-2 xl:grid-cols-3">
                <p><span className="font-semibold text-white">Evidence:</span> {shortId(item.evidenceId)}</p>
                <p><span className="font-semibold text-white">Mission:</span> {shortId(item.missionId)}</p>
                <p><span className="font-semibold text-white">Attempt:</span> {shortId(item.attemptId)}</p>
                <p><span className="font-semibold text-white">Nutzer:</span> {shortId(item.ownerUserId)}</p>
                <p><span className="font-semibold text-white">Typ:</span> {item.evidenceType}</p>
                <p><span className="font-semibold text-white">Status:</span> {item.reviewStatus}</p>
              </div>
              <p className="mt-2 text-[11px] text-slate-300/65">
                Storage-Referenz: {item.storageRefPresent ? "vorhanden" : "keine"} · Metadatenfelder: {item.metadataKeys.length ? item.metadataKeys.join(", ") : "keine"}
              </p>

              <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,230px)_1fr]">
                <select
                  value={method}
                  onChange={(event) => setMethods((prev) => ({ ...prev, [item.evidenceId]: event.target.value as VerificationMethod }))}
                  className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-xs text-white"
                >
                  {Object.entries(verificationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <input
                  value={notes[item.evidenceId] || ""}
                  onChange={(event) => setNotes((prev) => ({ ...prev, [item.evidenceId]: event.target.value }))}
                  placeholder="Review-Begründung / beobachteter Nachweis"
                  maxLength={420}
                  className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-xs text-white placeholder:text-white/35"
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={active || method === "metadata-review"}
                  onClick={() => review(item, "approved")}
                  className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Approved
                </button>
                <button
                  type="button"
                  disabled={active}
                  onClick={() => review(item, "needs-more-evidence")}
                  className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950 disabled:opacity-40"
                >
                  Mehr Evidence
                </button>
                <button
                  type="button"
                  disabled={active}
                  onClick={() => review(item, "rejected")}
                  className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
                >
                  Reject
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </Beta1SectionCard>
  );
}
