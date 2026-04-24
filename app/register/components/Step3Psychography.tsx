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

export default function Step3Psychography({ language, psychography, setPsychography, onNext }: Props) {
  const t = getRegisterContent(language);
  const toggleGoal = (goal: string) => {
    const goals = psychography.goals ?? [];
    const nextGoals = goals.includes(goal) ? goals.filter((item: string) => item !== goal) : [...goals, goal];
    setPsychography({ ...psychography, goals: nextGoals });
  };

  return (
    <div className="absolute left-8 top-28 w-[48%] scale-[0.88] origin-top-left space-y-3">
      <RegisterPanel title={t.activeNow}>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["low", t.almostInactive],
            ["sometimes", t.sometimes],
            ["regular", t.regular],
            ["very", t.veryActive],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setPsychography({ ...psychography, activityLevel: value })}
              className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${psychography.activityLevel === value ? "bg-cyan-300 text-[#053841]" : "bg-white/10 text-white hover:bg-white/15"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </RegisterPanel>

      <RegisterPanel title={t.goals}>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["loseWeight", t.loseWeight],
            ["fitness", t.improveFitness],
            ["health", t.stayHealthy],
            ["adventure", t.adventure],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleGoal(value)}
              className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${(psychography.goals ?? []).includes(value) ? "bg-green-300 text-[#053841]" : "bg-white/10 text-white hover:bg-white/15"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </RegisterPanel>

      <div className="grid grid-cols-2 gap-3">
        <RegisterPanel title={t.communityMode}>
          <select value={psychography.communityMode ?? "private"} onChange={(e) => setPsychography({ ...psychography, communityMode: e.target.value })} className="h-12 w-full rounded-lg bg-white/10 px-3 text-white outline-none">
            <option value="public">{t.publicBoard}</option>
            <option value="private">{t.privateSquads}</option>
            <option value="solo">{t.soloMode}</option>
          </select>
        </RegisterPanel>

        <RegisterPanel title={t.trainingTime}>
          <select value={psychography.trainingTime ?? "morning"} onChange={(e) => setPsychography({ ...psychography, trainingTime: e.target.value })} className="h-12 w-full rounded-lg bg-white/10 px-3 text-white outline-none">
            <option value="morning">{t.morning}</option>
            <option value="noon">{t.noon}</option>
            <option value="evening">{t.evening}</option>
          </select>
        </RegisterPanel>
      </div>

      <RegisterPanel title={t.activities}>
        <select value={psychography.activityType ?? "walking"} onChange={(e) => setPsychography({ ...psychography, activityType: e.target.value })} className="mb-4 h-12 w-full rounded-lg bg-white/10 px-3 text-white outline-none">
          <option value="walking">{t.walking}</option>
          <option value="running">{t.running}</option>
          <option value="cycling">{t.cycling}</option>
          <option value="dancing">{t.dancing}</option>
          <option value="workout">{t.workout}</option>
          <option value="relax">{t.relax}</option>
        </select>
        <PrimaryButton onClick={onNext}>{t.createAvatar}</PrimaryButton>
      </RegisterPanel>
    </div>
  );
}
