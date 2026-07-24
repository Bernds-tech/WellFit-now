"use client";

/* eslint-disable @next/next/no-img-element */

import RegisterPanel from "./RegisterPanel";
import PrimaryButton from "@/app/components/PrimaryButton";
import { Language, RegistrationHealthForm } from "../registerTypes";
import { getRegisterContent } from "../registerContent";

type Props = {
  language: Language;
  biometrics: RegistrationHealthForm;
  setBiometrics: (value: RegistrationHealthForm) => void;
  onNext: () => void;
};

type Buddy = {
  id: string;
  label: string;
  file: string;
  description: string;
};

const buddies: Buddy[] = [
  { id: "flammi", label: "Flammi", file: "flammi.png", description: "Mutiger Drachen-Buddy für deinen WellFit-Start." },
  { id: "luma", label: "Luma", file: "luma.png", description: "Ruhiger Licht-Buddy für Balance und gesunde Routinen." },
  { id: "turt", label: "Turt", file: "turt.png", description: "Geduldiger Buddy für Ausdauer und langfristige Ziele." },
  { id: "king", label: "King", file: "king.png", description: "Power-Buddy für Wettkämpfe und starke Ziele." },
  { id: "ghost", label: "Ghost", file: "gohst.png", description: "Geheimnisvoller Buddy für stille Stärke, Fokus und Abenteuer." },
];

const inputClass = "h-10 w-full rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/20";
const rangeClass = "w-full accent-cyan-300";
const chipClass = (active: boolean) => `rounded-xl px-2 py-1.5 text-xs font-semibold transition ${active ? "bg-cyan-300 text-[#053841] shadow-[0_0_18px_rgba(103,232,249,0.35)]" : "bg-white/10 text-white hover:bg-white/15"}`;

function HealthNotice({ language }: { language: Language }) {
  return (
    <div className="rounded-[22px] border border-cyan-200/20 bg-cyan-100/10 px-4 py-3 text-xs leading-relaxed text-white/80">
      <strong className="text-cyan-100">{language === "de" ? "Freiwillige Personalisierung" : "Optional personalization"}</strong>
      <p className="mt-1">
        {language === "de"
          ? "Geburtsdatum wird nur zur Altersprüfung verarbeitet und nicht gespeichert. Gesundheitsnahe Angaben werden nur bei aktivierter Zustimmung minimiert gespeichert."
          : "Your birth date is processed only for age verification and is not stored. Health-adjacent fields are stored in minimized form only when you opt in."}
      </p>
    </div>
  );
}

