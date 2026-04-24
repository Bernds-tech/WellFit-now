"use client";

import RegisterPanel from "./RegisterPanel";
import PrimaryButton from "@/app/components/PrimaryButton";
import { Language } from "../registerTypes";
import { getRegisterContent } from "../registerContent";

type Props = {
  language: Language;
  psychography: any;
  setPsychography: (value: any) => void;
  onNext: () => void;
};

const selectClass = "h-12 w-full rounded-xl border border-white/10 bg-white/10 px-3 text-white outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/20";

export default function Step3Psychography({ language, psychography, setPsychography, onNext }: Props) {
  const t = getRegisterContent(language);
  const goals = psychography.goals ?? [];
  const activityLevel = psychography.activityLevel ?? "low";
  const communityMode = psychography.communityMode ?? "private";
  const trainingTime = psychography.trainingTime ?? "morning";
  const activityType = psychography.activityType ?? "walking";

  const toggleGoal = (goal: string) => {
    const nextGoals = goals.includes(goal) ? goals.filter((item: string) => item !== goal) : [...goals, goal];
    setPsychography({ ...psychography, goals: nextGoals });
  };

  const activityScore = { low: 20, sometimes: 45, regular: 70, very: 95 }[activityLevel as "low" | "sometimes" | "regular" | "very"] ?? 20;
  const socialScore = communityMode === "public" ? 95 : communityMode === "private" ? 65 : 25;
  const missionScore = Math.min(100, 30 + goals.length * 18 + (activityType !== "walking" ? 10 : 0));
  const aiProfile = goals.includes("adventure") ? "Explorer" : goals.includes("fitness") ? "Athlet" : goals.includes("health") ? "Balance-Coach" : goals.includes("loseWeight") ? "Transformation" : "Starter";
  const communityLabel = communityMode === "public" ? t.publicBoard : communityMode === "solo" ? t.soloMode : t.privateSquads;
  const timeLabel = trainingTime === "evening" ? t.evening : trainingTime === "noon" ? t.noon : t.morning;

  const activityCards = [
    ["low", t.almostInactive, "🌱"],
    ["sometimes", t.sometimes, "🚶"],
    ["regular", t.regular, "🏃"],
    ["very", t.veryActive, "⚡"],
  ];
  const goalCards = [
    ["loseWeight", t.loseWeight, "🔥"],
    ["fitness", t.improveFitness, "💪"],
    ["health", t.stayHealthy, "💚"],
    ["adventure", t.adventure, "🗺️"],
  ];

  return (
    <section className="absolute inset-x-8 top-24 bottom-8 overflow-hidden">
      <div className="mb-4 text-center">
        <div className="text-xs font-bold tracking-[0.22em] text-cyan-100/55">Phase 03</div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white">Mind & Mission System</h1>
      </div>

      <div className="grid h-[calc(100%-78px)] grid-cols-[1.05fr_0.95fr] gap-6">
        <div className="min-h-0 overflow-y-auto pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="grid gap-3">
            <RegisterPanel title={t.activeNow}>
              <div className="grid grid-cols-4 gap-2">
                {activityCards.map(([value, label, icon]) => (
                  <button key={value} type="button" onClick={() => setPsychography({ ...psychography, activityLevel: value })} className={`rounded-2xl border px-3 py-3 text-center text-sm font-semibold transition ${activityLevel === value ? "border-cyan-200 bg-cyan-300 text-[#053841] shadow-[0_0_18px_rgba(103,232,249,0.35)]" : "border-white/10 bg-white/10 text-white hover:bg-white/15"}`}>
                    <div className="text-2xl">{icon}</div>
                    <div className="mt-1 leading-tight">{label}</div>
                  </button>
                ))}
              </div>
            </RegisterPanel>

            <RegisterPanel title={t.goals}>
              <div className="grid grid-cols-4 gap-2">
                {goalCards.map(([value, label, icon]) => (
                  <button key={value} type="button" onClick={() => toggleGoal(value)} className={`rounded-2xl border px-3 py-3 text-center text-sm font-semibold transition ${goals.includes(value) ? "border-emerald-200 bg-green-300 text-[#053841] shadow-[0_0_18px_rgba(134,239,172,0.35)]" : "border-white/10 bg-white/10 text-white hover:bg-white/15"}`}>
                    <div className="text-2xl">{icon}</div>
                    <div className="mt-1 leading-tight">{label}</div>
                  </button>
                ))}
              </div>
            </RegisterPanel>

            <div className="grid grid-cols-2 gap-3">
              <RegisterPanel title={t.communityMode}>
                <div className="grid gap-2">
                  {[["public", t.publicBoard, "🌍"], ["private", t.privateSquads, "🛡️"], ["solo", t.soloMode, "🧘"]].map(([value, label, icon]) => (
                    <button key={value} type="button" onClick={() => setPsychography({ ...psychography, communityMode: value })} className={`flex items-center gap-3 rounded-2xl border px-3 py-2 text-left text-sm font-semibold transition ${communityMode === value ? "border-cyan-200 bg-cyan-300 text-[#053841]" : "border-white/10 bg-white/10 text-white hover:bg-white/15"}`}>
                      <span className="text-xl">{icon}</span><span>{label}</span>
                    </button>
                  ))}
                </div>
              </RegisterPanel>

              <RegisterPanel title={t.trainingTime}>
                <select value={trainingTime} onChange={(e) => setPsychography({ ...psychography, trainingTime: e.target.value })} className={selectClass}>
                  <option value="morning">{t.morning}</option>
                  <option value="noon">{t.noon}</option>
                  <option value="evening">{t.evening}</option>
                </select>
                <div className="mt-3 rounded-2xl bg-black/20 px-3 py-3 text-sm text-white/80">⏱️ {timeLabel}</div>
              </RegisterPanel>
            </div>

            <RegisterPanel title={t.activities}>
              <select value={activityType} onChange={(e) => setPsychography({ ...psychography, activityType: e.target.value })} className={selectClass}>
                <option value="walking">{t.walking}</option>
                <option value="running">{t.running}</option>
                <option value="cycling">{t.cycling}</option>
                <option value="dancing">{t.dancing}</option>
                <option value="workout">{t.workout}</option>
                <option value="relax">{t.relax}</option>
              </select>
            </RegisterPanel>
          </div>
        </div>

        <aside className="flex min-h-0 flex-col gap-4">
          <div className="relative flex-1 overflow-hidden rounded-[32px] border border-white/15 bg-white/10 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-1/4 h-56 w-56 rounded-full bg-emerald-300/15 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100/70">KI-Analyse</p>
              <h2 className="mt-1 text-3xl font-black text-white">{aiProfile}</h2>
              <p className="mt-1 text-sm text-white/70">{language === "de" ? "Dein Buddy erkennt Motivation, Rhythmus und soziale Spielweise." : "Your buddy reads motivation, rhythm and social playstyle."}</p>
            </div>

            <div className="relative mt-6 grid gap-3">
              {[[language === "de" ? "Aktivitätsenergie" : "Activity energy", activityScore, "⚡"], [language === "de" ? "Mission-Fokus" : "Mission focus", missionScore, "🎯"], [language === "de" ? "Community-Signal" : "Community signal", socialScore, "🌐"]].map(([label, value, icon]) => (
                <div key={label as string} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold text-white/85">{icon} {label}</span><span className="font-black text-cyan-100">{value}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400 transition-all duration-500" style={{ width: `${value}%` }} /></div>
                </div>
              ))}
            </div>

            <div className="relative mt-6 rounded-3xl border border-white/10 bg-white/10 p-4 text-sm text-white/85">
              <div className="mb-2 text-lg font-black text-cyan-100">🐉 Flammi empfiehlt</div>
              <p>{language === "de" ? `Starte im ${fitnessTextFromActivity(activityLevel)} mit ${communityLabel}. Deine erste Mission sollte ${activityTypeLabel(activityType)} nutzen.` : `Start with ${communityLabel}. Your first mission should use ${activityType}.`}</p>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_220px] gap-4">
            <div className="rounded-[24px] border border-white/15 bg-black/15 p-4 text-sm text-white/80">
              <div className="font-black text-cyan-100">Mission Blueprint</div>
              <div className="mt-1">{goals.length || 0} Ziele | {communityLabel} | {timeLabel}</div>
            </div>
            <div className="flex items-end"><PrimaryButton onClick={onNext}>{t.createAvatar}</PrimaryButton></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function fitnessTextFromActivity(value: string) {
  if (value === "very") return "Power-Modus";
  if (value === "regular") return "Aktiv-Modus";
  if (value === "sometimes") return "Aufbau-Modus";
  return "Starter-Modus";
}

function activityTypeLabel(value: string) {
  if (value === "running") return "Laufen";
  if (value === "cycling") return "Radfahren";
  if (value === "dancing") return "Tanzen";
  if (value === "workout") return "Workout";
  if (value === "relax") return "Entspannung";
  return "Gehen";
}
