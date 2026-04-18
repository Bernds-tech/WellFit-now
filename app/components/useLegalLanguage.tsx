"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type LegalLanguage = "de" | "en";

type LanguageContextValue = {
  language: LegalLanguage;
  setLanguage: (lang: LegalLanguage) => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguage] = useState<LegalLanguage>(() => {
    if (typeof window === "undefined") {
      return "de";
    }

    const savedLanguage = localStorage.getItem("wellfit-language") as LegalLanguage | null;

    return savedLanguage === "de" || savedLanguage === "en"
      ? savedLanguage
      : "de";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wellfit-language", language);
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLegalLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error(
      "useLegalLanguage must be used within a LanguageProvider"
    );
  }

  return context;
}
