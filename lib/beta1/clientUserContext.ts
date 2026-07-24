export type ClientCoordinates = {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
};

export function getClientTimeZone(): string {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return typeof timeZone === "string" && timeZone.trim() ? timeZone : "UTC";
  } catch {
    return "UTC";
  }
}

export function getClientDateKey(value = new Date()): string {
  const timeZone = getClientTimeZone();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function geolocationErrorMessage(error: GeolocationPositionError): string {
  if (error.code === error.PERMISSION_DENIED) return "Standortfreigabe wurde nicht erteilt. Es werden keine Orte in deiner Umgebung geladen.";
  if (error.code === error.POSITION_UNAVAILABLE) return "Dein aktueller Standort konnte nicht bestimmt werden.";
  if (error.code === error.TIMEOUT) return "Die Standortbestimmung hat zu lange gedauert.";
  return "Dein aktueller Standort konnte nicht sicher bestimmt werden.";
}

export function requestCurrentCoordinates(options?: PositionOptions): Promise<ClientCoordinates> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.reject(new Error("Standortdienste sind auf diesem Gerät nicht verfügbar."));
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Number(position.coords.latitude);
        const longitude = Number(position.coords.longitude);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          reject(new Error("Der gelesene Standort war ungültig."));
          return;
        }
        resolve({
          latitude,
          longitude,
          accuracyMeters: Number.isFinite(position.coords.accuracy) ? Math.max(0, position.coords.accuracy) : null,
        });
      },
      (error) => reject(new Error(geolocationErrorMessage(error), { cause: error })),
      {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 60000,
        ...options,
      },
    );
  });
}