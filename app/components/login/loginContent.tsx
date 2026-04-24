import { ReactNode } from "react";

export type Language = "de" | "en";

type LoginContent = {
  headline: ReactNode;
  intro: ReactNode;
  comingSoon: string;
  loginTitle: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  loginButton: string;
  forgotPassword: string;
  noAccount: string;
  registerNow: string;
  privacy: string;
  imprint: string;
  terms: string;
  faq: string;
  languageLabel: string;
};

export const loginContent: Record<Language, LoginContent> = {
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
};
