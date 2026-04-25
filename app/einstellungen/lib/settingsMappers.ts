export const genderToDisplay = (gender?: string) =>
  gender === "female" ? "Weiblich" : gender === "diverse" ? "Divers" : "Männlich";

export const genderToStorage = (gender: string) =>
  gender === "Weiblich" ? "female" : gender === "Divers" ? "diverse" : "male";

export const bodyTypeToDisplay = (bodyType?: string) =>
  bodyType === "athletic" ? "Normal" : bodyType === "strong" ? "Kräftig" : "Schlank";

export const bodyTypeToStorage = (bodyType: string) =>
  bodyType === "Normal" ? "athletic" : bodyType === "Kräftig" ? "strong" : "slim";

export const fitnessLevelToDisplay = (fitnessLevel?: string) =>
  fitnessLevel === "medium" ? "Fortgeschritten" : fitnessLevel === "pro" ? "Aktiv" : "Anfänger";

export const fitnessLevelToStorage = (fitnessLevel: string) =>
  fitnessLevel === "Fortgeschritten" ? "medium" : fitnessLevel === "Aktiv" ? "pro" : "beginner";

export const arrayToText = (value: unknown, fallback = "") =>
  Array.isArray(value) ? value.join(", ") : typeof value === "string" ? value : fallback;

export const textToArray = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
