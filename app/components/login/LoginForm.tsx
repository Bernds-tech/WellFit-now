"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { loginContent, Language } from "./loginContent";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getLoginErrorMessage = (code: string | undefined, language: Language) => {
  const neutral = language === "de" ? "E-Mail oder Passwort ist nicht korrekt." : "Email or password is incorrect.";
  const common: Record<string, string> = {
    "auth/invalid-email": language === "de" ? "Bitte gib eine gültige E-Mail-Adresse ein." : "Please enter a valid email address.",
    "auth/user-disabled": language === "de" ? "Dieses Konto wurde deaktiviert." : "This account has been disabled.",
    "auth/user-not-found": neutral,
    "auth/wrong-password": neutral,
    "auth/invalid-credential": neutral,
    "auth/too-many-requests": language === "de" ? "Zu viele Versuche. Bitte warte kurz und versuche es erneut." : "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed": language === "de" ? "Netzwerkfehler. Bitte prüfe deine Verbindung." : "Network error. Please check your connection.",
  };
  return common[code ?? ""] ?? (language === "de" ? "Anmeldung fehlgeschlagen. Bitte versuche es erneut." : "Login failed. Please try again.");
};

export default function LoginForm({ language }: { language: Language }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const t = loginContent[language];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsCheckingSession(false);
      if (user) router.replace("/dashboard");
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    if (isLoading || isCheckingSession) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) { setMessage(language === "de" ? "Bitte E-Mail und Passwort eingeben." : "Please enter email and password."); return; }
    if (!emailPattern.test(normalizedEmail)) { setMessage(language === "de" ? "Bitte gib eine gültige E-Mail-Adresse ein." : "Please enter a valid email address."); return; }
    try {
      setIsLoading(true);
      setMessage(language === "de" ? "Anmeldung läuft..." : "Signing in...");
      const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      await setDoc(doc(db, "users", credential.user.uid), { lastLoginAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, { merge: true });
      router.replace("/dashboard");
    } catch (error: any) {
      setIsLoading(false);
      setMessage(getLoginErrorMessage(error?.code, language));
    }
  };

  const handlePasswordReset = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !emailPattern.test(normalizedEmail)) { setMessage(language === "de" ? "Bitte gib zuerst deine E-Mail-Adresse ein." : "Please enter your email address first."); return; }
    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      setMessage(language === "de" ? "Wenn ein Konto existiert, wurde eine Reset-Mail gesendet." : "If an account exists, a reset email has been sent.");
    } catch {
      setMessage(language === "de" ? "Wenn ein Konto existiert, wurde eine Reset-Mail gesendet." : "If an account exists, a reset email has been sent.");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") handleLogin();
  };

  return (
    <div className="mx-auto w-full max-w-[450px] rounded-[28px] border border-white/15 bg-cyan-500/20 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-md lg:absolute lg:left-1/2 lg:top-[39%] lg:translate-x-[110px]">
      <div className="mb-5">
        <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">Login</div>
        <p className="mt-3 text-[22px] font-black leading-snug text-white">{t.loginTitle}</p>
        <p className="mt-1 text-sm text-white/70">{language === "de" ? "Willkommen zurück. Deine Missionen warten." : "Welcome back. Your missions are waiting."}</p>
      </div>

      <input type="email" placeholder={t.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} autoComplete="email" className="mb-3 h-[48px] w-full rounded-xl bg-white px-4 text-[15px] text-gray-700 outline-none transition focus:ring-4 focus:ring-cyan-300/35" />

      <div className="relative mb-2">
        <input type={showPassword ? "text" : "password"} placeholder={t.passwordPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} autoComplete="current-password" className="h-[48px] w-full rounded-xl bg-white px-4 pr-12 text-[15px] text-gray-700 outline-none transition focus:ring-4 focus:ring-cyan-300/35" />
        <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-800" aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}>{showPassword ? "🙈" : "👁️"}</button>
      </div>

      <div className="mb-3 text-right"><button type="button" onClick={handlePasswordReset} className="text-sm font-semibold text-cyan-100 underline underline-offset-4 transition hover:text-white">{language === "de" ? "Passwort vergessen?" : "Forgot password?"}</button></div>

      {message && <div className="mb-3 rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-cyan-50">{message}</div>}

      <button onClick={handleLogin} disabled={isLoading || isCheckingSession} className="h-[54px] w-full rounded-xl bg-gradient-to-r from-emerald-300 to-cyan-400 text-[18px] font-black text-[#053841] shadow-[0_12px_28px_rgba(6,182,212,0.25)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:scale-100 disabled:bg-gray-500 disabled:opacity-70">
        {isCheckingSession ? (language === "de" ? "Session prüfen..." : "Checking session...") : isLoading ? (language === "de" ? "Wird angemeldet..." : "Signing in...") : t.loginButton}
      </button>

      <div className="mt-4 text-center text-[15px] text-white/90"><span>{t.noAccount} </span><Link href="/register" className="font-bold text-cyan-100 underline underline-offset-4 hover:text-white">{t.registerNow}</Link></div>
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center text-xs font-semibold text-white/65">{language === "de" ? "Sicherer Firebase Login · WFT Punkte bleiben intern" : "Secure Firebase login · WFT points stay internal"}</div>
    </div>
  );
}
