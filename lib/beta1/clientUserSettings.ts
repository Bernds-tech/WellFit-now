import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase";

export type UserAccountProfileInput = {
  displayName: string;
  phone: string;
  language: string;
  timeZone: string;
  units: string;
};

export type UserAccountProfileResult = {
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language: string;
  timeZone: string;
  units: string;
  timeZoneChanged: boolean;
  timeZoneChangeDeferred: boolean;
  nextTimeZoneChangeAt: string | null;
};

type RawResult = {
  accepted?: unknown;
  profile?: unknown;
  calendar?: unknown;
  serverValidationStatus?: unknown;
  economyFieldsChanged?: unknown;
  tokenAuthorized?: unknown;
  cashoutAllowed?: unknown;
  realMoney?: unknown;
};

function requireSignedInUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("Bitte melde dich an, um dein Profil zu speichern.");
  return user;
}

function settingsErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";
  const message = error instanceof Error ? error.message : "";
  const diagnostic = `${code} ${message}`.toLowerCase();
  if (diagnostic.includes("unauthenticated")) return "Deine Anmeldung ist abgelaufen.";
  if (diagnostic.includes("konto-initialisierung") || diagnostic.includes("initialisierung")) return "Bitte schließe zuerst die sichere Registrierung ab.";
  if (diagnostic.includes("timezone") || diagnostic.includes("zeitzone")) return "Die Zeitzone ist ungültig oder der Wechsel wurde vorübergehend zurückgestellt.";
  if (diagnostic.includes("telefon")) return "Die Telefonnummer enthält ungültige Zeichen.";
  return message || "Das Profil konnte nicht serverseitig gespeichert werden.";
}

function requiredString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value !== "string") throw new Error("Ungültige serverseitige Profilbestätigung.");
  return value;
}

function parseResult(value: RawResult): UserAccountProfileResult {
  if (
    value.accepted !== true
    || value.serverValidationStatus !== "server-profile-updated"
    || value.economyFieldsChanged !== false
    || value.tokenAuthorized !== false
    || value.cashoutAllowed !== false
    || value.realMoney !== false
    || !value.profile
    || typeof value.profile !== "object"
    || Array.isArray(value.profile)
    || !value.calendar
    || typeof value.calendar !== "object"
    || Array.isArray(value.calendar)
  ) {
    throw new Error("Ungültige serverseitige Profilbestätigung.");
  }
  const profile = value.profile as Record<string, unknown>;
  const calendar = value.calendar as Record<string, unknown>;
  return {
    displayName: requiredString(profile, "displayName"),
    firstName: requiredString(profile, "firstName"),
    lastName: requiredString(profile, "lastName"),
    email: requiredString(profile, "email"),
    phone: requiredString(profile, "phone"),
    language: requiredString(profile, "language"),
    timeZone: requiredString(profile, "timeZone"),
    units: requiredString(profile, "units"),
    timeZoneChanged: calendar.timeZoneChanged === true,
    timeZoneChangeDeferred: calendar.timeZoneChangeDeferred === true,
    nextTimeZoneChangeAt: typeof calendar.nextTimeZoneChangeAt === "string" ? calendar.nextTimeZoneChangeAt : null,
  };
}

export async function updateUserAccountProfile(input: UserAccountProfileInput): Promise<UserAccountProfileResult> {
  const user = requireSignedInUser();
  await user.getIdToken(true);
  try {
    const callable = httpsCallable<UserAccountProfileInput, RawResult>(
      getFunctions(),
      "updateUserAccountProfile",
    );
    const response = await callable({
      displayName: input.displayName.trim(),
      phone: input.phone.trim(),
      language: input.language,
      timeZone: input.timeZone.trim(),
      units: input.units,
    });
    return parseResult(response.data);
  } catch (error) {
    throw new Error(settingsErrorMessage(error), { cause: error });
  }
}
