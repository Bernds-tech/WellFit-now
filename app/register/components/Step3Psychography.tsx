"use client";

import PrimaryButton from "@/app/components/PrimaryButton";
import { Language, RegistrationPreferencesForm } from "../registerTypes";
import { getRegisterContent } from "../registerContent";

type Props = {
  language: Language;
  psychography: RegistrationPreferencesForm;
  setPsychography: (value: RegistrationPreferencesForm) => void;
  onNext: () => void;
};

const panelClass = "rounded-[26px] border border-white/15 bg-white/10 p-4 shadow-[0_12px_34px_rgba(0,0,0,0.13)] backdrop-blur-sm";
const optionClass = (active: boolean) => `flex items-center gap-3 rounded-2xl px-3 py-2 text-left text-[0.95rem] font-semibold transition ${active ? "bg-cyan-300 text-[#053841] shadow-[0_0_18px_rgba(103,232,249,0.35)]" : "bg-black/15 text-white hover:bg-white/15"}`;
const smallOptionClass = (active: boolean) => `flex items-center gap-2 rounded-xl px-3 py-2 text-[0.95rem] font-semibold transition ${active ? "bg-cyan-300 text-[#053841] shadow-[0_0_18px_rgba(103,232,249,0.35)]" : "bg-black/15 text-white hover:bg-white/15"}`;

