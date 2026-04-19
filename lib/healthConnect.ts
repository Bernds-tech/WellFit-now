export type HealthConnectStatus = "web-not-supported" | "native-required" | "planned";

export type HealthConnectStepResult = {
  status: HealthConnectStatus;
  steps: number;
  source: "healthConnect";
  message: string;
};

export async function readHealthConnectSteps(): Promise<HealthConnectStepResult> {
  return {
    status: "native-required",
    steps: 0,
    source: "healthConnect",
    message:
      "Health Connect kann nicht direkt aus einer normalen Web-App gelesen werden. Dafür braucht WellFit eine Android-App bzw. eine native Bridge wie React Native/Expo, Capacitor oder Kotlin.",
  };
}

export const healthConnectRequiredPermissions = [
  "android.permission.health.READ_STEPS",
  "android.permission.health.READ_DISTANCE",
  "android.permission.health.READ_ACTIVE_CALORIES_BURNED",
  "android.permission.health.READ_EXERCISE",
];

export const healthConnectRoadmap = [
  "Android App / Native Bridge vorbereiten",
  "Health Connect SDK integrieren",
  "User Consent Screen bauen",
  "Steps für Tages-/Wochenmissionen lesen",
  "Aggregierte Tageswerte in Firestore trackingSessions speichern",
  "Anti-Cheat und Plausibilitätsprüfung ergänzen",
];
