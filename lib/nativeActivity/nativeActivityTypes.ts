export type NativeActivityPermissionState = "unknown" | "requesting" | "granted" | "denied" | "unavailable" | "error";

export type NativeActivitySource = "health-connect" | "healthkit" | "core-motion" | "android-step-counter";

export type NativeActivitySnapshot = {
  source: NativeActivitySource;
  permissionState: NativeActivityPermissionState;
  stepsToday: number;
  distanceMeters?: number;
  activeEnergyKcal?: number;
  floorsClimbed?: number;
  startedAt?: string;
  endedAt?: string;
  confidence: number;
  isNative: true;
  validationHints: string[];
};

export type NativeActivityBridgeStatus = {
  available: boolean;
  platform: "android" | "ios" | "web" | "unknown";
  permissionState: NativeActivityPermissionState;
  source?: NativeActivitySource;
  message: string;
};

export type NativeActivityBridge = {
  getStatus: () => Promise<NativeActivityBridgeStatus>;
  requestPermissions: () => Promise<NativeActivityBridgeStatus>;
  getTodaySnapshot: () => Promise<NativeActivitySnapshot>;
};
