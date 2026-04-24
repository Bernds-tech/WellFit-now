"use client";

import RegisterPanel from "./RegisterPanel";
import PrimaryButton from "@/app/components/PrimaryButton";
import { Language } from "../registerTypes";
import { getRegisterContent } from "../registerContent";

type Props = {
  language: Language;
  biometrics: any;
  setBiometrics: (value: any) => void;
  onNext: () => void;
};

const inputClass = "h-11 w-full rounded-lg bg-white/10 px-3 text-sm text-white outline-none";

export default function Step2Biometrics({ language, biometrics, setBiometrics, onNext }: Props) {
  const t = getRegisterContent(language);

  return (
    <section className="absolute inset-x-8 top-24 bottom-8 overflow-hidden">
      <div className="mb-4 text-center">
        <div className="text-xs font-bold tracking-[0.22em] text-cyan-100/55">{t.biometricsPhase}</div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white">{t.setupTitle}</h1>
      </div>

      <div className="grid h-[calc(100%-78px)] grid-cols-[1.25fr_0.9fr] gap-5">
        <div className="min-h-0 overflow-y-auto pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="grid grid-cols-2 gap-3">
            <RegisterPanel title={t.birthdate}>
              <input type="date" value={biometrics.birthdate ?? ""} onChange={(e) => setBiometrics({ ...biometrics, birthdate: e.target.value })} className={inputClass} />
            </RegisterPanel>

            <RegisterPanel title={t.gender}>
              <select value={biometrics.gender ?? "male"} onChange={(e) => setBiometrics({ ...biometrics, gender: e.target.value })} className={inputClass}>
                <option value="male">{t.male}</option>
                <option value="female">{t.female}</option>
                <option value="diverse">{t.diverse}</option>
              </select>
            </RegisterPanel>

            <RegisterPanel title={t.size}>
              <input type="range" min={140} max={220} value={biometrics.height ?? 180} onChange={(e) => setBiometrics({ ...biometrics, height: Number(e.target.value) })} className="w-full" />
              <div className="mt-2 text-center text-2xl font-extrabold text-cyan-100">{biometrics.height ?? 180} cm</div>
            </RegisterPanel>

            <RegisterPanel title={t.weight}>
              <input type="range" min={35} max={180} value={biometrics.weight ?? 82} onChange={(e) => setBiometrics({ ...biometrics, weight: Number(e.target.value) })} className="w-full" />
              <div className="mt-2 text-center text-2xl font-extrabold text-cyan-100">{biometrics.weight ?? 82} kg</div>
            </RegisterPanel>

            <RegisterPanel title={t.bodyType}>
              <select value={biometrics.bodyType ?? "slim"} onChange={(e) => setBiometrics({ ...biometrics, bodyType: e.target.value })} className={inputClass}>
                <option value="slim">{t.slim}</option>
                <option value="athletic">{t.athletic}</option>
                <option value="strong">{t.strong}</option>
              </select>
            </RegisterPanel>

            <RegisterPanel title={t.fitnessLevel}>
              <select value={biometrics.fitnessLevel ?? "beginner"} onChange={(e) => setBiometrics({ ...biometrics, fitnessLevel: e.target.value })} className={inputClass}>
                <option value="beginner">{t.beginner}</option>
                <option value="medium">{t.medium}</option>
                <option value="pro">{t.pro}</option>
              </select>
            </RegisterPanel>

            <div className="col-span-2">
              <RegisterPanel title={t.limitations}>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  {["Rücken", "Knie", "Herz", "Asthma"].map((item) => {
                    const selected = (biometrics.limitations ?? []).includes(item);
                    return (
                      <button key={item} type="button" onClick={() => {
                        const list = biometrics.limitations ?? [];
                        const next = selected ? list.filter((value: string) => value !== item) : [...list, item];
                        setBiometrics({ ...biometrics, limitations: next });
                      }} className={`rounded-xl px-3 py-2 font-semibold transition ${selected ? "bg-cyan-300 text-[#053841]" : "bg-white/10 text-white hover:bg-white/15"}`}>
                        {item}
                      </button>
                    );
                  })}
                </div>
              </RegisterPanel>
            </div>
          </div>
        </div>

        <aside className="flex min-h-0 flex-col gap-3">
          <div className="flex-1 rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
            <div className="mb-2 flex justify-end">
              <button type="button" className="rounded-xl bg-black/20 px-4 py-2 text-xs font-bold text-cyan-100">{t.scan}</button>
            </div>
            <div className="flex h-[calc(100%-54px)] flex-col items-center justify-center text-center">
              <div className="mb-5 h-28 w-28 rounded-full bg-cyan-100/15" />
              <div className="text-3xl font-extrabold text-cyan-100">FLAMMI</div>
              <div className="mt-2 text-sm text-white/70">Drachen-Klasse | Feuer-Element</div>
            </div>
          </div>

          <RegisterPanel title={t.medication}>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setBiometrics({ ...biometrics, medication: "yes" })} className={`rounded-xl px-3 py-2 font-semibold transition ${(biometrics.medication ?? "no") === "yes" ? "bg-cyan-300 text-[#053841]" : "bg-white/10 text-white hover:bg-white/15"}`}>{t.yes}</button>
              <button type="button" onClick={() => setBiometrics({ ...biometrics, medication: "no" })} className={`rounded-xl px-3 py-2 font-semibold transition ${(biometrics.medication ?? "no") === "no" ? "bg-cyan-300 text-[#053841]" : "bg-white/10 text-white hover:bg-white/15"}`}>{t.no}</button>
            </div>
          </RegisterPanel>

          <PrimaryButton onClick={onNext}>{t.next}</PrimaryButton>
        </aside>
      </div>
    </section>
  );
}