export default function Step2Biometrics({ language, biometrics, setBiometrics, onNext }: Props) {
  const t = getRegisterContent(language);
  const selectedBuddy = buddies.find((buddy) => buddy.id === biometrics.buddyId) ?? buddies[0];
  const selectedIndex = Math.max(0, buddies.findIndex((buddy) => buddy.id === selectedBuddy.id));
  const selectBuddy = (buddy: Buddy) => setBiometrics({
    ...biometrics,
    buddyId: buddy.id,
    buddyFile: buddy.file,
    buddyName: buddy.label,
  });
  const moveBuddy = (direction: -1 | 1) => selectBuddy(
    buddies[(selectedIndex + direction + buddies.length) % buddies.length],
  );
  const toggleLimitation = (item: string) => {
    const selected = biometrics.limitations.includes(item);
    setBiometrics({
      ...biometrics,
      limitations: selected
        ? biometrics.limitations.filter((value) => value !== item)
        : [...biometrics.limitations, item],
    });
  };

  return (
    <section className="absolute inset-x-5 bottom-5 top-16 overflow-y-auto px-2 sm:inset-x-8 sm:bottom-8 lg:overflow-hidden">
      <div className="mb-4 text-center">
        <div className="text-[10px] font-bold tracking-[0.22em] text-cyan-100/55">{t.biometricsPhase}</div>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
          {language === "de" ? "Alter, Buddy und optionale Personalisierung" : "Age, buddy and optional personalization"}
        </h1>
      </div>

      <div className="grid min-h-[760px] gap-5 lg:h-[calc(100%-64px)] lg:min-h-0 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="min-h-0 overflow-y-auto pr-1">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><HealthNotice language={language} /></div>
            <RegisterPanel title={t.birthdate}>
              <input
                type="date"
                value={biometrics.birthdate}
                onChange={(event) => setBiometrics({ ...biometrics, birthdate: event.target.value })}
                className={inputClass}
                autoComplete="bday"
              />
            </RegisterPanel>
            <RegisterPanel title={language === "de" ? "Health-Personalisierung" : "Health personalization"}>
              <button
                type="button"
                onClick={() => setBiometrics({ ...biometrics, healthPersonalization: !biometrics.healthPersonalization })}
                className={`w-full rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${biometrics.healthPersonalization ? "bg-emerald-300 text-[#053841]" : "bg-white/10 text-white"}`}
              >
                {biometrics.healthPersonalization
                  ? language === "de" ? "Aktiv – freiwillige Angaben werden gespeichert" : "On – optional fields will be stored"
                  : language === "de" ? "Aus – keine Gesundheitsangaben speichern" : "Off – do not store health fields"}
              </button>
            </RegisterPanel>

            {biometrics.healthPersonalization ? (
              <>
                <RegisterPanel title={t.size}>
                  <input type="range" min={140} max={220} value={biometrics.height} onChange={(event) => setBiometrics({ ...biometrics, height: Number(event.target.value) })} className={rangeClass} />
                  <div className="mt-1 flex items-end justify-center gap-2"><span className="text-2xl font-black text-cyan-100">{biometrics.height}</span><span className="pb-1 text-xs text-white/70">cm</span></div>
                </RegisterPanel>
                <RegisterPanel title={t.weight}>
                  <input type="range" min={35} max={180} value={biometrics.weight} onChange={(event) => setBiometrics({ ...biometrics, weight: Number(event.target.value) })} className={rangeClass} />
                  <div className="mt-1 flex items-end justify-center gap-2"><span className="text-2xl font-black text-cyan-100">{biometrics.weight}</span><span className="pb-1 text-xs text-white/70">kg</span></div>
                </RegisterPanel>
                <RegisterPanel title={t.fitnessLevel}>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["beginner", "medium", "pro"] as const).map((value) => (
                      <button key={value} type="button" onClick={() => setBiometrics({ ...biometrics, fitnessLevel: value })} className={chipClass(biometrics.fitnessLevel === value)}>
                        {value === "beginner" ? t.beginner : value === "medium" ? t.medium : t.pro}
                      </button>
                    ))}
                  </div>
                </RegisterPanel>
                <RegisterPanel title={language === "de" ? "Schlafdauer" : "Sleep duration"}>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["<6", "6-8", ">8"] as const).map((value) => (
                      <button key={value} type="button" onClick={() => setBiometrics({ ...biometrics, sleepHours: value })} className={chipClass(biometrics.sleepHours === value)}>{value}</button>
                    ))}
                  </div>
                </RegisterPanel>
                <RegisterPanel title={language === "de" ? "Schlafqualität" : "Sleep quality"}>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["poor", "okay", "good"] as const).map((value) => (
                      <button key={value} type="button" onClick={() => setBiometrics({ ...biometrics, sleepQuality: value })} className={chipClass(biometrics.sleepQuality === value)}>
                        {value === "poor" ? (language === "de" ? "Niedrig" : "Low") : value === "okay" ? (language === "de" ? "Mittel" : "Medium") : (language === "de" ? "Gut" : "Good")}
                      </button>
                    ))}
                  </div>
                </RegisterPanel>
                <RegisterPanel title={language === "de" ? "Stress (Selbsteinschätzung)" : "Stress (self assessment)"}>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button key={value} type="button" onClick={() => setBiometrics({ ...biometrics, stressLevel: value })} className={chipClass(biometrics.stressLevel === value)}>{value}</button>
                    ))}
                  </div>
                </RegisterPanel>
                <RegisterPanel title={language === "de" ? "Ernährungspräferenz" : "Nutrition preference"}>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["all", "vegetarian", "vegan", "light"] as const).map((value) => (
                      <button key={value} type="button" onClick={() => setBiometrics({ ...biometrics, nutrition: value })} className={chipClass(biometrics.nutrition === value)}>
                        {value === "all" ? (language === "de" ? "Ausgewogen" : "Balanced") : value === "vegetarian" ? "Vegetarisch" : value === "vegan" ? "Vegan" : (language === "de" ? "Leicht" : "Light")}
                      </button>
                    ))}
                  </div>
                </RegisterPanel>
                <div className="sm:col-span-2">
                  <RegisterPanel title={language === "de" ? "Optionale Einschränkungs-Kategorien" : "Optional limitation categories"}>
                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                      {["Rücken", "Knie", "Herz", "Asthma"].map((item) => (
                        <button key={item} type="button" onClick={() => toggleLimitation(item)} className={chipClass(biometrics.limitations.includes(item))}>{item}</button>
                      ))}
                    </div>
                  </RegisterPanel>
                </div>
                <div className="sm:col-span-2 rounded-[22px] border border-white/10 bg-black/15 p-3 text-xs text-white/80">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={biometrics.medicationDeclared} onChange={(event) => setBiometrics({ ...biometrics, medicationDeclared: event.target.checked })} className="h-4 w-4 accent-cyan-300" />
                    <span>{language === "de" ? "Ich habe eine Medikamenteneinnahme angegeben. Es werden keine Medikamentennamen oder Details gespeichert." : "I declare medication use. No medication names or details are stored."}</span>
                  </label>
                </div>
              </>
            ) : (
              <div className="sm:col-span-2 rounded-[26px] border border-white/10 bg-black/15 p-5 text-center text-sm text-white/75">
                {language === "de"
                  ? "Du kannst WellFit vollständig ohne Gesundheitsprofil nutzen. Diese Angaben können später freiwillig in den Einstellungen ergänzt werden."
                  : "You can use WellFit fully without a health profile. Optional data can be added later in settings."}
              </div>
            )}
          </div>
        </div>

        <aside className="flex min-h-0 flex-col gap-3">
          <div className="relative flex-1 overflow-hidden rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm">
            <div className="relative mb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100/70">Buddy-Auswahl</p>
              <p className="text-xs text-white/70">{language === "de" ? "Dein Buddy wird serverseitig angelegt – ohne Punkte- oder Token-Gutschrift." : "Your buddy is initialized by the server without points or token grants."}</p>
            </div>
            <div className="relative flex h-[calc(100%-54px)] flex-col items-center justify-center text-center">
              <div className="relative flex w-full flex-1 items-center justify-center">
                <button type="button" onClick={() => moveBuddy(-1)} className="absolute left-2 z-10 grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/20 text-3xl font-black text-cyan-100 transition hover:bg-black/30" aria-label="Vorheriger Buddy">‹</button>
                <div className="grid h-64 w-64 place-items-center rounded-full border border-white/20 bg-cyan-100/15 shadow-[0_0_70px_rgba(103,232,249,0.24)]">
                  <img src={`/buddy/${selectedBuddy.file}`} alt={selectedBuddy.label} className="max-h-[240px] max-w-[240px] object-contain drop-shadow-[0_18px_35px_rgba(0,0,0,0.32)]" />
                </div>
                <button type="button" onClick={() => moveBuddy(1)} className="absolute right-2 z-10 grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/20 text-3xl font-black text-cyan-100 transition hover:bg-black/30" aria-label="Nächster Buddy">›</button>
              </div>
              <div className="mb-4 rounded-2xl border border-white/10 bg-black/15 px-5 py-3">
                <div className="text-4xl font-black text-cyan-100 drop-shadow-[0_0_14px_rgba(103,232,249,0.25)]">{selectedBuddy.label}</div>
                <p className="mt-1 max-w-[440px] text-sm leading-relaxed text-white/75">{selectedBuddy.description}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end pb-1"><div className="w-full sm:w-[260px]"><PrimaryButton onClick={onNext}>{t.next}</PrimaryButton></div></div>
        </aside>
      </div>
    </section>
  );
}
