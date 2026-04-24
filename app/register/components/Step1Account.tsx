"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import PrimaryButton from "@/app/components/PrimaryButton";
import { Language } from "../registerTypes";
import { getRegisterContent } from "../registerContent";
import { getPasswordStrength } from "../registerUtils";

type Props = {
  language: Language;
  form: any;
  setForm: (form: any) => void;
  onNext: () => void;
};

const inputClass = "h-[50px] w-full rounded-xl bg-white px-4 text-[15px] text-gray-700 outline-none placeholder:text-gray-400";

export default function Step1Account({ language, form, setForm, onNext }: Props) {
  const t = getRegisterContent(language);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordStrength = useMemo(() => getPasswordStrength(form.password ?? "", language), [form.password, language]);
  const checks = [
    ["length", language === "de" ? "mindestens 8 Zeichen" : "at least 8 characters"],
    ["uppercase", language === "de" ? "Großbuchstabe" : "uppercase letter"],
    ["lowercase", language === "de" ? "Kleinbuchstabe" : "lowercase letter"],
    ["number", language === "de" ? "Zahl" : "number"],
    ["special", language === "de" ? "Sonderzeichen" : "special character"],
  ] as const;

  return (
    <div className="absolute right-16 top-[10%] z-20 w-[500px] rounded-[34px] bg-cyan-500/25 px-7 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm">
      <h1 className="whitespace-pre-line text-[2.2rem] font-bold leading-[1.05] text-white">{t.step1Title}</h1>
      <p className="mt-2 text-[0.98rem] leading-[1.3] text-white/85">{t.step1Subtitle}</p>

      <div className="mt-4 space-y-2.5">
        <input placeholder={t.firstName} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputClass} />
        <input placeholder={t.lastName} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputClass} />
        <input type="email" placeholder={t.email} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />

        <div className="relative">
          <input type={showPassword ? "text" : "password"} placeholder={t.password} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`${inputClass} pr-20`} />
          <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {(form.password ?? "").length > 0 && (
          <div className="rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between">
              <span>{language === "de" ? "Passwort-Bedingungen" : "Password requirements"}</span>
              <span className={`font-bold ${passwordStrength.colorClass}`}>{passwordStrength.label}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div className={`h-full rounded-full ${passwordStrength.barClass}`} style={{ width: `${Math.max(passwordStrength.score, 1) * 20}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-1 gap-1 text-xs text-white/85">
              {checks.map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={passwordStrength.checks[key] ? "text-green-300" : "text-white/45"}>{passwordStrength.checks[key] ? "OK" : "--"}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative">
          <input type={showConfirmPassword ? "text" : "password"} placeholder={t.confirmPassword} value={form.confirmPassword ?? ""} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className={`${inputClass} pr-20`} />
          <button type="button" onClick={() => setShowConfirmPassword((prev) => !prev)} className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <label className="mt-3 flex items-start gap-3 text-[0.86rem] leading-snug text-white/90">
        <input type="checkbox" checked={form.accepted ?? true} onChange={(e) => setForm({ ...form, accepted: e.target.checked })} className="mt-1 h-4 w-4 shrink-0" />
        <span>{t.acceptPrefix}<Link href="/datenschutz" className="underline">{t.privacyPolicy}</Link>{t.and}<Link href="/agb" className="underline">{t.terms}</Link></span>
      </label>

      <div className="mt-4">
        <PrimaryButton onClick={onNext}>{t.registerNow}</PrimaryButton>
      </div>
    </div>
  );
}
