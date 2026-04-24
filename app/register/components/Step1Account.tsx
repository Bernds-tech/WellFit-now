"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import PrimaryButton from "@/app/components/PrimaryButton";
import { Language } from "../registerTypes";
import { getRegisterContent } from "../registerContent";
import { getPasswordStrength } from "../registerUtils";

type Props = { language: Language; form: any; setForm: (form: any) => void; onNext: () => void; };

const inputClass = "h-[50px] w-full rounded-xl border border-white/10 bg-white px-4 text-[15px] text-gray-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] outline-none transition duration-200 placeholder:text-gray-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/35";
const fieldWrapClass = "relative rounded-2xl transition duration-200 focus-within:scale-[1.01] focus-within:drop-shadow-[0_0_16px_rgba(34,211,238,0.35)]";

function EyeIcon({ hidden }: { hidden: boolean }) {
  if (hidden) return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M3 3l18 18" /><path d="M10.6 10.6A2 2 0 0 0 13.4 13.4" /><path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.7 4.1 10 8a11.9 11.9 0 0 1-2.1 3.5" /><path d="M6.1 6.1A12 12 0 0 0 2 12c1.3 3.9 5 8 10 8a10.8 10.8 0 0 0 4.1-.8" /></svg>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>;
}

export default function Step1Account({ language, form, setForm, onNext }: Props) {
  const t = getRegisterContent(language);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordStrength = useMemo(() => getPasswordStrength(form.password ?? "", language), [form.password, language]);
  const completedFields = [form.firstName, form.lastName, form.email, form.password, form.confirmPassword].filter(Boolean).length + (form.accepted ? 1 : 0);
  const setupProgress = Math.round((completedFields / 6) * 100);
  const buddyMood = passwordStrength.isStrongEnough ? (language === "de" ? "Starkes Startsignal" : "Strong start signal") : setupProgress > 35 ? (language === "de" ? "Flammi wird wach" : "Flammi is waking up") : (language === "de" ? "Flammi wartet" : "Flammi is waiting");
  const hasPassword = (form.password ?? "").length > 0;
  const checks = [["length", language === "de" ? "mindestens 8 Zeichen" : "at least 8 characters"], ["uppercase", language === "de" ? "Grossbuchstabe" : "uppercase letter"], ["lowercase", language === "de" ? "Kleinbuchstabe" : "lowercase letter"], ["number", language === "de" ? "Zahl" : "number"], ["special", language === "de" ? "Sonderzeichen" : "special character"]] as const;

  return (
    <div className="absolute right-16 top-[8%] z-20 flex h-[760px] w-[520px] flex-col overflow-hidden rounded-[34px] border border-white/20 bg-cyan-500/25 px-7 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-md">
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="relative mb-4 flex items-center justify-between gap-4 rounded-2xl border border-white/15 bg-black/15 px-4 py-3"><div><p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-100/80">Phase 01</p><p className="mt-1 text-sm font-semibold text-white/90">{language === "de" ? "Account-Erstellung" : "Account creation"}</p></div><div className="flex items-center gap-3"><div className="text-right"><p className="text-xs text-white/70">{buddyMood}</p><p className="text-lg font-black text-white">{setupProgress}%</p></div><div className="grid h-12 w-12 place-items-center rounded-full bg-white/20 text-2xl shadow-[0_0_20px_rgba(103,232,249,0.35)]">🐉</div></div></div>
      <h1 className="relative whitespace-pre-line text-[2.2rem] font-black leading-[1.05] text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.2)]">{t.step1Title}</h1>
      <p className="relative mt-2 text-[0.98rem] leading-[1.3] text-white/85">{t.step1Subtitle}</p>
      <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400 transition-all duration-500" style={{ width: `${setupProgress}%` }} /></div>
      <div className="relative mt-4 space-y-2.5">
        <div className={fieldWrapClass}><input placeholder={t.firstName} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputClass} /></div>
        <div className={fieldWrapClass}><input placeholder={t.lastName} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputClass} /></div>
        <div className={fieldWrapClass}><input type="email" placeholder={t.email} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} /></div>
        <div className={fieldWrapClass}><input type={showPassword ? "text" : "password"} placeholder={t.password} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`${inputClass} pr-14`} /><button type="button" onClick={() => setShowPassword((prev) => !prev)} aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-400"><EyeIcon hidden={showPassword} /></button></div>
        <div className="h-[98px] overflow-hidden"><div className={`h-full rounded-2xl border border-white/20 bg-black/25 px-4 py-2 text-xs text-white shadow-[0_8px_25px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-all duration-300 ease-out ${hasPassword ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-2 scale-[0.98] opacity-0"}`}><div className="mb-1.5 flex items-center justify-between"><span className="font-semibold">{language === "de" ? "Passwort-XP" : "Password XP"}</span><span className={`font-black ${passwordStrength.colorClass}`}>{passwordStrength.label}</span></div><div className="h-2 w-full overflow-hidden rounded-full bg-white/20"><div className={`h-full rounded-full ${passwordStrength.barClass} transition-all duration-500`} style={{ width: `${Math.max(passwordStrength.score, 1) * 20}%` }} /></div><div className="mt-2 grid grid-cols-3 gap-1 text-[10px] text-white/85">{checks.map(([key, label]) => <div key={key} className="flex items-center gap-1 rounded-md bg-white/5 px-1.5 py-0.5 transition-colors duration-300"><span className={passwordStrength.checks[key] ? "text-green-300" : "text-white/45"}>{passwordStrength.checks[key] ? "OK" : "-"}</span><span className="truncate">{label}</span></div>)}</div></div></div>
        <div className={fieldWrapClass}><input type={showConfirmPassword ? "text" : "password"} placeholder={t.confirmPassword} value={form.confirmPassword ?? ""} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className={`${inputClass} pr-14`} /><button type="button" onClick={() => setShowConfirmPassword((prev) => !prev)} aria-label={showConfirmPassword ? "Passwortbestaetigung verbergen" : "Passwortbestaetigung anzeigen"} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-400"><EyeIcon hidden={showConfirmPassword} /></button></div>
      </div>
      <div className="relative mt-auto"><label className="mb-3 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5 text-[0.86rem] leading-snug text-white/90 transition hover:bg-white/15"><input type="checkbox" checked={form.accepted ?? true} onChange={(e) => setForm({ ...form, accepted: e.target.checked })} className="mt-1 h-4 w-4 shrink-0 accent-cyan-300" /><span>{t.acceptPrefix}<Link href="/datenschutz" className="font-semibold underline">{t.privacyPolicy}</Link>{t.and}<Link href="/agb" className="font-semibold underline">{t.terms}</Link></span></label><PrimaryButton onClick={onNext}>{t.registerNow}</PrimaryButton></div>
    </div>
  );
}
