import { registerContentDe } from "./registerContent.de";
import { registerContentEn } from "./registerContent.en";
import { Language } from "./registerTypes";

export const registerContent = {
  de: registerContentDe,
  en: registerContentEn,
} as const;

export const getRegisterContent = (lang: Language) => registerContent[lang];
