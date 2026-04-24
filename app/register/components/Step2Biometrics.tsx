"use client";

import RegisterPanel from "./RegisterPanel";
import PrimaryButton from "@/app/components/PrimaryButton";
import { Language } from "../registerTypes";
import { getRegisterContent } from "../registerContent";

type Props = { language: Language; biometrics: any; setBiometrics: (value: any) => void; onNext: () => void; };

type Buddy = { id: string; label: string; file: string; description: string };

const buddies: Buddy[] = [
  { id: "flammi", label: "Flammi", file: "flammi.png", description: "Mutiger Drachen-Buddy für deinen WellFit-Start." },
  { id: "luma", label: "Luma", file: "luma.png", description: "Ruhiger Licht-Buddy für Balance und gesunde Routinen." },
  { id: "turt", label: "Turt", file: "turt.png", description: "Geduldiger Buddy für Ausdauer und langfristige Ziele." },
  { id: "ghost", label: "Ghost", file: "ghost.png", description: "Mystery-Buddy für Abenteuer und Überraschungen." },
  { id: "wizard", label: "Zauberer", file: "wizard.png", description: "Magischer Buddy für Lernen, Quiz und Rätsel." },
  { id: "king", label: "King", file: "king.png", description: "Power-Buddy für Wettkämpfe und starke Ziele." },
  { id: "queen", label: "Queen", file: "queen.png", description: "Strategischer Buddy für Fortschritt und Community." },
  { id: "princess", label: "Princess", file: "princess.png", description: "Freundlicher Buddy für Story- und Familienmissionen." },
  { id: "dragonPrincess", label: "Dragon Princess", file: "dragon_princess.png", description: "Fantasy-Buddy für magische Bewegungsabenteuer." },
  { id: "dragonQueen", label: "Dragon Queen", file: "dragon_queen.png", description: "Elite-Buddy für ambitionierte Langzeitmotivation." },
  { id: "royalDragon", label: "Royal Dragon", file: "royal_dragon.png", description: "Legendärer Buddy für High-Level-Missionen." },
];

const inputClass = "h-9 w-full rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/20";
const rangeClass = "w-full accent-cyan-300";
const chipClass = (active: boolean) => `rounded-xl px-2 py-1.5 text-xs font-semibold transition ${active ? "bg-cyan-300 text-[#053841] shadow-[0_0_18px_rgba(103,232,249,0.35)]" : "bg-white/10 text-white hover:bg-white/15"}`;

