"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLegalLanguage } from "@/app/components/useLegalLanguage";

type Language = "de" | "en";

const content = {
  de: {
    headline: (
      <>
        Willkommen bei WellFit
        <br />
        auf deinem Abenteuer für Körper & Geist.
      </>
    ),
    intro: (
      <>
        Mach Bewegung zum Spiel,
        <br />
        erreiche neue Levels,
        <br />
        werde für deine Gesundheit
        <br />
        mit <span className="font-bold">WFT-Tokens</span> belohnt.
      </>
    ),
    comingSoon: "(Web3 Token-Integration coming soon!)",
    loginTitle: "Melde dich an, um deine Reise fortzusetzen.",
    emailPlaceholder: "E-Mail-Adresse eingeben",
    passwordPlaceholder: "Passwort eingeben",
    loginButton: "Anmelden",
    forgotPassword: "Passwort vergessen?",
    noAccount: "Noch keinen Account?",
    registerNow: "Jetzt Registrieren",
    privacy: "Datenschutz",
    imprint: "Impressum",
    terms: "AGB",
    faq: "FAQ",
    languageLabel: "Deutsch",
  },
  en: {
    headline: (
      <>
        Welcome to WellFit
        <br />
        on your adventure for body & mind.
      </>
    ),
    intro: (
      <>
        Turn movement into a game,
        <br />
        reach new levels,
        <br />
        and get rewarded for your health
        <br />
        with <span className="font-bold">WFT tokens</span>.
      </>
    ),
    comingSoon: "(Web3 token integration coming soon!)",
    loginTitle: "Sign in to continue your journey.",
    emailPlaceholder: "Enter your email address",
    passwordPlaceholder: "Enter your password",
    loginButton: "Sign In",
    forgotPassword: "Forgot password?",
    noAccount: "Don’t have an account yet?",
    registerNow: "Register Now",
    privacy: "Privacy",
    imprint: "Imprint",
    terms: "Terms",
    faq: "FAQ",
    languageLabel: "English",
  },
} as const;

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { language, setLanguage } = useLegalLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    setShowLanguageMenu(false);
  };

  const t = useMemo(() => content[language], [language]);

  const handleLogin = () => {
    router.push("/dashboard");
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden text-white">
      <Image
        src="/login-bg.png"
        alt="WellFit Hintergrund"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-cyan-900/10" />

      <div className="relative h-full w-full">
        {/* Logo */}
        <div className="absolute left-8 top-8 h-28 w-36 lg:h-36 lg:w-44">
          <Image
            src="/logo.png"
            alt="WellFit Logo"
            fill
            sizes="112px"
            priority
            className="object-contain object-left-top"
          />
        </div>

        {/* Sprache */}
        <div className="absolute right-12 top-10 z-20">
          <button
            type="button"
            onClick={() => setShowLanguageMenu((prev) => !prev)}
            className="flex items-center gap-3 text-2xl font-medium"
          >
            <Image
              src={language === "de" ? "/deutsch.png" : "/england.png"}
              alt={language === "de" ? "Deutsch" : "English"}
              width={34}
              height={22}
              className="rounded-sm object-cover"
            />
            <span>{t.languageLabel}</span>
            <span className="text-lg">⌄</span>
          </button>

          {showLanguageMenu && (
            <div className="mt-3 w-52 rounded-2xl border border-white/20 bg-black/30 p-2 backdrop-blur-md">
              <button
                type="button"
                onClick={() => changeLanguage("de")}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-white/10"
              >
                <Image
                  src="/deutsch.png"
                  alt="Deutsch"
                  width={28}
                  height={18}
                  style={{ width: 28, height: 18 }}
                  className="rounded-sm object-cover"
                />
                <span>Deutsch</span>
              </button>

              <button
                type="button"
                onClick={() => changeLanguage("en")}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-white/10"
              >
                <Image
                  src="/england.png"
                  alt="English"
                  width={28}
                  height={18}
                  style={{ width: 28, height: 18 }}
                  className="rounded-sm object-cover"
                />
                <span>English</span>
              </button>
            </div>
          )}
        </div>

        {/* Hauptüberschrift */}
        <div className="absolute left-1/2 top-[20%] w-[72%] -translate-x-1/2 text-center">
          <h1 className="text-5xl font-bold leading-[1.18] tracking-tight xl:text-6xl 2xl:text-[5.8rem]">
            {t.headline}
          </h1>
        </div>

        {/* Linker Beschreibungstext */}
        <div className="absolute bottom-40 left-20 max-w-[520px] text-left">
          <p className="text-[2.15rem] leading-[1.45] xl:text-[2.35rem]">
            {t.intro}
          </p>

          <p className="mt-6 text-lg text-white/55">{t.comingSoon}</p>
        </div>

        {/* Login rechts */}
        <div className="absolute right-24 top-[39%] w-[500px] rounded-[22px] bg-white/5 p-5">
          <p className="mb-4 text-[22px] leading-snug text-white">
            {t.loginTitle}
          </p>

          <input
            type="email"
            placeholder={t.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-3 h-[56px] w-full rounded-xl bg-white px-5 text-[17px] text-gray-700 outline-none"
          />

          <div className="relative mb-3">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[56px] w-full rounded-xl bg-white px-5 pr-14 text-[17px] text-gray-700 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-gray-500"
              aria-label={
                showPassword
                  ? language === "de"
                    ? "Passwort verbergen"
                    : "Hide password"
                  : language === "de"
                    ? "Passwort anzeigen"
                    : "Show password"
              }
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            onClick={handleLogin}
            className="h-[58px] w-full rounded-xl bg-[#156fd1] text-[20px] font-bold transition hover:bg-[#0f63bb]"
          >
            {t.loginButton}
          </button>

          <div className="mt-5 text-center text-[16px]">
            <button
              type="button"
              className="underline underline-offset-4 text-inherit"
            >
              {t.forgotPassword}
            </button>
          </div>

          <div className="mt-5 text-center text-[17px]">{t.noAccount}</div>

          <div className="mt-1 text-center text-[19px] font-bold">
            <Link href="/register" className="underline underline-offset-4">
              {t.registerNow}
            </Link>
          </div>
        </div>

        {/* Coin */}
        <div className="pointer-events-none absolute bottom-14 left-1/2 h-[105px] w-[105px] -translate-x-1/2 lg:h-[135px] lg:w-[135px]">
          <Image
            src="/coin.png"
            alt="WellFit Coin"
            fill
            className="object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.28)] spin-y"
          />
        </div>

        {/* Footer */}
        <footer className="absolute bottom-6 left-8 right-8 flex items-center justify-between text-[17px] text-white/90">
          <div className="flex gap-8">
            <Link href="/datenschutz">{t.privacy}</Link>
            <Link href="/impressum">{t.imprint}</Link>
            <Link href="/agb">{t.terms}</Link>
            <Link href="/faq">{t.faq}</Link>
          </div>

          <div className="flex items-center gap-6 text-[26px] font-bold">
            <span>f</span>
            <span>in</span>
            <span>x</span>
          </div>
        </footer>
      </div>
    </main>
  );
}