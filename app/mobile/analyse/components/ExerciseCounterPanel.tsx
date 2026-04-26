import type { ExerciseCounterState } from "@/lib/vision/visionTypes";
import { getMoodSignalLabel } from "@/lib/vision/moodSignalEngine";

type ExerciseCounterPanelProps = {
  counter: ExerciseCounterState;
  trackerStatus?: string;
  trackerError?: string | null;
  isSavingSession?: boolean;
  sessionMessage?: string | null;
  onSaveSession?: () => void;
};

export default function ExerciseCounterPanel({
  counter,
  trackerStatus,
  trackerError,
  isSavingSession = false,
  sessionMessage,
  onSaveSession,
}: ExerciseCounterPanelProps) {
  const canSave = counter.validReps > 0 || counter.invalidReps > 0;

  return (
    <section className="rounded-[24px] bg-[#053841]/90 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.14)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/55">Übungszählung</p>
          <h2 className="mt-1 text-2xl font-black text-cyan-200">Kniebeugen-Test</h2>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-cyan-100">
          {counter.isTracking ? "aktiv" : "vorbereitet"}
        </span>
      </div>

      {trackerStatus && <p className="mt-3 text-xs font-semibold text-cyan-100/70">Status: {trackerStatus}</p>}
      {trackerError && <p className="mt-3 rounded-2xl bg-red-400/15 p-3 text-sm font-semibold text-red-100">{trackerError}</p>}

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-black/18 p-3">
          <p className="text-3xl font-black text-green-300">{counter.validReps}</p>
          <p className="mt-1 text-xs text-white/55">sauber</p>
        </div>
        <div className="rounded-2xl bg-black/18 p-3">
          <p className="text-3xl font-black text-red-300">{counter.invalidReps}</p>
          <p className="mt-1 text-xs text-white/55">unsauber</p>
        </div>
        <div className="rounded-2xl bg-black/18 p-3">
          <p className="text-3xl font-black text-yellow-300">{counter.confidence}%</p>
          <p className="mt-1 text-xs text-white/55">Sicherheit</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-black/18 p-3">
          <p className="text-2xl font-black text-cyan-200">{counter.qualityScore}%</p>
          <p className="mt-1 text-xs text-white/55">Qualität</p>
        </div>
        <div className="rounded-2xl bg-black/18 p-3">
          <p className="text-sm font-black text-cyan-100">{counter.phase}</p>
          <p className="mt-1 text-xs text-white/55">Phase</p>
        </div>
        <div className="rounded-2xl bg-black/18 p-3">
          <p className="text-sm font-black text-cyan-100">{getMoodSignalLabel(counter.moodSignal)}</p>
          <p className="mt-1 text-xs text-white/55">Signal</p>
        </div>
      </div>

      <p className="mt-4 rounded-2xl bg-black/18 p-3 text-sm font-semibold leading-relaxed text-white/70">
        {counter.feedback}
      </p>

      <button
        type="button"
        onClick={onSaveSession}
        disabled={!canSave || isSavingSession || !onSaveSession}
        className="mt-4 w-full rounded-2xl bg-orange-400 px-4 py-3 text-sm font-black text-[#042f35] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isSavingSession ? "Speichert Training..." : "Training speichern"}
      </button>

      {sessionMessage && <p className="mt-3 rounded-2xl bg-black/18 p-3 text-xs font-semibold text-cyan-100/70">{sessionMessage}</p>}
    </section>
  );
}
