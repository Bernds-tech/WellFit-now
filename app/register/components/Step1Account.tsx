"use client";

import Link from "next/link";
import PrimaryButton from "@/app/components/PrimaryButton";
import { Language } from "../registerTypes";
import { getRegisterContent } from "../registerContent";

type Props = {
  language: Language;
  form: any;
  setForm: (form: any) => void;
  onNext: () => void;
};

const inputClass = "h-[50px] w-full rounded-xl bg-white px-4 text-[15px] text-gray-700 outline-none placeholder:text-gray-400";

export default function Step1Account({ language, form, setForm, onNext }: Props) {
  const t = getRegisterContent(language);

  return (
    <div className="absolute right-16 top-[14%] z-20 w-[500px] rounded-[34px] bg-cyan-500/25 px-7 py-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm">
      <h1 className="whitespace-pre-line text-[2.35rem] font-bold leading-[1.05] text-white">{t.step1Title}</h1>
      <p className="mt-3 text-[1rem] leading-[1.3] text-white/85">{t.step1Subtitle}</p>

      <div className="mt-5 space-y-3">
        <input placeholder={t.firstName} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputClass} />
        <input placeholder={t.lastName} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputClass} />
        <input type="email" placeholder={t.email} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
        <input type="password" placeholder={t.password} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} />
        <input type="password" placeholder={t.confirmPassword} value={form.confirmPassword ?? ""} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className={inputClass} />
      </div>

      <label className="mt-4 flex items-start gap-3 text-[0.88rem] leading-snug text-white/90">
        <input type="checkbox" checked={form.accepted ?? true} onChange={(e) => setForm({ ...form, accepted: e.target.checked })} className="mt-1 h-4 w-4 shrink-0" />
        <span>{t.acceptPrefix}<Link href="/datenschutz" className="underline">{t.privacyPolicy}</Link>{t.and}<Link href="/agb" className="underline">{t.terms}</Link></span>
      </label>

      <div className="mt-5">
        <PrimaryButton onClick={onNext}>{t.registerNow}</PrimaryButton>
      </div>
    </div>
  );
}