export default function Step2Biometrics({ language, biometrics, setBiometrics, onNext }: Props) {
  const t = getRegisterContent(language);
  const height = biometrics.height ?? 180;
  const weight = biometrics.weight ?? 82;
  const selectedBuddy = buddies.find((buddy) => buddy.id === (biometrics.buddyId ?? "flammi")) ?? buddies[0];
  const selectedIndex = Math.max(0, buddies.findIndex((buddy) => buddy.id === selectedBuddy.id));
  const bmi = weight / Math.pow(height / 100, 2);
  const bmiLabel = bmi < 18.5 ? "Leicht" : bmi < 25 ? "Balance" : bmi < 30 ? "Kraft" : "Power";
  const extraScore = (biometrics.sleepHours ? 5 : 0) + (biometrics.nutrition ? 5 : 0) + (biometrics.natureMove ? 5 : 0) + (biometrics.drinkReminder ? 5 : 0) + (biometrics.buddyId ? 10 : 0);
  const setupScore = Math.min(100, 35 + Math.round(((height - 140) / 80) * 20) + Math.round(((weight - 35) / 145) * 15) + ((biometrics.limitations ?? []).length > 0 ? 10 : 0) + ((biometrics.medication ?? "no") === "yes" ? 10 : 20) + extraScore);
  const fitnessText = biometrics.fitnessLevel === "pro" ? "Pro-Modus" : biometrics.fitnessLevel === "medium" ? "Aktiv-Modus" : "Einsteiger-Modus";
  const otherText = language === "de" ? "Sonstiges / Hinweis" : "Other / note";
  const selectBuddy = (buddy: Buddy) => setBiometrics({ ...biometrics, buddyId: buddy.id, buddyFile: buddy.file, buddyName: buddy.label });
  const moveBuddy = (direction: -1 | 1) => selectBuddy(buddies[(selectedIndex + direction + buddies.length) % buddies.length]);

  return (
    <section className="absolute inset-x-8 top-16 bottom-5 overflow-hidden">
      <div className="mb-3 text-center"><div className="text-[10px] font-bold tracking-[0.22em] text-cyan-100/55">{t.biometricsPhase}</div><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white">{t.setupTitle}</h1></div>

      <div className="grid h-[calc(100%-60px)] grid-cols-[1.15fr_0.95fr] gap-5">
        <div className="min-h-0 overflow-hidden pr-1">
          <div className="mb-2 rounded-[20px] border border-white/15 bg-black/15 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm"><div className="flex items-center justify-between text-xs text-white/80"><span className="font-bold">Profil-Setup</span><span className="font-black text-cyan-100">{setupScore}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400 transition-all duration-500" style={{ width: `${setupScore}%` }} /></div></div>

          <div className="grid grid-cols-3 gap-2.5">
            <RegisterPanel title={t.birthdate}><input type="date" value={biometrics.birthdate ?? ""} onChange={(e) => setBiometrics({ ...biometrics, birthdate: e.target.value })} className={inputClass} /></RegisterPanel>
            <RegisterPanel title={t.gender}><div className="grid grid-cols-3 gap-1.5"><button type="button" onClick={() => setBiometrics({ ...biometrics, gender: "male" })} className={chipClass((biometrics.gender ?? "male") === "male")}>{t.male}</button><button type="button" onClick={() => setBiometrics({ ...biometrics, gender: "female" })} className={chipClass((biometrics.gender ?? "male") === "female")}>{t.female}</button><button type="button" onClick={() => setBiometrics({ ...biometrics, gender: "diverse" })} className={chipClass((biometrics.gender ?? "male") === "diverse")}>{t.diverse}</button></div></RegisterPanel>
            <RegisterPanel title={t.bodyType}><div className="grid grid-cols-3 gap-1.5"><button type="button" onClick={() => setBiometrics({ ...biometrics, bodyType: "slim" })} className={chipClass((biometrics.bodyType ?? "slim") === "slim")}>{t.slim}</button><button type="button" onClick={() => setBiometrics({ ...biometrics, bodyType: "athletic" })} className={chipClass((biometrics.bodyType ?? "slim") === "athletic")}>{t.athletic}</button><button type="button" onClick={() => setBiometrics({ ...biometrics, bodyType: "strong" })} className={chipClass((biometrics.bodyType ?? "slim") === "strong")}>{t.strong}</button></div></RegisterPanel>
            <RegisterPanel title={t.size}><input type="range" min={140} max={220} value={height} onChange={(e) => setBiometrics({ ...biometrics, height: Number(e.target.value) })} className={rangeClass} /><div className="mt-1 flex items-end justify-center gap-2"><span className="text-2xl font-black text-cyan-100">{height}</span><span className="pb-1 text-xs text-white/70">cm</span></div></RegisterPanel>
            <RegisterPanel title={t.weight}><input type="range" min={35} max={180} value={weight} onChange={(e) => setBiometrics({ ...biometrics, weight: Number(e.target.value) })} className={rangeClass} /><div className="mt-1 flex items-end justify-center gap-2"><span className="text-2xl font-black text-cyan-100">{weight}</span><span className="pb-1 text-xs text-white/70">kg</span></div></RegisterPanel>
            <RegisterPanel title="Zielgewicht"><div className="grid grid-cols-[1fr_70px] gap-2"><button type="button" onClick={() => setBiometrics({ ...biometrics, targetWeight: !biometrics.targetWeight })} className={chipClass(!!biometrics.targetWeight)}>{biometrics.targetWeight ? "Ja" : "Nein"}</button><input type="number" min={35} max={180} value={biometrics.targetWeightValue ?? ""} onChange={(e) => setBiometrics({ ...biometrics, targetWeightValue: Number(e.target.value) })} placeholder="kg" className={inputClass} /></div></RegisterPanel>
            <RegisterPanel title={t.fitnessLevel}><div className="grid grid-cols-3 gap-1.5"><button type="button" onClick={() => setBiometrics({ ...biometrics, fitnessLevel: "beginner" })} className={chipClass((biometrics.fitnessLevel ?? "beginner") === "beginner")}>{t.beginner}</button><button type="button" onClick={() => setBiometrics({ ...biometrics, fitnessLevel: "medium" })} className={chipClass((biometrics.fitnessLevel ?? "beginner") === "medium")}>{t.medium}</button><button type="button" onClick={() => setBiometrics({ ...biometrics, fitnessLevel: "pro" })} className={chipClass((biometrics.fitnessLevel ?? "beginner") === "pro")}>{t.pro}</button></div></RegisterPanel>
            <RegisterPanel title="Schlafdauer"><div className="grid grid-cols-3 gap-1.5"><button type="button" onClick={() => setBiometrics({ ...biometrics, sleepHours: "<6" })} className={chipClass((biometrics.sleepHours ?? "6-8") === "<6")}>{"< 6"}</button><button type="button" onClick={() => setBiometrics({ ...biometrics, sleepHours: "6-8" })} className={chipClass((biometrics.sleepHours ?? "6-8") === "6-8")}>6-8</button><button type="button" onClick={() => setBiometrics({ ...biometrics, sleepHours: ">8" })} className={chipClass((biometrics.sleepHours ?? "6-8") === ">8")}>{"> 8"}</button></div></RegisterPanel>
            <RegisterPanel title="Stress"><div className="grid grid-cols-5 gap-1.5">{[1,2,3,4,5].map((n) => <button key={n} type="button" onClick={() => setBiometrics({ ...biometrics, stressLevel: n })} className={chipClass((biometrics.stressLevel ?? 3) === n)}>{n}</button>)}</div></RegisterPanel>
            <div className="col-span-2"><RegisterPanel title={t.limitations}><div className="grid grid-cols-5 gap-1.5 text-xs">{["Rücken", "Knie", "Herz", "Asthma"].map((item) => { const selected = (biometrics.limitations ?? []).includes(item); return <button key={item} type="button" onClick={() => { const list = biometrics.limitations ?? []; const next = selected ? list.filter((value: string) => value !== item) : [...list, item]; setBiometrics({ ...biometrics, limitations: next }); }} className={chipClass(selected)}>{item}</button>; })}<input value={biometrics.otherRestriction ?? ""} onChange={(e) => setBiometrics({ ...biometrics, otherRestriction: e.target.value })} placeholder={otherText} className={`${inputClass} col-span-1`} /></div></RegisterPanel></div>
            <RegisterPanel title="Ernährung"><div className="grid grid-cols-3 gap-1.5"><button type="button" onClick={() => setBiometrics({ ...biometrics, nutrition: "all" })} className={chipClass((biometrics.nutrition ?? "all") === "all")}>Alles</button><button type="button" onClick={() => setBiometrics({ ...biometrics, nutrition: "vegetarian" })} className={chipClass((biometrics.nutrition ?? "all") === "vegetarian")}>Veggie</button><button type="button" onClick={() => setBiometrics({ ...biometrics, nutrition: "light" })} className={chipClass((biometrics.nutrition ?? "all") === "light")}>Leicht</button></div></RegisterPanel>
            <RegisterPanel title="Bewegung/Tag"><div className="grid grid-cols-3 gap-1.5"><button type="button" onClick={() => setBiometrics({ ...biometrics, natureMove: "15" })} className={chipClass((biometrics.natureMove ?? "60") === "15")}>{"<15"}</button><button type="button" onClick={() => setBiometrics({ ...biometrics, natureMove: "30" })} className={chipClass((biometrics.natureMove ?? "60") === "30")}>15-30</button><button type="button" onClick={() => setBiometrics({ ...biometrics, natureMove: "60" })} className={chipClass((biometrics.natureMove ?? "60") === "60")}>60+</button></div></RegisterPanel>
            <RegisterPanel title="Trinken"><div className="grid grid-cols-[1fr_70px] gap-2"><button type="button" onClick={() => setBiometrics({ ...biometrics, drinkReminder: (biometrics.drinkReminder ?? "yes") === "yes" ? "no" : "yes" })} className={chipClass((biometrics.drinkReminder ?? "yes") === "yes")}>Reminder</button><input type="number" step="0.1" value={biometrics.drinkAmount ?? 2.5} onChange={(e) => setBiometrics({ ...biometrics, drinkAmount: Number(e.target.value) })} className={inputClass} /></div></RegisterPanel>
            <RegisterPanel title={t.medication}><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setBiometrics({ ...biometrics, medication: "yes" })} className={chipClass((biometrics.medication ?? "no") === "yes")}>{t.yes}</button><button type="button" onClick={() => setBiometrics({ ...biometrics, medication: "no" })} className={chipClass((biometrics.medication ?? "no") === "no")}>{t.no}</button></div></RegisterPanel>
          </div>
        </div>

        <aside className="flex min-h-0 flex-col gap-3">
          <div className="relative flex-1 overflow-hidden rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm"><div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" /><div className="pointer-events-none absolute -bottom-20 left-1/4 h-56 w-56 rounded-full bg-emerald-300/15 blur-3xl" /><div className="relative mb-2 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100/70">Buddy-Auswahl</p><p className="text-xs text-white/70">{selectedBuddy.label} | {fitnessText} | BMI {bmi.toFixed(1)} {bmiLabel}</p></div><button type="button" className="rounded-xl bg-black/20 px-4 py-2 text-xs font-bold text-cyan-100 transition hover:bg-black/30">{t.scan}</button></div><div className="relative flex h-[calc(100%-54px)] flex-col items-center justify-center text-center"><div className="relative flex w-full items-center justify-center"><button type="button" onClick={() => moveBuddy(-1)} className="absolute left-2 z-10 grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/20 text-3xl font-black text-cyan-100 transition hover:bg-black/30" aria-label="Vorheriger Buddy">‹</button><div className="grid h-56 w-56 place-items-center rounded-full border border-white/20 bg-cyan-100/15 shadow-[0_0_60px_rgba(103,232,249,0.22)]"><img src={`/buddy/${selectedBuddy.file}`} alt={selectedBuddy.label} className="max-h-[205px] max-w-[205px] object-contain drop-shadow-[0_18px_35px_rgba(0,0,0,0.32)]" /></div><button type="button" onClick={() => moveBuddy(1)} className="absolute right-2 z-10 grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/20 text-3xl font-black text-cyan-100 transition hover:bg-black/30" aria-label="Nächster Buddy">›</button></div><div className="mt-4 text-4xl font-black text-cyan-100 drop-shadow-[0_0_14px_rgba(103,232,249,0.25)]">{selectedBuddy.label}</div><p className="mt-2 max-w-[420px] text-sm leading-relaxed text-white/70">{selectedBuddy.description}</p><div className="mt-4 flex items-center justify-center gap-2">{buddies.map((buddy) => <button key={buddy.id} type="button" onClick={() => selectBuddy(buddy)} aria-label={buddy.label} className={`h-2.5 rounded-full transition-all ${buddy.id === selectedBuddy.id ? "w-8 bg-cyan-200 shadow-[0_0_14px_rgba(103,232,249,0.5)]" : "w-2.5 bg-white/35 hover:bg-white/60"}`} />)}</div><div className="mt-4 rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-xs text-white/70">{selectedIndex + 1} von {buddies.length} | Mit Pfeilen wechseln oder Punkt auswählen.</div></div></div>
          <div className="flex justify-end"><div className="w-[220px]"><PrimaryButton onClick={onNext}>{t.next}</PrimaryButton></div></div>
        </aside>
      </div>
    </section>
  );
}
