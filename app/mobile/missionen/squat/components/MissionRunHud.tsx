import type { ExerciseCounterState } from "@/lib/vision/visionTypes";

type MissionRunHudProps = {
  countdown: number;
  isRunning: boolean;
  isCompleted: boolean;
  counter: ExerciseCounterState;
  targetReps: number;
  onStart: () => void;
  onStop: () => void;
  onComplete: () => void;
};

export default function MissionRunHud({
  countdown,
  isRunning,
  isCompleted,
  counter,
  targetReps,
  onStart,
  onStop,
  onComplete,
}: MissionRunHudProps) {
  const progress = Math.min(100, Math.round((counter.validReps / targetReps) * 100));

  return (
    <div className="absolute inset-x-3 bottom-4 z-20 rounded-[26px] bg-[#042f35]/88 p-4 text-white shadow-[0_16px_38px_rgba(0,0,0,0.32)] backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/55">Mission läuft</p>
          <h1 className="mt-1 text-2xl font-black leading-none">10 saubere Kniebeugen</h1>
        </div>
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-400 text-2xl font-black text-[#042f35]">
          {countdown > 0 ? countdown : counter.validReps}
        </div>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/12">
        <div className="h-full rounded-full bg-orange-400 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-black/20 p-2">
          <p className="text-2xl font-black text-green-300">{counter.validReps}</p>
          <p className="text-[11px] text-white/55">sauber</p>
        </div>
        <div className="rounded-2xl bg-black/20 p-2">
          <p className="text-2xl font-black text-red-300">{counter.invalidReps}</p>
          <p className="text-[11px] text-white/55">unsauber</p>
        </div>
        <div className="rounded-2xl bg-black/20 p-2">
          <p className="text-2xl font-black text-cyan-200">{counter.qualityScore}%</p>
          <p className="text-[11px] text-white/55">Qualität</p>
        </div>
      </div>

      <p className="mt-3 rounded-2xl bg-black/20 p-3 text-xs font-semibold leading-relaxed text-cyan-100/78">
        {isCompleted ? "Mission abgeschlossen. Flammi ist stolz auf dich." : countdown > 0 ? "Stelle dein Handy so auf, dass dein ganzer Körper sichtbar ist." : counter.feedback}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onStart}
          disabled={isRunning || countdown > 0 || isCompleted}
          className="rounded-2xl bg-orange-400 px-3 py-3 text-sm font-black text-[#042f35] disabled:opacity-45"
        >
          Start
        </button>
        <button type="button" onClick={onStop} className="rounded-2xl bg-white/10 px-3 py-3 text-sm font-black text-white">
          Stop
        </button>
        <button
          type="button"
          onClick={onComplete}
          disabled={isCompleted || counter.validReps < targetReps}
          className="rounded-2xl bg-green-300 px-3 py-3 text-sm font-black text-[#042f35] disabled:opacity-45"
        >
          Fertig
        </button>
      </div>
    </div>
  );
}
