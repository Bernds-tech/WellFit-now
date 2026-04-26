import type { MotionAnalysisState } from "@/lib/mobileMotion/motionTypes";

type MotionActivityPanelProps = {
  state: MotionAnalysisState;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
};

const activityLabels: Record<MotionAnalysisState["activityType"], string> = {
  unknown: "Unklar",
  still: "Stillstand",
  walking: "Gehen",
  running: "Joggen/Laufen",
  vehicle: "Auto/Fahrzeug möglich",
  motorbike: "Motorrad/Roller möglich",
};

export default function MotionActivityPanel({ state, onStart, onStop, onReset }: MotionActivityPanelProps) {
  return (
    <section className="rounded-[28px] bg-[#053841]/90 p-5 shadow-[0_10px_28px_rgba(0,0,0,0.16)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/55">Handy-Sensoren</p>
          <h1 className="mt-2 text-3xl font-black leading-none text-white">Bewegungstest</h1>
        </div>
        <span className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-[#042f35]">{state.permissionState}</span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-cyan-100/75">
        Dieser Test nutzt Browser-Bewegungssensoren. Er ist gut für erste PWA-Tests, aber echte App-Store-Versionen sollten später native Sensoren wie Core Motion/Activity Recognition verwenden.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-2xl bg-black/18 p-4">
          <p className="text-4xl font-black text-green-300">{state.steps}</p>
          <p className="mt-1 text-xs text-white/55">Schritte</p>
        </div>
        <div className="rounded-2xl bg-black/18 p-4">
          <p className="text-2xl font-black text-cyan-200">{activityLabels[state.activityType]}</p>
          <p className="mt-1 text-xs text-white/55">Aktivität</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-black/18 p-3">
          <p className="text-2xl font-black text-yellow-300">{state.cadence}</p>
          <p className="mt-1 text-xs text-white/55">Schritte/min</p>
        </div>
        <div className="rounded-2xl bg-black/18 p-3">
          <p className="text-2xl font-black text-orange-300">{state.accelerationMagnitude}</p>
          <p className="mt-1 text-xs text-white/55">Beschleunigung</p>
        </div>
        <div className="rounded-2xl bg-black/18 p-3">
          <p className="text-2xl font-black text-cyan-200">{state.confidence}%</p>
          <p className="mt-1 text-xs text-white/55">Sicherheit</p>
        </div>
      </div>

      <p className="mt-4 rounded-2xl bg-black/18 p-3 text-sm font-semibold leading-relaxed text-white/72">{state.feedback}</p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <button type="button" onClick={onStart} className="rounded-2xl bg-orange-400 px-3 py-3 text-sm font-black text-[#042f35]">
          Start
        </button>
        <button type="button" onClick={onStop} className="rounded-2xl bg-white/10 px-3 py-3 text-sm font-black text-white">
          Stop
        </button>
        <button type="button" onClick={onReset} className="rounded-2xl bg-white/10 px-3 py-3 text-sm font-black text-white">
          Reset
        </button>
      </div>
    </section>
  );
}
