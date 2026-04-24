"use client";

import PrimaryButton from "@/app/components/PrimaryButton";
import { Language } from "../registerTypes";
import { getRegisterContent } from "../registerContent";

type Props = { language: Language; psychography: any; setPsychography: (value: any) => void; onNext: () => void };

const panelClass = "rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-[0_12px_34px_rgba(0,0,0,0.13)] backdrop-blur-sm";
const optionClass = (active: boolean) => `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-base font-semibold transition ${active ? "bg-cyan-300 text-[#053841] shadow-[0_0_18px_rgba(103,232,249,0.35)]" : "bg-black/15 text-white hover:bg-white/15"}`;
const smallOptionClass = (active: boolean) => `flex items-center gap-2 rounded-xl px-3 py-2 text-base font-semibold transition ${active ? "bg-cyan-300 text-[#053841] shadow-[0_0_18px_rgba(103,232,249,0.35)]" : "bg-black/15 text-white hover:bg-white/15"}`;

export default function Step3Psychography({ language, psychography, setPsychography, onNext }: Props) {
  const t = getRegisterContent(language);
  const goals = psychography.goals ?? [];
  const interests = psychography.interests ?? [];
  const activities = psychography.activities ?? [];
  const activityLevel = psychography.activityLevel ?? "low";
  const communityMode = psychography.communityMode ?? "public";
  const companionType = psychography.companionType ?? "magical";

  const toggleList = (key: "goals" | "interests" | "activities", value: string) => {
    const current = key === "goals" ? goals : key === "interests" ? interests : activities;
    const next = current.includes(value) ? current.filter((item: string) => item !== value) : [...current, value];
    setPsychography({ ...psychography, [key]: next, activityType: key === "activities" && next[0] ? next[0] : psychography.activityType });
  };

  return (
    <section className="absolute inset-x-8 top-12 bottom-8 overflow-hidden">
      <div className="mb-7 text-center">
        <div className="text-[10px] font-bold tracking-[0.22em] text-cyan-100/55">Phase 03</div>
        <h1 className="mt-1 text-5xl font-black tracking-tight text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.18)]">Grundeinstellungen</h1>
        <p className="mt-3 text-xl font-medium text-white/88">Deine Angaben helfen der KI, dir passende Missionen und Belohnungen zu generieren.</p>
      </div>

      <div className="grid h-[calc(100%-136px)] grid-cols-[1fr_1fr_1fr] gap-5">
        <div className="flex min-h-0 flex-col gap-5">
          <div className={panelClass}>
            <h2 className="mb-4 text-xl font-black text-white">Wie aktiv bist du aktuell?</h2>
            <div className="grid gap-2">
              {[["low", "Kaum aktiv"], ["sometimes", "Gehe gelegentlich"], ["regular", "Trainiere regelmäßig"], ["very", "Treibe ausreichend Sport"]].map(([value, label]) => <button key={value} type="button" onClick={() => setPsychography({ ...psychography, activityLevel: value })} className={optionClass(activityLevel === value)}><span className="h-3 w-3 rounded-sm bg-white" />{label}</button>)}
            </div>
          </div>
          <div className={panelClass}>
            <h2 className="mb-4 text-xl font-black text-white">Was sind deine Ziele?</h2>
            <div className="grid gap-2">
              {[["loseWeight", "Abnehmen"], ["fitness", "Fitness steigern"], ["health", "Gesund bleiben"], ["adventure", "Abenteuer erleben"]].map(([value, label]) => <button key={value} type="button" onClick={() => toggleList("goals", value)} className={optionClass(goals.includes(value))}><span className="h-3 w-3 rounded-sm bg-white" />{label}</button>)}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-5">
          <div className={panelClass}>
            <h2 className="mb-4 text-xl font-black text-white">Was interessiert dich am meisten?</h2>
            <div className="grid gap-2">
              {[["game", "Spiel & Erfahrung"], ["fitness", "Fitness & Gesundheit"], ["nutrition", "Ernährung & Wissen"], ["nature", "Natur & Entdecken"]].map(([value, label]) => <button key={value} type="button" onClick={() => toggleList("interests", value)} className={optionClass(interests.includes(value))}><span className="h-3 w-3 rounded-sm bg-white" />{label}</button>)}
            </div>
          </div>
          <div className={panelClass}>
            <h2 className="mb-4 text-xl font-black text-white">Wähle deinen Start-Tamagotchi</h2>
            <div className="grid gap-2">
              {[["animal", "Tierischer Begleiter"], ["magical", "Magisches Wesen"], ["robot", "Digitaler Roboter"], ["hero", "Junger Held (mittelalterlich)"]].map(([value, label]) => <button key={value} type="button" onClick={() => setPsychography({ ...psychography, companionType: value })} className={optionClass(companionType === value)}><span className="h-3 w-3 rounded-sm bg-white" />{label}</button>)}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-5">
          <div className={panelClass}>
            <h2 className="mb-4 text-xl font-black text-white">Bevorzugte Aktivität</h2>
            <div className="grid grid-cols-2 gap-2">
              {[["walking", "Gehen"], ["running", "Laufen"], ["cycling", "Radfahren"], ["dancing", "Tanzen"], ["workout", "Workout"], ["relax", "Yoga"]].map(([value, label]) => <button key={value} type="button" onClick={() => toggleList("activities", value)} className={smallOptionClass(activities.includes(value))}><span className="h-3 w-3 rounded-sm bg-white" />{label}</button>)}
            </div>
          </div>
          <div className={`${panelClass} flex-1`}>
            <h2 className="mb-4 text-xl font-black text-white">Community-Modus</h2>
            <div className="grid gap-2">
              {[["public", t.publicBoard], ["private", t.privateSquads], ["solo", t.soloMode]].map(([value, label]) => <button key={value} type="button" onClick={() => setPsychography({ ...psychography, communityMode: value })} className={optionClass(communityMode === value)}><span className="h-3 w-3 rounded-sm bg-white" />{label}</button>)}
            </div>
            <div className="mt-5 rounded-[24px] border border-white/10 bg-black/15 p-4 text-center">
              <div className="text-lg font-black text-cyan-100">Dein KI-Profil</div>
              <p className="mt-2 text-sm text-white/75">{goals.length} Ziele · {interests.length} Interessen · {activities.length} Aktivitäten</p>
            </div>
          </div>
          <div className="flex justify-end"><div className="w-[290px]"><PrimaryButton onClick={onNext}>Speichern / Weiter</PrimaryButton></div></div>
        </div>
      </div>
    </section>
  );
}
