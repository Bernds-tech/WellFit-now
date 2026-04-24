"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { loginContent, Language } from "./loginContent";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getLoginErrorMessage = (code: string | undefined, language: Language) => {
  const de: Record<string, string> = {
    "auth/invalid-email": "Bitte gib eine gültige E-Mail-Adresse ein.",
    "auth/user-disabled": "Dieses Konto wurde deaktiviert.",
    "auth/user-not-found": "Es wurde kein Konto mit dieser E-Mail-Adresse gefunden.",
    "auth/wrong-password": "Das Passwort ist nicht korrekt.",
    "auth/invalid-credential": "E-Mail oder Passwort ist nicht korrekt.",
    "auth/too-many-requests": "Zu viele Versuche. Bitte warte kurz und versuche es erneut.",
    "auth/network-request-failed": "Netzwerkfehler. Bitte prüfe deine Verbindung.",
  };
  const en: Record<string, string> = {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account was found for this email address.",
    "auth/wrong-password": "The password is incorrect.",
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "Network error. Please check your connection.",
  };
  return (language === "de" ? de : en)[code ?? ""] ?? (language === "de" ? "Anmeldung fehlgeschlagen. Bitte versuche es erneut." : "Login failed. Please try again.");
};

export default function LoginForm({ language }: { language: Language }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const t = loginContent[language];

  const handleLogin = async () => {
    if (isLoading) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) { setMessage(language === "de" ? "Bitte E-Mail und Passwort eingeben." : "Please enter email and password."); return; }
    if (!emailPattern.test(normalizedEmail)) { setMessage(language === "de" ? "Bitte gib eine gültige E-Mail-Adresse ein." : "Please enter a valid email address."); return; }
    try {
      setIsLoading(true);
      setMessage(language === "de" ? "Anmeldung läuft..." : "Signing in...");
      const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      await setDoc(doc(db, "users", credential.user.uid), { lastLoginAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, { merge: true });
      router.push("/dashboard");
    } catch (error: any) {
      setIsLoading(false);
      setMessage(getLoginErrorMessage(error?.code, language));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") handleLogin();
  };

  return (
    <div className="absolute right-24 top-[39%] w-[500px] rounded-[22px] border border-white/10 bg-white/5 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.16)] backdrop-blur-sm">
      <p className="mb-4 text-[22px] leading-snug text-white">{t.loginTitle}</p>

      <input
        type="email"
        placeholder={t.emailPlaceholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete="email"
        className="mb-3 h-[56px] w-full rounded-xl bg-white px-5 text-[17px] text-gray-700 outline-none focus:ring-4 focus:ring-cyan-300/35"
      />

      <div className="relative mb-3">
        <input
          type={showPassword ? "text" : "password"}
          placeholder={t.passwordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="current-password"
          className="h-[56px] w-full rounded-xl bg-white px-5 pr-14 text-[17px] text-gray-700 outline-none focus:ring-4 focus:ring-cyan-300/35"
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-gray-500"
          aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      </div>

      {message && <div className="mb-3 rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-cyan-50">{message}</div>}

      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="h-[58px] w-full rounded-xl bg-[#156fd1] text-[20px] font-bold transition hover:bg-[#0f63bb] disabled:cursor-not-allowed disabled:bg-gray-500"
      >
        {isLoading ? (language === "de" ? "Wird angemeldet..." : "Signing in...") : t.loginButton}
      </button>

      <div className="mt-4 text-center text-[16px] text-white/90">
        <span>{t.noAccount} </span>
        <Link href="/register" className="font-bold text-cyan-200 underline underline-offset-4 hover:text-white">
          {t.registerNow}
        </Link>
      </div>
    </div>
  );
}
