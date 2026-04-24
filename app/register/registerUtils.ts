import { Language, PasswordStrength } from "./registerTypes";

export const getPasswordStrength = (password: string, language: Language): PasswordStrength => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-ZÄÖÜ]/.test(password),
    lowercase: /[a-zäöüß]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-zÄÖÜäöüß0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  const isStrongEnough = checks.length && checks.uppercase && checks.lowercase && checks.number && checks.special;

  if (!password) return {
    score: 0,
    label: language === "de" ? "Noch kein Passwort" : "No password yet",
    colorClass: "text-white/70",
    barClass: "bg-white/20",
    isStrongEnough: false,
    checks,
  };

  if (score <= 2) return {
    score,
    label: language === "de" ? "Schwach" : "Weak",
    colorClass: "text-red-200",
    barClass: "bg-red-400",
    isStrongEnough: false,
    checks,
  };

  if (score <= 4) return {
    score,
    label: language === "de" ? "Mittel" : "Medium",
    colorClass: "text-yellow-200",
    barClass: "bg-yellow-300",
    isStrongEnough: false,
    checks,
  };

  return {
    score,
    label: language === "de" ? "Stark" : "Strong",
    colorClass: "text-green-200",
    barClass: "bg-green-400",
    isStrongEnough,
    checks,
  };
};

// Mapping helpers: kept tolerant because registration, settings and future mobile clients may use slightly different option ids.
export const mapNutritionToSettings = (value: string) => {
  if (["vegetarian", "veggie"].includes(value)) return "Vegetarisch";
  if (value === "vegan") return "Vegan";
  if (value === "light") return "Leicht / gesundheitsbewusst";
  return "Ausgewogen";
};

export const mapDrinkReminderToSettings = (value: string) => value === "yes" ? "Normal" : "Niedrig";
export const mapSleepHoursToSettings = (value: string) => value === "<6" || value === "lt6" ? "5.5" : value === ">8" || value === "gt8" ? "8.5" : "7";
export const mapSleepQualityToSettings = (value: string) => value === "good" ? "Hoch" : value === "bad" ? "Niedrig" : "Mittel";
export const mapStressToSettings = (value: number) => value <= 2 ? "Niedrig" : value >= 4 ? "Hoch" : "Mittel";
export const mapEnergyToSettings = (value: number) => value <= 2 ? "Niedrig" : value >= 4 ? "Hoch" : "Mittel";
export const mapNatureMoveToSettings = (value: string) => value === "60" || value === "90" || value === ">60" ? "Häufig" : value === "30" ? "Regelmäßig" : "Gelegentlich";
export const mapActivityLevelToSettings = (value: string) => value === "low" ? "Kaum aktiv" : value === "sometimes" ? "Gelegentlich aktiv" : value === "regular" ? "Regelmäßig aktiv" : "Sehr aktiv";
export const mapTrainingTimeToSettings = (value: string) => value === "noon" ? "Mittags" : value === "evening" ? "Abends" : "Morgens";
export const mapCommunityModeToSettings = (value: string) => value === "solo" ? "Alleine" : value === "private" ? "Freunde & kleine Gruppen" : "Community & Events";