export default function Step3Psychography({ language, psychography, setPsychography, onNext }: Props) {
  const t = getRegisterContent(language);
  const goals = psychography.goals;
  const interests = psychography.interests;
  const activities = psychography.activities;

  const toggleList = (key: "goals" | "interests" | "activities", value: string) => {
    const current = psychography[key];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setPsychography({
      ...psychography,
      [key]: next,
      activityType: key === "activities" && next[0] ? next[0] : psychography.activityType,
    });
  };

  return (
    <section className="absolute inset-x-5 bottom-5 top-12 overflow-y-auto px-2 sm:inset-x-8 sm:bottom-8 lg:overflow-hidden">
      <div className="mb-5 text-center">
        <div className="text-[10px] font-bold tracking-[0.22em] text-cyan-100/55">Phase 03</div>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.18)] sm:text-4xl">{language === "de" ? "Deine Interessen" : "Your interests"}</h1>
        <p className="mt-2 text-base font-medium text-white/88 sm:text-lg">
          {language === "de"
            ? "Diese Angaben helfen, passende Missionen vorzuschlagen. Dein Profil startet privat."
            : "These choices help suggest suitable missions. Your profile starts private."}
        </p>
      </div>

      <div className="grid min-h-[920px] gap-5 lg:h-[calc(100%-112px)] lg:min-h-0 lg:grid-cols-3">
        <div className="flex min-h-0 flex-col gap-4 lg:pt-12">
          <div className={panelClass}>
            <h2 className="mb-3 text-lg font-black text-white">{language === "de" ? "Wie aktiv bist du aktuell?" : "How active are you now?"}</h2>
            <div className="grid gap-2">
              {([[
                "low", language === "de" ? "Kaum aktiv" : "Low activity",
              ], [
                "sometimes", language === "de" ? "Gelegentlich aktiv" : "Sometimes active",
              ], [
                "regular", language === "de" ? "Regelmäßig aktiv" : "Regularly active",
              ], [
                "very", language === "de" ? "Sehr aktiv" : "Very active",
              ]] as const).map(([value, label]) => (
                <button key={value} type="button" onClick={() => setPsychography({ ...psychography, activityLevel: value })} className={optionClass(psychography.activityLevel === value)}><span className="h-3 w-3 rounded-sm bg-white" />{label}</button>
              ))}
            </div>
          </div>
          <div className={panelClass}>
            <h2 className="mb-3 text-lg font-black text-white">{language === "de" ? "Was sind deine Ziele?" : "What are your goals?"}</h2>
            <div className="grid gap-2">
              {([[
                "moreMovement", language === "de" ? "Mehr Bewegung" : "More movement",
              ], [
                "fitness", language === "de" ? "Fitness steigern" : "Improve fitness",
              ], [
                "learning", language === "de" ? "Aktiv lernen" : "Learn actively",
              ], [
                "adventure", language === "de" ? "Abenteuer erleben" : "Explore adventures",
              ]] as const).map(([value, label]) => (
                <button key={value} type="button" onClick={() => toggleList("goals", value)} className={optionClass(goals.includes(value))}><span className="h-3 w-3 rounded-sm bg-white" />{label}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-4 lg:pt-12">
          <div className={panelClass}>
            <h2 className="mb-3 text-lg font-black text-white">{language === "de" ? "Was interessiert dich?" : "What interests you?"}</h2>
            <div className="grid gap-2">
              {([[
                "game", language === "de" ? "Spiel & Abenteuer" : "Games & adventure",
              ], [
                "fitness", language === "de" ? "Fitness & Bewegung" : "Fitness & movement",
              ], [
                "learning", language === "de" ? "Lernen & Wissen" : "Learning & knowledge",
              ], [
                "nature", language === "de" ? "Natur & Entdecken" : "Nature & discovery",
              ]] as const).map(([value, label]) => (
                <button key={value} type="button" onClick={() => toggleList("interests", value)} className={optionClass(interests.includes(value))}><span className="h-3 w-3 rounded-sm bg-white" />{label}</button>
              ))}
            </div>
          </div>
          <div className={panelClass}>
            <h2 className="mb-3 text-lg font-black text-white">{language === "de" ? "Buddy-Stil" : "Buddy style"}</h2>
            <div className="grid gap-2">
              {([[
                "animal", language === "de" ? "Tierischer Begleiter" : "Animal companion",
              ], [
                "magical", language === "de" ? "Magisches Wesen" : "Magical being",
              ], [
                "robot", language === "de" ? "Digitaler Roboter" : "Digital robot",
              ], [
                "hero", language === "de" ? "Junger Held" : "Young hero",
              ]] as const).map(([value, label]) => (
                <button key={value} type="button" onClick={() => setPsychography({ ...psychography, companionType: value })} className={optionClass(psychography.companionType === value)}><span className="h-3 w-3 rounded-sm bg-white" />{label}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-4">
          <div className={panelClass}>
            <h2 className="mb-3 text-lg font-black text-white">{language === "de" ? "Bevorzugte Aktivität" : "Preferred activity"}</h2>
            <div className="grid grid-cols-2 gap-2">
              {([[
                "walking", language === "de" ? "Gehen" : "Walking",
              ], [
                "running", language === "de" ? "Laufen" : "Running",
              ], [
                "cycling", language === "de" ? "Radfahren" : "Cycling",
              ], [
                "dancing", language === "de" ? "Tanzen" : "Dancing",
              ], [
                "workout", "Workout",
              ], [
                "relax", language === "de" ? "Yoga / Ruhe" : "Yoga / calm",
              ]] as const).map(([value, label]) => (
                <button key={value} type="button" onClick={() => toggleList("activities", value)} className={smallOptionClass(activities.includes(value))}><span className="h-3 w-3 rounded-sm bg-white" />{label}</button>
              ))}
            </div>
          </div>
          <div className={`${panelClass} flex-1`}>
            <h2 className="mb-3 text-lg font-black text-white">{language === "de" ? "Sichtbarkeit zum Start" : "Starting visibility"}</h2>
            <div className="grid gap-2">
              {([[
                "solo", t.soloMode,
              ], [
                "private", t.privateSquads,
              ], [
                "public", t.publicBoard,
              ]] as const).map(([value, label]) => (
                <button key={value} type="button" onClick={() => setPsychography({ ...psychography, communityMode: value })} className={optionClass(psychography.communityMode === value)}><span className="h-3 w-3 rounded-sm bg-white" />{label}</button>
              ))}
            </div>
            <div className="mt-4 rounded-[22px] border border-white/10 bg-black/15 p-3 text-center">
              <div className="text-base font-black text-cyan-100">{language === "de" ? "Dein privates Startprofil" : "Your private starter profile"}</div>
              <p className="mt-1 text-sm text-white/75">{goals.length} {language === "de" ? "Ziele" : "goals"} · {interests.length} {language === "de" ? "Interessen" : "interests"} · {activities.length} {language === "de" ? "Aktivitäten" : "activities"}</p>
              <p className="mt-2 text-xs text-white/60">{language === "de" ? "Öffentliche Sichtbarkeit wird nicht automatisch aktiviert und kann später geändert werden." : "Public visibility is not enabled automatically and can be changed later."}</p>
            </div>
          </div>
          <div className="flex shrink-0 justify-end pb-2"><div className="w-full sm:w-[290px]"><PrimaryButton onClick={onNext}>{language === "de" ? "Speichern / Weiter" : "Save / Continue"}</PrimaryButton></div></div>
        </div>
      </div>
    </section>
  );
}
